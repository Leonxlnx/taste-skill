/**
 * webgl/gl/device.ts — the shared WebGL2 backend + an injectable interface.
 *
 * `RenderBackend` is the seam between the renderer's (testable) orchestration
 * and the (headless-untestable) GL calls: the renderer holds a backend and one
 * `RunHandle` per text instance and never touches `gl` directly. The real
 * `WebGL2Backend` owns ONE shared canvas + context + program + shared slice-grid
 * geometry + the shared MSDF atlas texture for the WHOLE page (RESEARCH §2:
 * layer-memory discipline — never a context per element). A `NullBackend`-shaped
 * mock in tests verifies single-context reuse, context-loss re-init, and draw
 * scheduling without a GPU.
 *
 * Design recommendation to the architect (benchmark deferred — no GPU here):
 * ONE fixed full-viewport shared canvas + per-instance viewport+scissor from the
 * host's screen rect. The alternative (a positioned canvas per element) forces a
 * context per element, which is exactly the layer-memory cost RESEARCH §2 warns
 * against — so a shared context REQUIRES the single-canvas+scissor design.
 */
import type { PackedLUTAtlas } from '../lut-texture';
import type { MSDFBitmap } from '../msdf/generator';
import type { RGBAColor } from '../types';
import { buildSliceGrid } from '../slice-grid';
import { VERTEX_SHADER, FRAGMENT_SHADER } from './shaders';

export interface Region {
  /** CSS px, origin top-left of the shared canvas viewport. */
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Static per-run GPU inputs — provided at build AND rebuilt on context restore. */
export interface GlyphRunData {
  /** Interleaved static per-glyph instance attributes (9 floats/glyph). */
  instances: Float32Array;
  instanceCount: number;
  /** This run's cumulative-flex LUTs, packed row-per-glyph. */
  lutAtlas: PackedLUTAtlas;
  /** Slice count (grid resolution). */
  slices: number;
}

export interface FrameParams {
  region: Region;
  /** Device pixel ratio (CSS px region → device-px scissor/viewport). */
  dpr: number;
  stretch: number;
  origin: number;
  color: RGBAColor;
  pxRange: number;
  atlasSize: number;
  grain: number;
  aberration: number;
  stretchDir: [number, number];
  time: number;
  dispIntensity: number;
  dispScale: [number, number];
}

export interface RunHandle {
  /** (Re)upload static run data. Called at build and on context restore. */
  upload(data: GlyphRunData): void;
  /** Issue the instanced, scissored draw for this run. */
  draw(params: FrameParams): void;
  dispose(): void;
}

export interface RenderBackend {
  readonly supported: boolean;
  readonly canvas: HTMLCanvasElement | null;
  isContextLost(): boolean;
  /** Size the shared drawing buffer to the viewport at the given DPR. */
  ensureSize(cssWidth: number, cssHeight: number, dpr: number): void;
  /** Ensure the shared MSDF atlas texture exists at `size` texels (square). */
  ensureAtlas(size: number): void;
  /** Upload one MSDF glyph cell into the shared atlas at device-texel (x,y). */
  uploadAtlasCell(x: number, y: number, bitmap: MSDFBitmap): void;
  /**
   * Clear the shared drawing buffer ONCE per frame. Instances share one canvas,
   * so the first instance to draw this frame (unique `token`, e.g. the ticker
   * `now`) clears the whole buffer; later instances with the same token are
   * no-ops. Avoids instances erasing each other and prevents scroll trails.
   */
  beginFrame(token: number): void;
  /**
   * Upload (or clear) the shared displacement noise texture. Optional: a mock
   * backend may omit it. `null` clears. Zero-cost until a renderer with an
   * enabled `displacement` effect decodes its image (obligation 3).
   */
  setNoise?(image: TexImageSource | null): void;
  createRun(): RunHandle;
  onContextLost(cb: () => void): () => void;
  onContextRestored(cb: () => void): () => void;
  /** Number of GL contexts created (single-context invariant test). */
  readonly contextCreationCount: number;
  destroy(): void;
}

// ── real WebGL2 backend (inspection-verified; no headless GL to run it) ───────

const FLOATS_PER_INSTANCE = 9;

interface GlProgramState {
  program: WebGLProgram;
  gridBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  indexCount: number;
  atlasTex: WebGLTexture | null;
  atlasSize: number;
  uniforms: Record<string, WebGLUniformLocation | null>;
}

class WebGL2Run implements RunHandle {
  private vao: WebGLVertexArrayObject | null = null;
  private instanceBuffer: WebGLBuffer | null = null;
  private lutTex: WebGLTexture | null = null;
  private lutWidth = 0;
  private lutHeight = 0;
  private instanceCount = 0;
  private slices = 0;
  private readonly backend: WebGL2Backend;

