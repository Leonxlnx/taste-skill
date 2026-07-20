import { vertexShaderSource } from './vertex-shader.js';

const DEFAULT_MAX_PIXEL_COUNT: number = 1920 * 1080 * 4;

export class ShaderMount {
  public parentElement: PaperShaderElement;
  public canvasElement: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private uniformLocations: Record<string, WebGLUniformLocation | null> = {};
  /** The fragment shader that we are using */
  private fragmentShader: string;
  /** Stores the RAF for the render loop */
  private rafId: number | null = null;
  /** Time of the last rendered frame */
  private lastRenderTime = 0;
  /** Total time that we have played any animation, passed as a uniform to the shader for time-based VFX */
  private currentFrame = 0;
  /** The speed that we progress through animation time (multiplies by delta time every update). Allows negatives to play in reverse. If set to 0, rAF will stop entirely so static shaders have no recurring performance costs */
  private speed = 0;
  /** Actual speed used that accounts for visibility: we pause the shader if the tab is hidden or the element out of the viewport */
  private currentSpeed = 0;
  /** Uniforms that are provided by the user for the specific shader being mounted (not including uniforms that this Mount adds, like time and resolution) */
  private providedUniforms: ShaderMountUniforms;
  /** Names of the uniforms that should have mipmaps generated for them */
  private mipmaps: string[] = [];
  /** Just a sanity check to make sure frames don't run after we're disposed */
  private hasBeenDisposed = false;
  /** If the resolution of the canvas has changed since the last render */
  private resolutionChanged = true;
  /** Store textures that are provided by the user */
  private textures: Map<string, WebGLTexture> = new Map();
  private minPixelRatio;
  private maxPixelCount;
  private isSafari = isSafari();
  private uniformCache: Record<string, unknown> = {};
  private textureUnitMap: Map<string, number> = new Map();
  private ownerDocument: Document;

  constructor(
    /** The div you'd like to mount the shader to. The shader will match its size. */
    parentElement: HTMLElement,
    fragmentShader: string,
    uniforms: ShaderMountUniforms,
    webGlContextAttributes?: WebGLContextAttributes,
    /** The speed of the animation, or 0 to stop it. Supports negative values to play in reverse. */
    speed = 0,
    /** Pass a frame to offset the starting u_time value and give deterministic results*/
    frame = 0,
    /**
     * The minimum pixel ratio to render at, defaults to 2.
     * May be reduced to improve performance or increased together with `maxPixelCount` to improve antialiasing.
     */
    minPixelRatio = 2,
    /**
     * The maximum amount of physical device pixels to render for the shader,
     * by default it's 1920 * 1080 * 2x dpi (per each side) = 8,294,400 pixels of a 4K screen.
     * Actual DOM size of the canvas can be larger, it will just lose quality after this.
     *
     * May be reduced to improve performance or increased to improve quality on high-resolution screens.
     */
    maxPixelCount: number = DEFAULT_MAX_PIXEL_COUNT,
    /** Names of the uniforms that should have mipmaps generated for them */
    mipmaps: string[] = []
  ) {
    // nodeType check instead of `instanceof` to work across document boundaries (iframes, PiP windows)
    if (parentElement?.nodeType === 1) {
      this.parentElement = parentElement as PaperShaderElement;
    } else {
      throw new Error('Paper Shaders: parent element must be an HTMLElement');
    }

    this.ownerDocument = parentElement.ownerDocument;

    if (!this.ownerDocument.querySelector('style[data-paper-shader]')) {
      const styleElement = this.ownerDocument.createElement('style');
      styleElement.innerHTML = defaultStyle;
      styleElement.setAttribute('data-paper-shader', '');
      this.ownerDocument.head.prepend(styleElement);
    }

    // Create the canvas element and mount it into the provided element
    const canvasElement = this.ownerDocument.createElement('canvas');
    this.canvasElement = canvasElement;
    this.parentElement.prepend(canvasElement);
    this.fragmentShader = fragmentShader;
    this.providedUniforms = uniforms;
    this.mipmaps = mipmaps;
    // Base our starting animation time on the provided frame value
    this.currentFrame = frame;
    this.minPixelRatio = minPixelRatio;
    this.maxPixelCount = maxPixelCount;

    const gl = canvasElement.getContext('webgl2', webGlContextAttributes);
    if (!gl) {
      throw new Error('Paper Shaders: WebGL is not supported in this browser');
    }
    this.gl = gl;

    this.initProgram();
    this.setupPositionAttribute();
    // Grab the locations of the uniforms in the fragment shader
    this.setupUniforms();
    // Put the user provided values into the uniforms
    this.setUniformValues(this.providedUniforms);
    // Set up the resize observer to handle window resizing and set u_resolution
    this.setupResizeObserver();
    // Set up the visual viewport change listener to handle zoom changes (pinch zoom and classic browser zoom)
    visualViewport?.addEventListener('resize', this.handleVisualViewportChange);
    // Set up the intersection observer to pause animation when the element is scrolled out of view
    this.setupIntersectionObserver();

    // Set the animation speed after everything is ready to go
    this.setSpeed(speed);

    // Mark parent element as paper shader mount
    this.parentElement.setAttribute('data-paper-shader', '');

    // Add the shaderMount instance to the div mount element to make it easily accessible
    this.parentElement.paperShaderMount = this;

    // Listen for document visibility changes to pause the shader when the tab is hidden
    this.ownerDocument.addEventListener('visibilitychange', this.handleDocumentVisibilityChange);
  }

