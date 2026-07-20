import { TUNING } from "./constants.js";
import {
  getVisibleSegmentText,
  segmentTextIntoGraphemes,
} from "./text.js";
import {
  calculateGlyphTiming,
  calculateWidthTiming,
  type ResolvedSlotOptions,
} from "./timing.js";

const CSS_PROBE_TEXT = "x";
const { layout, width } = TUNING;
let cachedSlotLayoutReady = false;

/** Internal test seam; not re-exported from the package. */
export function resetSlotLayoutCache() {
  cachedSlotLayoutReady = false;
}

interface CharacterSlotElements {
  slot: HTMLElement;
  sizer: HTMLElement;
  previousFace: HTMLElement | null;
}

interface SlotMeasurement extends CharacterSlotElements {
  index: number;
  currentSegment: string;
  targetSegment: string;
  currentWidth: number;
  targetWidth: number;
  widthWillChange: boolean;
}

function createCharacterFace(segment: string) {
  const face = document.createElement("span");
  face.className = "char-face";
  face.textContent = getVisibleSegmentText(segment);
  return face;
}

function createCharacterSlot(segment: string) {
  const slot = document.createElement("span");
  slot.className = "char-slot";
  slot.dataset.char = segment;

  const sizer = document.createElement("span");
  sizer.className = "char-sizer";
  sizer.textContent = getVisibleSegmentText(segment);

  slot.append(sizer, createCharacterFace(segment));
  return slot;
}

/** Render slot markup without touching animation lifecycle state. */
export function renderCharacterSlots(container: HTMLElement, text: string) {
  container.classList.add("slot-text");
  container.replaceChildren(
    ...segmentTextIntoGraphemes(text).map(createCharacterSlot),
  );
}

export function renderPlainText(container: HTMLElement, text: string) {
  container.classList.remove("slot-text");
  container.textContent = text;
}

export function getCharacterSlots(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(".char-slot"),
  );
}

export function isSlotLayoutReady(slot: HTMLElement | undefined) {
  if (!slot) return false;
  const face = slot.querySelector<HTMLElement>(".char-face");
  if (!face) return false;

  const slotStyle = getComputedStyle(slot);
  const faceStyle = getComputedStyle(face);
  const slotIsFlex =
    slotStyle.display === "inline-flex" || slotStyle.display === "flex";

  return (
    slotStyle.position === "relative" &&
    slotIsFlex &&
    faceStyle.position === "absolute"
  );
}

/**
 * Check the globally imported stylesheet contract. A successful check is
 * cached because an applied stylesheet does not normally disappear. A failed
 * check is retried so asynchronously loaded CSS can upgrade plain text later.
 */
export function canRenderSlotLayout() {
  if (cachedSlotLayoutReady) return true;
  if (!document.body) return false;

  const cssProbe = document.createElement("span");
  cssProbe.setAttribute("aria-hidden", "true");
  cssProbe.style.cssText =
    `position:absolute;left:${layout.probeOffscreenPositionPx}px;` +
    `top:${layout.probeOffscreenPositionPx}px;visibility:hidden;pointer-events:none;`;
  renderCharacterSlots(cssProbe, CSS_PROBE_TEXT);
  document.body.appendChild(cssProbe);
  const firstProbeSlot = getCharacterSlots(cssProbe)[0];
  cachedSlotLayoutReady = isSlotLayoutReady(firstProbeSlot);
  cssProbe.remove();
  return cachedSlotLayoutReady;
}

export function addMissingCharacterSlots(
  container: HTMLElement,
  characterSlots: HTMLElement[],
  requiredSlotCount: number,
) {
  for (let index = characterSlots.length; index < requiredSlotCount; index++) {
    const slot = createCharacterSlot("");
    container.appendChild(slot);
    characterSlots.push(slot);
  }
}

export function measureCharacterHeight(
  container: HTMLElement,
  characterSlots: HTMLElement[],
  containerStyle: CSSStyleDeclaration,
) {
  const firstCharacterSlot = characterSlots[0];
  const sampleSlot =
    characterSlots.find((slot) => (slot.dataset.char ?? "") !== "") ??
    firstCharacterSlot;

  return (
    Math.ceil(
      sampleSlot?.getBoundingClientRect().height ||
        sampleSlot?.offsetHeight ||
        container.getBoundingClientRect().height ||
        parseFloat(containerStyle.lineHeight) ||
        0,
    ) ||
    Math.ceil(
      parseFloat(containerStyle.fontSize) *
        layout.fallbackLineHeightMultiplier,
    ) ||
    layout.fallbackCharacterHeightPx
  );
}