  constructor(backend: WebGL2Backend) {
    this.backend = backend;
  }

  upload(data: GlyphRunData): void {
    const gl = this.backend.glOrNull;
    if (!gl) return;
    const st = this.backend.state;
    if (!st) return;

    this.instanceCount = data.instanceCount;
    this.slices = data.slices;

    if (!this.vao) this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    // shared grid geometry (position + element buffer live on the backend)
    gl.bindBuffer(gl.ARRAY_BUFFER, st.gridBuffer);
    const aBox = gl.getAttribLocation(st.program, 'a_boxCoord');
    gl.enableVertexAttribArray(aBox);
    gl.vertexAttribPointer(aBox, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(aBox, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, st.indexBuffer);

    // instanced static per-glyph attributes
    if (!this.instanceBuffer) this.instanceBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.instances, gl.STATIC_DRAW);
    const stride = FLOATS_PER_INSTANCE * 4;
    const attr = (name: string, size: number, offsetFloats: number): void => {
      const loc = gl.getAttribLocation(st.program, name);
      if (loc < 0) return;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offsetFloats * 4);
      gl.vertexAttribDivisor(loc, 1);
    };
    attr('a_glyphOrigin', 1, 0);
    attr('a_glyphWidth', 1, 1);
    attr('a_glyphY', 2, 2);
    attr('a_atlasUVOrigin', 2, 4);
    attr('a_atlasUVSize', 2, 6);
    attr('a_lutRow', 1, 8);

    // per-run LUT texture (R32F, width=N+1, height=glyphCount), NEAREST
    if (!this.lutTex) this.lutTex = gl.createTexture();
    this.lutWidth = data.lutAtlas.width;
    this.lutHeight = data.lutAtlas.height;
    gl.bindTexture(gl.TEXTURE_2D, this.lutTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (this.lutWidth > 0 && this.lutHeight > 0) {
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.R32F, this.lutWidth, this.lutHeight, 0, gl.RED, gl.FLOAT,
        data.lutAtlas.data,
      );
    }
    gl.bindVertexArray(null);
  }

  draw(p: FrameParams): void {
    const gl = this.backend.glOrNull;
    const st = this.backend.state;
    if (!gl || !st || !this.vao || this.instanceCount === 0) return;

    gl.useProgram(st.program);
    gl.bindVertexArray(this.vao);

    // scissor + viewport to this instance's screen rect (shared canvas).
    // Region is CSS px; scissor/viewport are device px (GL y-up origin).
    const dpr = p.dpr;
    const bufH = gl.drawingBufferHeight;
    const dx = Math.round(p.region.x * dpr);
    const dw = Math.round(p.region.w * dpr);
    const dh = Math.round(p.region.h * dpr);
    const sy = bufH - Math.round((p.region.y + p.region.h) * dpr); // GL y-up origin
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(dx, sy, dw, dh);
    gl.viewport(dx, sy, dw, dh);

    // premultiplied-alpha blending over arbitrary page backgrounds.
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const u = st.uniforms;
    gl.uniform1f(u.u_stretch!, p.stretch);
    gl.uniform1f(u.u_origin!, p.origin); // region-relative; viewport positions the region
    gl.uniform2f(u.u_viewport!, p.region.w, p.region.h); // CSS px, matches posX/posY units
    gl.uniform4f(u.u_color!, p.color.r, p.color.g, p.color.b, p.color.a);
    gl.uniform1f(u.u_pxRange!, p.pxRange);
    gl.uniform2f(u.u_atlasSize!, st.atlasSize, st.atlasSize);
    gl.uniform1f(u.u_grainIntensity!, p.grain);
    gl.uniform1f(u.u_aberration!, p.aberration);
    gl.uniform2f(u.u_stretchDir!, p.stretchDir[0], p.stretchDir[1]);
    gl.uniform1f(u.u_time!, p.time);
    gl.uniform1f(u.u_dispIntensity!, p.dispIntensity);
    gl.uniform2f(u.u_dispScale!, p.dispScale[0], p.dispScale[1]);
    gl.uniform2i(u.u_lutSize!, this.lutWidth, this.lutHeight);

    // texture units: 0 = MSDF atlas, 1 = LUT, 2 = noise (bound by backend if any)
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, st.atlasTex);
    gl.uniform1i(u.u_msdfAtlas!, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.lutTex);
    gl.uniform1i(u.u_lut!, 1);
    this.backend.bindNoise(2, u.u_noise, u.u_hasNoise);