  private initProgram = () => {
    const program = createProgram(this.gl, vertexShaderSource, this.fragmentShader);
    if (!program) return;
    this.program = program;
  };

  private setupPositionAttribute = () => {
    const positionAttributeLocation = this.gl.getAttribLocation(this.program!, 'a_position');
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(positionAttributeLocation);
    this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
  };

  private setupUniforms = () => {
    // Create a map to store all uniform locations
    const uniformLocations: Record<string, WebGLUniformLocation | null> = {
      u_time: this.gl.getUniformLocation(this.program!, 'u_time'),
      u_pixelRatio: this.gl.getUniformLocation(this.program!, 'u_pixelRatio'),
      u_resolution: this.gl.getUniformLocation(this.program!, 'u_resolution'),
    };

    // Add locations for all provided uniforms
    Object.entries(this.providedUniforms).forEach(([key, value]) => {
      uniformLocations[key] = this.gl.getUniformLocation(this.program!, key);

      // For texture uniforms, also look for the aspect ratio uniform
      if (value instanceof HTMLImageElement) {
        const aspectRatioUniformName = `${key}AspectRatio`;
        uniformLocations[aspectRatioUniformName] = this.gl.getUniformLocation(this.program!, aspectRatioUniformName);
      }
    });

    this.uniformLocations = uniformLocations;
  };

  /**
   * The scale that we should render at.
   * - Used to target 2x rendering even on 1x screens for better antialiasing
   * - Prevents the virtual resolution from going beyond the maximum resolution
   * - Accounts for the page zoom level so we render in physical device pixels rather than CSS pixels
   */
  private renderScale = 1;
  private parentWidth = 0;
  private parentHeight = 0;
  private parentDevicePixelWidth = 0;
  private parentDevicePixelHeight = 0;
  private devicePixelsSupported = false;

  private intersectionObserver: IntersectionObserver | null = null;
  private isInViewport = true;

  private resizeObserver: ResizeObserver | null = null;
  private setupResizeObserver = () => {
    this.resizeObserver = new ResizeObserver(([entry]) => {
      if (entry?.borderBoxSize[0]) {
        const physicalPixelSize = entry.devicePixelContentBoxSize?.[0];

        if (physicalPixelSize !== undefined) {
          this.devicePixelsSupported = true;
          this.parentDevicePixelWidth = physicalPixelSize.inlineSize;
          this.parentDevicePixelHeight = physicalPixelSize.blockSize;
        }

        this.parentWidth = entry.borderBoxSize[0].inlineSize;
        this.parentHeight = entry.borderBoxSize[0].blockSize;
      }

      this.handleResize();
    });

    this.resizeObserver.observe(this.parentElement);
  };

  private setupIntersectionObserver = () => {
    // we check element's own window to support shaders used within iframe/PiP elements
    const view = this.ownerDocument.defaultView;
    if (!view?.IntersectionObserver) return;

    this.intersectionObserver = new view.IntersectionObserver(([entry]) => {
      this.isInViewport = entry?.isIntersecting ?? true;
      this.updateCurrentSpeed();
    });

    this.intersectionObserver.observe(this.parentElement);
  };

