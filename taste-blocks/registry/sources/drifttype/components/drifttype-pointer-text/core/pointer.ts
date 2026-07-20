import type {
  Point,
  MeasureFn,
  PointerMode,
  PointerGlyphState,
  PointerLayoutState,
} from './types.js';

// ---- Spring physics constants ----

// Low stiffness + high damping retention = slow, fluid return with inertia
const SPRING_STIFFNESS = 0.03;
const DAMPING = 0.92;
// Below this velocity magnitude, snap to rest
const REST_THRESHOLD = 0.05;

// ---- Initialization ----

/**
 * Create the initial state for a pointer-reactive layout.
 * Characters are laid out in a horizontal line starting from (0, 0).
 * Pure function — no DOM.
 */
export function initPointerLayout(
  text: string,
  measure: MeasureFn,
  mode: PointerMode,
  spacing = 1,
): PointerLayoutState {
  const chars = [...text];
  const glyphs: PointerGlyphState[] = [];
  let cursor = 0;

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i]!;
    const metrics = measure(char, i);
    const advance = metrics.width * spacing;
    const x = cursor + advance / 2;
    const base: Point = { x, y: 0 };

    glyphs.push({
      char,
      index: i,
      base,
      position: { ...base },
      angle: 0,
      velocity: { x: 0, y: 0 },
      metrics,
    });

    cursor += advance;
  }

  return { glyphs, text, pointer: null, mode };
}

// ---- Per-frame update ----

/**
 * Compute the next frame of the pointer-reactive layout.
 * Returns a new state — does not mutate the input.
 *
 * @param state - Current layout state
 * @param pointer - Current pointer position (null if pointer left the area)
 * @param radius - Effect radius in pixels
 * @param strength - Effect strength, 0–1
 * @param dt - Time delta in seconds (for frame-rate independence). Default ~16ms.
 */
export function stepPointerLayout(
  state: PointerLayoutState,
  pointer: Point | null,
  radius: number,
  strength: number,
  dt = 1 / 60,
): PointerLayoutState {
  // Normalize dt to 60fps baseline so spring constants feel consistent
  const dtScale = dt * 60;

  const glyphs = state.glyphs.map((glyph): PointerGlyphState => {
    let forceX = 0;
    let forceY = 0;

    if (pointer) {
      // Use base position for force calculation — keeps the force field
      // stable regardless of where the glyph has been displaced to.
      // Otherwise glyphs that move away lose influence and snap back.
      const dx = glyph.base.x - pointer.x;
      const dy = glyph.base.y - pointer.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);

      if (dist < radius && dist > 0.001) {
        // Normalized distance: 1 at pointer, 0 at edge of radius
        const proximity = 1 - dist / radius;
        // Smooth falloff
        const influence = proximity * proximity * strength;

        switch (state.mode) {
          case 'repel': {
            // Push away from pointer along the displacement vector
            const normX = dx / dist;
            const normY = dy / dist;
            forceX = normX * influence * radius * 0.3;
            forceY = normY * influence * radius * 0.3;
            break;
          }
          case 'attract': {
            // Pull toward pointer
            const normX = dx / dist;
            const normY = dy / dist;
            forceX = -normX * influence * radius * 0.15;
            forceY = -normY * influence * radius * 0.15;
            break;
          }
          case 'orbit': {
            // Perpendicular to displacement vector (tangential force)
            const normX = dx / dist;
            const normY = dy / dist;
            // Tangent: rotate 90 degrees
            forceX = -normY * influence * radius * 0.2;
            forceY = normX * influence * radius * 0.2;
            // Plus a slight inward pull to keep orbiting
            forceX -= normX * influence * radius * 0.05;
            forceY -= normY * influence * radius * 0.05;
            break;
          }
        }
      }
    }

    // Target = base position + force displacement
    const targetX = glyph.base.x + forceX;
    const targetY = glyph.base.y + forceY;

    // Spring: accelerate toward target
    const ax = (targetX - glyph.position.x) * SPRING_STIFFNESS;
    const ay = (targetY - glyph.position.y) * SPRING_STIFFNESS;

    let vx = (glyph.velocity.x + ax * dtScale) * DAMPING;
    let vy = (glyph.velocity.y + ay * dtScale) * DAMPING;

    // Snap to rest if close enough
    const speed = Math.sqrt(vx * vx + vy * vy);
    const distToTarget = Math.sqrt(
      (glyph.position.x - targetX) ** 2 + (glyph.position.y - targetY) ** 2,
    );
    if (speed < REST_THRESHOLD && distToTarget < REST_THRESHOLD) {
      vx = 0;
      vy = 0;
    }

    const newX = glyph.position.x + vx * dtScale;
    const newY = glyph.position.y + vy * dtScale;

    // Rotation: blend toward direction of movement, ease back to 0
    const targetAngle = speed > 0.5 ? Math.atan2(vy, vx) : 0;
    const angle = glyph.angle + (targetAngle - glyph.angle) * 0.1;

    return {
      ...glyph,
      position: { x: newX, y: newY },
      velocity: { x: vx, y: vy },
      angle,
    };
  });

  return { ...state, glyphs, pointer };
}

/**
 * Check if the layout is at rest (all characters settled).
 * Useful to stop the animation loop when nothing is moving.
 */
export function isAtRest(state: PointerLayoutState): boolean {
  return state.glyphs.every((g) => {
    const speed = Math.sqrt(g.velocity.x ** 2 + g.velocity.y ** 2);
    const distToBase = Math.sqrt(
      (g.position.x - g.base.x) ** 2 + (g.position.y - g.base.y) ** 2,
    );
    return speed < REST_THRESHOLD && distToBase < REST_THRESHOLD;
  });
}