    gl.drawElementsInstanced(gl.TRIANGLES, st.indexCount, gl.UNSIGNED_SHORT, 0, this.instanceCount);

    gl.disable(gl.SCISSOR_TEST);
    gl.bindVertexArray(null);
  }

  dispose(): void {
    const gl = this.backend.glOrNull;
    if (!gl) return;
    if (this.vao) gl.deleteVertexArray(this.vao);
    if (this.instanceBuffer) gl.deleteBuffer(this.instanceBuffer);
    if (this.lutTex) gl.deleteTexture(this.lutTex);
    this.vao = null;
    this.instanceBuffer = null;
    this.lutTex = null;
  }
}

export class WebGL2Backend implements RenderBackend {
  readonly canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext | null = null;
  state: GlProgramState | null = null;
  private lostCbs = new Set<() => void>();
  private restoredCbs = new Set<() => void>();
  private _creations = 0;
  private noiseTex: WebGLTexture | null = null;
  private readonly gridSlices: number;

  constructor(canvas: HTMLCanvasElement, slices: number) {
    this.canvas = canvas;
    this.gridSlices = slices;
    canvas.addEventListener('webglcontextlost', this.onLost as EventListener, false);
    canvas.addEventListener('webglcontextrestored', this.onRestored as EventListener, false);
    this.initContext();
  }

  get glOrNull(): WebGL2RenderingContext | null {
    return this.gl;
  }
  get supported(): boolean {
    return this.gl !== null;
  }
  get contextCreationCount(): number {
    return this._creations;
  }

  isContextLost(): boolean {
    return !this.gl || this.gl.isContextLost();
  }

  private onLost = (e: Event): void => {
    e.preventDefault(); // REQUIRED so the context can be restored (obligation 1)
    this.state = null;
    for (const cb of this.lostCbs) cb();
  };

  private onRestored = (): void => {
    this.initContext();
    for (const cb of this.restoredCbs) cb(); // renderers re-upload run data + atlas
  };