  // Visual viewport resize handler, mainly used to react to browser zoom changes.
  // Resize observer by itself does not react to pinch zoom, and although it usually
  // reacts to classic browser zoom, it's not guaranteed in edge cases.
  // Since timing between visual viewport changes and resize observer is complex
  // and because we'd like to know the device pixel sizes of elements, we just restart
  // the observer to get a guaranteed fresh callback regardless if it would have triggered or not.
  private handleVisualViewportChange = () => {
    this.resizeObserver?.disconnect();
    this.setupResizeObserver();

    // In case of debugging timing, from here on:
    // - animation frame 1: a paint after the visual viewport resize
    // - animation frame 2: a paint after the resize observer has been handled, if it was ever triggered
  };

  /** Resize handler for when the container div changes size or the max pixel count changes and we want to resize our canvas to match */
  private handleResize = () => {
    // Aim to render at least as many pixels as physically displayed
    // This will overshoot when the user zooms out, but that's acceptable

    let targetPixelWidth = 0;
    let targetPixelHeight = 0;

    // If window.devicePixelRatio is below 1, it's safe to say the browser is just zoomed out
    // We can use 1 as the minimum value not to upscale it needlessly to meet the min pixel ratio param
    const dpr = Math.max(1, window.devicePixelRatio);
    const pinchZoom = visualViewport?.scale ?? 1;

    if (this.devicePixelsSupported) {
      // Use the real pixel size if we know it, plus meet the min pixel ratio requirement and add in pinch zoom
      const scaleToMeetMinPixelRatio = Math.max(1, this.minPixelRatio / dpr);
      targetPixelWidth = this.parentDevicePixelWidth * scaleToMeetMinPixelRatio * pinchZoom;
      targetPixelHeight = this.parentDevicePixelHeight * scaleToMeetMinPixelRatio * pinchZoom;
    } else {
      // Otherwise try to approximate the element size in device pixels using devicePixelRatio.
      // (devicePixelRatio is imprecise and element's width/height may be fractional CSS sizes, not real pixels).
      let targetRenderScale = Math.max(dpr, this.minPixelRatio) * pinchZoom;

      if (this.isSafari) {
        // As of 2025, Safari reports physical devicePixelRatio, but other browsers add the current zoom level:
        // https://bugs.webkit.org/show_bug.cgi?id=124862
        //
        // In Safari we need to factor in the zoom level manually in order to set the target resolution.
        // To avoid sidebars upscaling the target resolution, set a minimum zoom level of 1.
        // This will render at higher resolution when zoomed out, but that's fine.
        // (We mostly care about maintaining good quality when zoomed in).
        const zoomLevel = bestGuessBrowserZoom(this.ownerDocument);
        targetRenderScale *= Math.max(1, zoomLevel);
      }

      // Rounding the client width/height since they may be fractional in CSS layout values
      targetPixelWidth = Math.round(this.parentWidth) * targetRenderScale;
      targetPixelHeight = Math.round(this.parentHeight) * targetRenderScale;
    }

    // Prevent the total rendered pixel count from exceeding maxPixelCount
    const maxPixelCountHeadroom = Math.sqrt(this.maxPixelCount) / Math.sqrt(targetPixelWidth * targetPixelHeight);
    const scaleToMeetMaxPixelCount = Math.min(1, maxPixelCountHeadroom);
    const newWidth = Math.round(targetPixelWidth * scaleToMeetMaxPixelCount);
    const newHeight = Math.round(targetPixelHeight * scaleToMeetMaxPixelCount);
    const newRenderScale = newWidth / Math.round(this.parentWidth);

    if (
      this.canvasElement.width !== newWidth ||
      this.canvasElement.height !== newHeight ||
      this.renderScale !== newRenderScale // Usually, only render scale changes when the user zooms in/out
    ) {
      this.renderScale = newRenderScale;
      this.canvasElement.width = newWidth;
      this.canvasElement.height = newHeight;
      this.resolutionChanged = true;
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

      // this is necessary to avoid flashes while resizing (the next scheduled render will set uniforms)
      this.render(performance.now());
    }
  };

  private render = (currentTime: number) => {
    if (this.hasBeenDisposed) return;

    if (this.program === null) {
      console.warn('Tried to render before program or gl was initialized');
      return;
    }

    // Calculate the delta time
    const dt = currentTime - this.lastRenderTime;
    this.lastRenderTime = currentTime;
    // Increase the total animation time by dt * animationSpeed
    if (this.currentSpeed !== 0) {
      this.currentFrame += dt * this.currentSpeed;
    }

    // Clear the canvas
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Update uniforms
    this.gl.useProgram(this.program);

    // Update the time uniform
    this.gl.uniform1f(this.uniformLocations.u_time!, this.currentFrame * 0.001);

    // If the resolution has changed, we need to update the uniform
    if (this.resolutionChanged) {
      this.gl.uniform2f(this.uniformLocations.u_resolution!, this.gl.canvas.width, this.gl.canvas.height);
      this.gl.uniform1f(this.uniformLocations.u_pixelRatio!, this.renderScale);
      this.resolutionChanged = false;
    }

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    // Loop if we're animating
    if (this.currentSpeed !== 0) {
      this.requestRender();
    } else {
      this.rafId = null;
    }
  };