/** Measure all old widths, apply all target sizers, then read all new widths. */
export function measureChangedSlots(
  characterSlots: HTMLElement[],
  currentSegments: string[],
  targetSegments: string[],
  skipUnchanged: boolean,
): SlotMeasurement[] {
  const changedSlots: Array<
    CharacterSlotElements & {
      index: number;
      currentSegment: string;
      targetSegment: string;
      currentWidth: number;
    }
  > = [];

  for (let index = 0; index < characterSlots.length; index++) {
    const currentSegment = currentSegments[index] ?? "";
    const targetSegment = targetSegments[index] ?? "";
    if (
      currentSegment === targetSegment &&
      (skipUnchanged || currentSegment === "")
    ) {
      continue;
    }

    const slot = characterSlots[index];
    const sizer = slot.querySelector<HTMLElement>(".char-sizer")!;
    changedSlots.push({
      index,
      slot,
      sizer,
      previousFace: slot.querySelector<HTMLElement>(".char-face"),
      currentSegment,
      targetSegment,
      currentWidth: slot.getBoundingClientRect().width,
    });
  }

  changedSlots.forEach(({ sizer, targetSegment }) => {
    sizer.textContent = getVisibleSegmentText(targetSegment);
  });

  return changedSlots.map((changedSlot) => {
    const targetWidth = changedSlot.sizer.getBoundingClientRect().width;
    return {
      ...changedSlot,
      targetWidth,
      widthWillChange:
        Math.abs(targetWidth - changedSlot.currentWidth) >
        width.minimumVisibleChangePx,
    };
  });
}

export function prepareSlotAnimation(
  measurement: SlotMeasurement,
  targetSegmentCount: number,
  characterHeight: number,
  options: ResolvedSlotOptions,
) {
  const { index, slot, currentSegment, targetSegment } = measurement;
  const { currentWidth, widthWillChange } = measurement;
  const timing = calculateGlyphTiming(
    index,
    targetSegmentCount,
    targetSegment === "",
    options,
  );
  const widthTiming = calculateWidthTiming(
    currentSegment,
    targetSegment,
    timing,
  );
  const incomingOffsetY =
    options.direction === "down" ? -characterHeight : characterHeight;
  const incomingColor =
    typeof options.color === "function"
      ? options.color(index, targetSegmentCount)
      : options.color;

  if (widthWillChange) slot.style.width = `${currentWidth}px`;
  if (currentSegment === "" || targetSegment === "") {
    slot.classList.add("is-resizing");
  }

  const incomingFace = createCharacterFace(targetSegment);
  incomingFace.style.transformOrigin = layout.characterTransformOrigin;
  incomingFace.style.transform =
    `translateY(${incomingOffsetY}px) ` +
    `rotate(${timing.startingTiltDegrees}deg)`;
  if (incomingColor) incomingFace.style.color = incomingColor;
  slot.appendChild(incomingFace);

  const widthCompletionTimeMs = widthWillChange
    ? widthTiming.startDelayMs + widthTiming.durationMs
    : 0;
  const glyphCompletionTimeMs =
    timing.startDelayMs +
    options.exitOffset +
    timing.durationMs +
    (options.color ? options.colorFade : 0);

  return {
    measurement,
    timing,
    widthTiming,
    incomingFace,
    completionTimeMs: Math.max(widthCompletionTimeMs, glyphCompletionTimeMs),
  };
}

export function scheduleSlotAnimation(
  preparedAnimation: ReturnType<typeof prepareSlotAnimation>,
  characterHeight: number,
  restingColor: string,
  options: ResolvedSlotOptions,
  scheduleTask: (callback: () => void, delayMs: number) => void,
) {
  const { measurement, timing, widthTiming, incomingFace } = preparedAnimation;
  const { slot, previousFace, targetWidth, widthWillChange } = measurement;
  const outgoingOffsetY =
    options.direction === "down" ? characterHeight : -characterHeight;
  const rollTransition =
    `transform ${timing.durationMs}ms ${options.easing}`;
  const incomingTransition = options.color
    ? `${rollTransition}, color ${options.colorFade}ms linear ${timing.durationMs}ms`
    : rollTransition;

  if (widthWillChange) {
    scheduleTask(() => {
      slot.style.transition =
        `width ${widthTiming.durationMs}ms ${width.resizeEasing}`;
      slot.style.width = `${targetWidth}px`;
    }, widthTiming.startDelayMs);
  }

  if (previousFace) {
    scheduleTask(() => {
      previousFace.style.transition = rollTransition;
      previousFace.style.transform =
        `translateY(${outgoingOffsetY}px) ` +
        `rotate(${-timing.startingTiltDegrees}deg)`;
    }, timing.startDelayMs);
  }

  scheduleTask(() => {
    incomingFace.style.transition = incomingTransition;
    incomingFace.style.transform = layout.characterRestTransform;
    if (options.color) incomingFace.style.color = restingColor;

    const finishOnTransformEnd = (event: TransitionEvent) => {
      if (event.propertyName !== "transform") return;
      incomingFace.removeEventListener(
        "transitionend",
        finishOnTransformEnd,
      );
      slot.dataset.char = measurement.targetSegment;
      slot.style.removeProperty("transition");
      slot.style.removeProperty("width");
      slot.classList.remove("is-resizing");
      slot.querySelectorAll(".char-face").forEach((face) => {
        if (face !== incomingFace) face.remove();
      });
    };
    incomingFace.addEventListener("transitionend", finishOnTransformEnd);
  }, timing.startDelayMs + options.exitOffset);
}
