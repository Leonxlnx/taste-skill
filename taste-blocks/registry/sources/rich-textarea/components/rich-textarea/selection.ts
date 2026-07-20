import { min, refKey } from "./utils.js";

/**
 * @internal
 */
export type SelectionRange = [number | null, number | null];

/**
 * @internal
 */
export const initSelectionStore = (
  ref: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>,
  onSelectionUpdate: (range: SelectionRange) => void
) => {
  let prevSelection: [number | null, number | null] = [null, null];
  let compositionEvent: CompositionEvent | void;
  const getSelection = (): [number | null, number | null] => {
    const selectionStart = handle._getSelectionStart();
    const selectionEnd = handle._getSelectionEnd();
    if (
      prevSelection[0] === selectionStart &&
      prevSelection[1] === selectionEnd
    ) {
      return prevSelection;
    }
    prevSelection = [selectionStart, selectionEnd];
    return prevSelection;
  };
  const handle = {
    _updateSeletion() {
      setTimeout(() => {
        onSelectionUpdate(getSelection());
      });
    },
    _setComposition(event: CompositionEvent | void) {
      compositionEvent = event;
    },
    _getSelectionStart(): number {
      const el = ref[refKey];
      if (!el) return 0;
      const pos = el.selectionStart!;
      if (!compositionEvent) return pos;
      // compensate selection range during compositioning
      return min(pos, el.selectionEnd! - compositionEvent.data.length);
    },
    _getSelectionEnd(): number {
      const el = ref[refKey];
      if (!el) return 0;
      const pos = el.selectionEnd!;
      // compensate selection range during compositioning
      if (!compositionEvent) return pos;
      return min(pos, el.selectionStart! + compositionEvent.data.length);
    },
  };
  return handle;
};

/**
 * @internal
 */
export type SelectionStore = ReturnType<typeof initSelectionStore>;