  private requestRender = () => {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = requestAnimationFrame(this.render);
  };

  /** Creates a texture from an image and sets it into a uniform value */
  private setTextureUniform = (uniformName: string, image: HTMLImageElement): void => {
    if (!image.complete || image.naturalWidth === 0) {
      throw new Error(`Paper Shaders: image for uniform ${uniformName} must be fully loaded`);
    }

    // Clean up existing texture if present
    const existingTexture = this.textures.get(uniformName);
    if (existingTexture) {
      this.gl.deleteTexture(existingTexture);
    }

    // Get texture unit
    if (!this.textureUnitMap.has(uniformName)) {
      this.textureUnitMap.set(uniformName, this.textureUnitMap.size);
    }
    const textureUnit = this.textureUnitMap.get(uniformName)!;
    // Activate correct texture unit before creating the texture
    this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);

    // Create and set up the new texture
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    // Set texture parameters
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

    // Upload image to texture
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

    // Generate mipmaps if the uniform is in the mipmaps list
    if (this.mipmaps.includes(uniformName)) {
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
    }

    const error = this.gl.getError();
    if (error !== this.gl.NO_ERROR || texture === null) {
      console.error('Paper Shaders: WebGL error when uploading texture:', error);
      return;
    }

    // Store the texture
    this.textures.set(uniformName, texture);