  private initContext(): void {
    const gl = this.canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    }) as WebGL2RenderingContext | null;
    if (!gl) {
      this.gl = null;
      return;
    }
    this.gl = gl;
    this._creations++;
    this.buildProgram();
  }

  private buildProgram(): void {
    const gl = this.gl!;
    const compile = (type: number, src: string): WebGLShader => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(sh);
        gl.deleteShader(sh);
        throw new Error(`[fontuccine/webgl] shader compile failed: ${log}`);
      }
      return sh;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`[fontuccine/webgl] link failed: ${gl.getProgramInfoLog(program)}`);
    }

    const grid = buildSliceGrid(this.gridSlices);
    const gridBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, grid.boxCoords, gl.STATIC_DRAW);
    const indexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, grid.indices, gl.STATIC_DRAW);

    const uNames = [
      'u_lut', 'u_lutSize', 'u_stretch', 'u_origin', 'u_viewport', 'u_msdfAtlas',
      'u_color', 'u_pxRange', 'u_atlasSize', 'u_grainIntensity', 'u_aberration',
      'u_stretchDir', 'u_time', 'u_dispIntensity', 'u_dispScale', 'u_noise', 'u_hasNoise',
    ];
    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    for (const n of uNames) uniforms[n] = gl.getUniformLocation(program, n);

    this.state = {
      program,
      gridBuffer,
      indexBuffer,
      indexCount: grid.indices.length,
      atlasTex: null,
      atlasSize: 0,
      uniforms,
    };
  }

  ensureSize(cssWidth: number, cssHeight: number, dpr: number): void {
    const w = Math.max(1, Math.round(cssWidth * dpr));
    const h = Math.max(1, Math.round(cssHeight * dpr));
    if (this.canvas.width !== w) this.canvas.width = w;
    if (this.canvas.height !== h) this.canvas.height = h;
  }

  ensureAtlas(size: number): void {
    const gl = this.gl;
    const st = this.state;
    if (!gl || !st) return;
    if (st.atlasTex && st.atlasSize === size) return;
    if (st.atlasTex) gl.deleteTexture(st.atlasTex);
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    st.atlasTex = tex;
    st.atlasSize = size;
  }

  uploadAtlasCell(x: number, y: number, bitmap: MSDFBitmap): void {
    const gl = this.gl;
    const st = this.state;
    if (!gl || !st || !st.atlasTex) return;
    gl.bindTexture(gl.TEXTURE_2D, st.atlasTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texSubImage2D(
      gl.TEXTURE_2D, 0, x, y, bitmap.width, bitmap.height, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array(bitmap.data.buffer),
    );
  }

  /** Bind the (optional) displacement noise texture to a unit; sets u_hasNoise. */
  bindNoise(unit: number, uNoise: WebGLUniformLocation | null, uHas: WebGLUniformLocation | null): void {
    const gl = this.gl;
    if (!gl) return;
    if (this.noiseTex && uNoise) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, this.noiseTex);
      gl.uniform1i(uNoise, unit);
      if (uHas) gl.uniform1i(uHas, 1);
    } else if (uHas) {
      gl.uniform1i(uHas, 0);
    }
  }

  /** Upload a decoded displacement noise image (RGBA, repeat-wrapped). */
  setNoise(image: TexImageSource | null): void {
    const gl = this.gl;
    if (!gl) return;
    if (!image) {
      if (this.noiseTex) gl.deleteTexture(this.noiseTex);
      this.noiseTex = null;
      return;
    }
    if (!this.noiseTex) this.noiseTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.noiseTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  }

  private lastFrameToken = Number.NaN;
  beginFrame(token: number): void {
    const gl = this.gl;
    if (!gl) return;
    if (token === this.lastFrameToken) return; // already cleared this frame
    this.lastFrameToken = token;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(0, 0, 0, 0); // premultiplied transparent
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  createRun(): RunHandle {
    return new WebGL2Run(this);
  }

  onContextLost(cb: () => void): () => void {
    this.lostCbs.add(cb);
    return () => this.lostCbs.delete(cb);
  }
  onContextRestored(cb: () => void): () => void {
    this.restoredCbs.add(cb);
    return () => this.restoredCbs.delete(cb);
  }

  destroy(): void {
    this.canvas.removeEventListener('webglcontextlost', this.onLost as EventListener);
    this.canvas.removeEventListener('webglcontextrestored', this.onRestored as EventListener);
    const gl = this.gl;
    if (gl && this.state) {
      gl.deleteProgram(this.state.program);
      gl.deleteBuffer(this.state.gridBuffer);
      gl.deleteBuffer(this.state.indexBuffer);
      if (this.state.atlasTex) gl.deleteTexture(this.state.atlasTex);
    }
    if (gl && this.noiseTex) gl.deleteTexture(this.noiseTex);
    this.lostCbs.clear();
    this.restoredCbs.clear();
    this.state = null;
    this.gl = null;
  }
}