    // Set up texture unit and uniform
    const location = this.uniformLocations[uniformName];
    if (location) {
      this.gl.uniform1i(location, textureUnit);

      // Calculate and set the aspect ratio uniform
      const aspectRatioUniformName = `${uniformName}AspectRatio`;
      const aspectRatioLocation = this.uniformLocations[aspectRatioUniformName];
      if (aspectRatioLocation) {
        const aspectRatio = image.naturalWidth / image.naturalHeight;
        this.gl.uniform1f(aspectRatioLocation, aspectRatio);
      }
    }
  };

  /** Utility: recursive equality test for all the uniforms */
  private areUniformValuesEqual = (a: any, b: any): boolean => {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
      return a.every((val, i) => this.areUniformValuesEqual(val, (b as any)[i]));
    }
    return false;
  };

  /** Sets the provided uniform values into the WebGL program, can be a partial list of uniforms that have changed */
  private setUniformValues = (updatedUniforms: ShaderMountUniforms) => {
    this.gl.useProgram(this.program);
    Object.entries(updatedUniforms).forEach(([key, value]) => {
      // Grab the value to use in the uniform cache
      let cacheValue: ShaderMountUniforms[keyof ShaderMountUniforms] | string = value;
      if (value instanceof HTMLImageElement) {
        // Images use their src for the cache value to save memory
        cacheValue = `${value.src.slice(0, 200)}|${value.naturalWidth}x${value.naturalHeight}`;
      }

      // Check if the uniform value has changed and, if not, bail early to avoid extra work
      if (this.areUniformValuesEqual(this.uniformCache[key], cacheValue)) return;
      // Update the uniform cache if we are still here
      this.uniformCache[key] = cacheValue;

      const location = this.uniformLocations[key];
      if (!location) {
        console.warn(`Uniform location for ${key} not found`);
        return;
      }

      if (value instanceof HTMLImageElement) {
        // Texture case, requires a good amount of code so it gets its own function:
        this.setTextureUniform(key, value);
      } else if (Array.isArray(value)) {
        // Array case
        let flatArray: number[] | null = null;
        let valueLength: number | null = null;

        // If it's an array of same-sized arrays, flatten it down so we can set the uniform
        if (value[0] !== undefined && Array.isArray(value[0])) {
          const firstChildLength = value[0].length;
          if (value.every((arr) => (arr as number[]).length === firstChildLength)) {
            // Array of same-sized arrays case, flattens the array sets it
            flatArray = value.flat();
            valueLength = firstChildLength;
          } else {
            console.warn(`All child arrays must be the same length for ${key}`);
            return;
          }
        } else {
          // Array of primitive values case, supports 2, 3, 4, 9, 16 length arrays
          flatArray = value as number[];
          valueLength = flatArray.length;
        }

        // Set the uniform based on array length... supports 2, 3, 4, 9, 16 length arrays of primitive values
        // or arbitrary length arrays of arrays
        switch (valueLength) {
          case 2:
            this.gl.uniform2fv(location, flatArray);
            break;
          case 3:
            this.gl.uniform3fv(location, flatArray);
            break;
          case 4:
            this.gl.uniform4fv(location, flatArray);
            break;
          case 9:
            this.gl.uniformMatrix3fv(location, false, flatArray);
            break;
          case 16:
            this.gl.uniformMatrix4fv(location, false, flatArray);
            break;
          default:
            console.warn(`Unsupported uniform array length: ${valueLength}`);
        }
      } else if (typeof value === 'number') {
        // Number case, supports floats and ints
        this.gl.uniform1f(location, value);
      } else if (typeof value === 'boolean') {
        // Boolean case, supports true and false
        this.gl.uniform1i(location, value ? 1 : 0);
      } else {
        // May happen on the server for SSR when undefined images are passed in
        console.warn(`Unsupported uniform type for ${key}: ${typeof value}`);
      }
    });
  };

  /** Gets the current total animation time from 0ms */
  public getCurrentFrame = (): number => {
    return this.currentFrame;
  };

  /** Set a frame to get a deterministic result, frames are literally just milliseconds from zero since the animation started */
  public setFrame = (newFrame: number): void => {
    this.currentFrame = newFrame;
    this.lastRenderTime = performance.now();
    this.render(performance.now());
  };

  /** Set an animation speed (or 0 to stop animation) */
  public setSpeed = (newSpeed = 1): void => {
    // Set the new animation speed
    this.speed = newSpeed;
    this.updateCurrentSpeed();
  };

  /** Apply the target speed, pausing (0) while the tab is hidden or the element is out of the viewport */
  private updateCurrentSpeed = (): void => {
    this.setCurrentSpeed(this.ownerDocument.hidden || !this.isInViewport ? 0 : this.speed);
  };

  private setCurrentSpeed = (newSpeed: number): void => {
    this.currentSpeed = newSpeed;

    if (this.rafId === null && newSpeed !== 0) {
      // Moving from 0 to animating, kick off a new rAF loop
      this.lastRenderTime = performance.now();
      this.rafId = requestAnimationFrame(this.render);
    }

    if (this.rafId !== null && newSpeed === 0) {
      // Moving from animating to not animating, cancel the rAF loop
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  };

  /** Set the maximum pixel count for the shader, this will limit the number of pixels that will be rendered */
  public setMaxPixelCount = (newMaxPixelCount: number = DEFAULT_MAX_PIXEL_COUNT): void => {
    this.maxPixelCount = newMaxPixelCount;

    this.handleResize();
  };

  /** Set the minimum pixel ratio for the shader */
  public setMinPixelRatio = (newMinPixelRatio: number = 2): void => {
    this.minPixelRatio = newMinPixelRatio;

    this.handleResize();
  };

  /** Update the uniforms that are provided by the outside shader, can be a partial set with only the uniforms that have changed */
  public setUniforms = (newUniforms: ShaderMountUniforms): void => {
    this.setUniformValues(newUniforms);
    this.providedUniforms = { ...this.providedUniforms, ...newUniforms };

    this.render(performance.now());
  };

  private handleDocumentVisibilityChange = () => {
    this.updateCurrentSpeed();
  };

  /** Dispose of the shader mount, cleaning up all of the WebGL resources */
  public dispose = (): void => {
    // Immediately mark as disposed to prevent future renders from leaking in
    this.hasBeenDisposed = true;

    // Cancel the rAF loop
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.gl && this.program) {
      // Clean up all textures
      this.textures.forEach((texture) => {
        this.gl.deleteTexture(texture);
      });
      this.textures.clear();

      this.gl.deleteProgram(this.program);
      this.program = null;

      // Reset the WebGL context
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
      this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

      // Clear any errors
      this.gl.getError();
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    visualViewport?.removeEventListener('resize', this.handleVisualViewportChange);
    this.ownerDocument.removeEventListener('visibilitychange', this.handleDocumentVisibilityChange);

    this.uniformLocations = {};

    // Remove the shader from the div wrapper element
    this.canvasElement.remove();
    // Free up the reference to self to enable garbage collection
    delete this.parentElement.paperShaderMount;
  };
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
): WebGLProgram | null {
  const format = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT);
  const precision = format ? format.precision : null;
  // MEDIUM_FLOAT precision can be 10, 16 or 23 bits depending on device;
  // Shaders fail on 10 bit (and 16 bit is hard to test) => we force 23-bit by switching to highp
  if (precision && precision < 23) {
    vertexShaderSource = vertexShaderSource.replace(/precision\s+(lowp|mediump)\s+float;/g, 'precision highp float;');
    fragmentShaderSource = fragmentShaderSource
      .replace(/precision\s+(lowp|mediump)\s+float/g, 'precision highp float')
      .replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g, '$1 highp $3');
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  // Clean up shaders after successful linking
  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}

const defaultStyle = `@layer paper-shaders {
  :where([data-paper-shader]) {
    isolation: isolate;
    position: relative;

    & canvas {
      contain: strict;
      display: block;
      position: absolute;
      inset: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      corner-shape: inherit;
    }
  }
}`;

/** The parent `<div>` element that has a ShaderMount available on it */
export interface PaperShaderElement extends HTMLElement {
  paperShaderMount: ShaderMount | undefined;
}

/** Check if an element is a Paper shader element */
export function isPaperShaderElement(element: HTMLElement): element is PaperShaderElement {
  return 'paperShaderMount' in element;
}

/**
 * Uniform types that we support to be auto-mapped into the fragment shader
 *
 * We accept undefined as a convenience for server rendering, when some things may be undefined
 * We just skip setting the uniform if it's undefined. This allows the shader mount to still take up space during server rendering
 */
export interface ShaderMountUniforms {
  [key: string]: boolean | number | number[] | number[][] | HTMLImageElement | undefined;
}

export interface ShaderMotionParams {
  speed?: number;
  frame?: number;
}

export type ShaderPreset<T> = {
  name: string;
  params: Required<T>;
};

export type ImageShaderPreset<T> = {
  name: string;
  /**
   * Params for the shader excluding the image.
   * Image is excluded as it isn't considered a preset,
   * e.g. when switching between presets it shouldn't switch the image.
   *
   * While we exclude images from presets they should still be set with a default prop value so the code-first usage of shaders remains great.
   */
  params: Required<Omit<T, 'image'>>;
};

function isSafari() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('safari') && !ua.includes('chrome') && !ua.includes('android');
}

// Zoom level can be estimated comparing the browser's outerWidth and the viewport width.
// It's nowhere near perfect because it's affected by the presence of browser sidebars,
// like a vertical web inspector or Arc's sidebar. Also, both outerWidth and innerWidth
// are integers, which would almost never give us a perfect ratio at face values.
//
// Still, this is pretty accurate in the vast majority of cases.
//
// Note 1:
// Avoid innerWidth, use visualViewport.width instead.
// - innerWidth is affected by pinch zoom in Safari, but not other browsers.
//   visualViewport.width works consistently in all browsers.
// - innerWidth is rounded to integer, but not visualViewport.width.
// - visualViewport.width is affected by hard scrollbars, so they need to be added manually
//
// Note 2:
// Opening a sidebar in Safari like web inspector or bookmarks will throw off the zoom
// level detection and result in a larger target resolution. Not a concern in real-world usage
// with Safari, but we'd rather not try to detect zoom levels with other browsers
// (e.g. Arc always has a sidebar, which affects outerWidth vs visualViewport.width).
function bestGuessBrowserZoom(doc: Document) {
  const viewportScale = visualViewport?.scale ?? 1;
  const viewportWidth = visualViewport?.width ?? window.innerWidth;
  const scrollbarWidth = window.innerWidth - doc.documentElement.clientWidth;
  const innerWidth = viewportScale * viewportWidth + scrollbarWidth;

  // outerWidth and innerWidth are always integers so we won't often get the original zoom ratio
  // E.g. given a 125% zoom, outerWidth = 1657, innerWidth = 1325, 1657 / 1325 = 1.2505660377
  // We check for common zoom levels and return the closest one if found.

  const ratio = outerWidth / innerWidth;
  const zoomPercentageRounded = Math.round(100 * ratio);

  // All zoom levels divisible by 5%
  if (zoomPercentageRounded % 5 === 0) {
    return zoomPercentageRounded / 100;
  }

  // 33% zoom
  if (zoomPercentageRounded === 33) {
    return 1 / 3;
  }

  // 67% zoom
  if (zoomPercentageRounded === 67) {
    return 2 / 3;
  }

  // 133% zoom
  if (zoomPercentageRounded === 133) {
    return 4 / 3;
  }

  return ratio;
}
