"use client";

import * as React from "react";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "../shared/ruixen-utils";

export interface PasteAttachment {
  /** Stable, unique identifier. Generated for you when a paste is captured. */
  id: string;
  /** Full text of the attachment. This is what the editor reads and writes. */
  content: string;
  /** Card heading. Derived from the first line of `content` when omitted. */
  title?: string;
  /** Heading shown in the expanded editor. Default `"Pasted text"`. */
  label?: string;
}

export interface SmartPasteSubmitPayload {
  /** Whatever is left in the input, trimmed. */
  text: string;
  /** Attachments riding along with the message. */
  attachments: PasteAttachment[];
}

export interface SmartPasteInputProps {
  /** Controlled input text. Pair with `onValueChange`. */
  value?: string;
  /** Initial text when uncontrolled. */
  defaultValue?: string;
  /** Fires on every keystroke, and with `""` after a submit. */
  onValueChange?: (value: string) => void;
  /** Controlled attachments. Pair with `onAttachmentsChange`. */
  attachments?: PasteAttachment[];
  /** Initial attachments when uncontrolled. */
  defaultAttachments?: PasteAttachment[];
  /** Fires whenever an attachment is captured, edited or removed. */
  onAttachmentsChange?: (attachments: PasteAttachment[]) => void;
  /** Fires on send (button, or `Enter` without `Shift`). */
  onSubmit?: (payload: SmartPasteSubmitPayload) => void;
  /** Input placeholder. Default `"Ask anything..."`. */
  placeholder?: string;
  /** A paste this long (in characters) becomes an attachment instead of inline text. Default `320`. */
  pasteThreshold?: number;
  /** A paste with at least this many lines becomes an attachment, however short. Default `8`. */
  pasteLineThreshold?: number;
  /** Cap on attachments. Pastes past the cap fall back to plain inline text. Default `4`. */
  maxAttachments?: number;
  /** Let the expanded editor write back. When `false` it is a read-only viewer. Default `true`. */
  editable?: boolean;
  /** Disables the input, the send button and paste capture. */
  disabled?: boolean;
  /** Tallest the input grows before it scrolls, in pixels. Default `160`. */
  maxInputHeight?: number;
  /** Classes for the send + save buttons. Override to reskin the accent. */
  accentClassName?: string;
  /** Accessible name for the composer. Default `"Message"`. */
  label?: string;
  className?: string;
}

// Theme tokens, not a hardcoded brand color: the send and save buttons follow
// whatever `--primary` is set to, in light and dark alike. Pass
// `accentClassName` to override (e.g. "bg-blue-600 text-white hover:bg-blue-700").
const DEFAULT_ACCENT = "bg-primary text-primary-foreground hover:bg-primary/90";

// Strips the shadcn Textarea back to bare text: no border, no ring, no chrome.
// The composer shell owns all of that.
const BARE_TEXTAREA =
  "w-full resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

// Fades the last visible line of the card preview into the card's edge, so the
// text reads as "there is more of this" instead of as a hard crop.
const PREVIEW_FADE = {
  maskImage: "linear-gradient(to bottom, #000 45%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(to bottom, #000 45%, transparent 100%)",
} as const;

let attachmentCount = 0;

/** Heading for a pasted blob: its first meaningful line, stripped of markdown. */
export function derivePasteTitle(content: string, fallback = "Pasted text") {
  const first = content
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);
  if (!first) return fallback;
  const clean = first
    .replace(/^#{1,6}\s+/, "")
    .replace(/^[-*+]\s+/, "")
    .trim();
  if (!clean) return fallback;
  return clean.length > 64 ? `${clean.slice(0, 63).trimEnd()}…` : clean;
}

/** Body for the card: everything after the line that became the title. */
function derivePastePreview(content: string) {
  const lines = content.split("\n");
  let i = 0;
  while (i < lines.length && !lines[i].trim()) i += 1;
  i += 1; // the title line itself
  while (i < lines.length && !lines[i].trim()) i += 1;
  const rest = lines.slice(i).join("\n").trim();
  return rest || content.trim();
}

function formatCount(count: number) {
  return `${count} ${count === 1 ? "character" : "characters"}`;
}

/** Uncontrolled state that steps aside the moment a `value` prop shows up. */
function useControllable<T>(
  controlled: T | undefined,
  fallback: T,
  onChange?: (value: T) => void,
) {
  const [uncontrolled, setUncontrolled] = React.useState(fallback);
  const isControlled = controlled !== undefined;
  const value = isControlled ? (controlled as T) : uncontrolled;

  const valueRef = React.useRef(value);
  valueRef.current = value;

  const setValue = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(valueRef.current)
          : next;
      if (!isControlled) setUncontrolled(resolved);
      onChange?.(resolved);
    },
    [isControlled, onChange],
  );

  return [value, setValue] as const;
}

export function SmartPasteInput({
  value,
  defaultValue = "",
  onValueChange,
  attachments,
  defaultAttachments = [],
  onAttachmentsChange,
  onSubmit,
  placeholder = "Ask anything...",
  pasteThreshold = 320,
  pasteLineThreshold = 8,
  maxAttachments = 4,
  editable = true,
  disabled = false,
  maxInputHeight = 160,
  accentClassName = DEFAULT_ACCENT,
  label = "Message",
  className,
}: SmartPasteInputProps) {
  const [text, setText] = useControllable(value, defaultValue, onValueChange);
  const [items, setItems] = useControllable(
    attachments,
    defaultAttachments,
    onAttachmentsChange,
  );
  const [openId, setOpenId] = React.useState<string | null>(null);
  const inputMaxHeight = Math.max(48, maxInputHeight);

  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const openItem = items.find((item) => item.id === openId) ?? null;
  const canSubmit = !disabled && (text.trim().length > 0 || items.length > 0);

  // Grow with the content, then scroll — the send button stays pinned to the
  // bottom edge so it never drifts as the message gets taller.
  React.useLayoutEffect(() => {
    const node = inputRef.current;
    if (!node) return;
    node.style.height = "0px";
    node.style.height = `${Math.min(node.scrollHeight, inputMaxHeight)}px`;
  }, [text, inputMaxHeight]);

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (disabled) return;
    const pasted = event.clipboardData.getData("text/plain");
    if (!pasted) return;

    const isLong =
      pasted.length >= pasteThreshold ||
      pasted.split("\n").length >= pasteLineThreshold;
    // Past the cap, fall through to a plain inline paste rather than silently
    // dropping the text on the floor.
    if (!isLong || items.length >= maxAttachments) return;

    event.preventDefault();
    attachmentCount += 1;
    setItems((prev) => [
      ...prev,
      { id: `paste-${attachmentCount}`, content: pasted },
    ]);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    )
      return;
    event.preventDefault();
    submit();
  };

  const submit = () => {
    if (!canSubmit) return;
    onSubmit?.({ text: text.trim(), attachments: items });
    setText("");
    setItems([]);
  };

  const saveAttachment = (id: string, content: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, content } : item)),
    );
    setOpenId(null);
  };

  const removeAttachment = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setOpenId(null);
  };

  return (
    <div className={cn("w-full max-w-[720px]", className)}>
      <div
        className={cn(
          // Padding is symmetric on all four sides, and the input is exactly as
          // tall as the send button — that alone centers the button in the row.
          "rounded-[28px] border border-border/80 bg-card p-2 shadow-md",
          "transition-colors focus-within:border-border",
          disabled && "opacity-60",
        )}
      >
        {items.length > 0 && (
          <div className="flex flex-wrap gap-3 px-2 pb-2 pt-1.5">
            {items.map((item) => (
              <AttachmentCard
                key={item.id}
                attachment={item}
                disabled={disabled}
                onOpen={() => setOpenId(item.id)}
                onRemove={() => removeAttachment(item.id)}
              />
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 pl-4">
          <Textarea
            ref={inputRef}
            rows={1}
            value={text}
            disabled={disabled}
            aria-label={label}
            placeholder={placeholder}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            onChange={(event) => setText(event.target.value)}
            className={cn(
              BARE_TEXTAREA,
              // 11 + 26 + 11 = 48: the send button's exact height, so one line
              // of text sits on the button's centerline.
              "min-h-[48px] flex-1 py-[11px] pr-2",
              "text-[17px] leading-[26px] tracking-[-0.01em] text-foreground",
              "placeholder:text-muted-foreground/70",
            )}
            style={{ maxHeight: inputMaxHeight }}
          />

          <Button
            type="button"
            size="icon"
            onClick={submit}
            disabled={!canSubmit}
            aria-label="Send message"
            className={cn(
              "h-12 w-12 shrink-0 rounded-full transition-[transform,background-color,color,box-shadow] duration-200 ease-out motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
              canSubmit
                ? cn(
                    accentClassName,
                    "shadow-md hover:scale-[1.04] active:scale-95",
                  )
                : // A washed-out accent reads as a broken brand color. Rest in
                  // neutral instead, so "nothing to send" looks deliberate.
                  "bg-muted text-muted-foreground disabled:opacity-100",
            )}
          >
            <ArrowRight className="size-5" strokeWidth={2.25} />
          </Button>
        </div>
      </div>

      <AttachmentEditor
        attachment={openItem}
        editable={editable}
        accentClassName={accentClassName}
        onClose={() => setOpenId(null)}
        onSave={saveAttachment}
        onRemove={removeAttachment}
      />
    </div>
  );
}

function AttachmentCard({
  attachment,
  disabled,
  onOpen,
  onRemove,
}: {
  attachment: PasteAttachment;
  disabled?: boolean;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const title = attachment.title ?? derivePasteTitle(attachment.content);
  const preview = React.useMemo(
    () => derivePastePreview(attachment.content),
    [attachment.content],
  );

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onOpen}
        disabled={disabled}
        aria-label={`Open attachment: ${title}`}
        className={cn(
          "flex h-[104px] w-[256px] flex-col overflow-hidden rounded-2xl",
          "border border-border/80 bg-card px-4 py-3 text-left shadow-sm",
          "transition-[transform,border-color,box-shadow] duration-200 ease-out motion-reduce:transition-none motion-reduce:hover:translate-y-0",
          "hover:-translate-y-px hover:border-border hover:shadow-md",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          "disabled:pointer-events-none",
        )}
      >
        <span className="w-full truncate text-[15px] font-semibold tracking-[-0.01em] text-foreground">
          {title}
        </span>
        <span
          className="mt-1 flex-1 overflow-hidden whitespace-pre-wrap break-words text-[13px] leading-[1.5] text-muted-foreground"
          style={PREVIEW_FADE}
        >
          {preview}
        </span>
      </button>

      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`Remove attachment: ${title}`}
        className={cn(
          "absolute -right-1.5 -top-1.5 size-6 rounded-full bg-background p-0",
          "text-muted-foreground shadow-sm hover:text-foreground",
          // Always visible where there is no hover to reveal it (touch), then
          // hover-revealed from sm up so the card stays clean on a desktop.
          "transition-opacity duration-150 sm:opacity-0",
          "sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
        )}
      >
        <X className="size-3.5" strokeWidth={2.25} />
      </Button>
    </div>
  );
}

function AttachmentEditor({
  attachment,
  editable,
  accentClassName,
  onClose,
  onSave,
  onRemove,
}: {
  attachment: PasteAttachment | null;
  editable: boolean;
  accentClassName: string;
  onClose: () => void;
  onSave: (id: string, content: string) => void;
  onRemove: (id: string) => void;
}) {
  const [draft, setDraft] = React.useState("");
  const [overflow, setOverflow] = React.useState({ top: false, bottom: false });
  // Outlives `attachment` by one close, so the dialog still has content to
  // render while Radix plays its exit animation.
  const [snapshot, setSnapshot] = React.useState<PasteAttachment | null>(null);

  const editorRef = React.useRef<HTMLTextAreaElement>(null);
  const open = attachment !== null;

  // Seed the draft on open. Everything typed after that is local until Save, so
  // Escape and a click on the overlay throw the edit away.
  React.useLayoutEffect(() => {
    if (!attachment) return;
    setSnapshot(attachment);
    setDraft(attachment.content);
  }, [attachment]);

  const syncOverflow = React.useCallback(() => {
    const node = editorRef.current;
    if (!node) return;
    setOverflow({
      top: node.scrollTop > 2,
      bottom: node.scrollTop + node.clientHeight < node.scrollHeight - 2,
    });
  }, []);

  const active = attachment ?? snapshot;
  const heading = active?.label ?? "Pasted text";
  const canSave = editable && draft.trim().length > 0;

  const commit = () => {
    if (!active) return;
    if (!editable) return onClose();
    if (!canSave) return;
    onSave(active.id, draft);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      {active && (
        <DialogContent
          className={cn(
            "gap-0 rounded-[26px] border-border/70 bg-card px-7 pb-5 pt-6",
            "sm:max-w-[600px]",
            "motion-reduce:duration-0",
            // The dialog's own corner ✕ is redundant here: Remove and Save are
            // the only two ways out, and Escape still closes.
            "[&>button]:hidden",
          )}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            const node = editorRef.current;
            if (!node) return;
            // Focusing a textarea parks the caret at the end, which scrolls a
            // long paste straight to its last line. Open at the top instead.
            node.focus();
            node.setSelectionRange(0, 0);
            node.scrollTop = 0;
            syncOverflow();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              commit();
            }
          }}
        >
          <DialogHeader className="flex-row items-baseline justify-between gap-4 space-y-0">
            <DialogTitle className="text-[19px] tracking-[-0.01em]">
              {heading}
            </DialogTitle>
            <DialogDescription className="shrink-0 text-[14px] tabular-nums">
              {formatCount(draft.length)}
            </DialogDescription>
          </DialogHeader>

          <div className="relative mt-4">
            <Textarea
              ref={editorRef}
              value={draft}
              readOnly={!editable}
              spellCheck={false}
              onScroll={syncOverflow}
              aria-label={`${heading} content`}
              onChange={(event) => {
                setDraft(event.target.value);
                syncOverflow();
              }}
              className={cn(
                BARE_TEXTAREA,
                // Caps at 45vh so the dialog still fits on a short viewport.
                "h-[300px] max-h-[45vh] py-0",
                "font-mono text-[15px] leading-[1.85] text-foreground",
              )}
            />

            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-8",
                "bg-gradient-to-b from-card to-transparent transition-opacity duration-200",
                overflow.top ? "opacity-100" : "opacity-0",
              )}
            />
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 h-20",
                "bg-gradient-to-t from-card via-card/85 to-transparent transition-opacity duration-200",
                overflow.bottom ? "opacity-100" : "opacity-0",
              )}
            />
          </div>

          <DialogFooter className="mt-4 flex-row items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onRemove(active.id)}
              // -ml-3 cancels the ghost button's padding, so the label lines up
              // with the left edge of the text above it.
              className="-ml-3 text-[15px] font-normal text-muted-foreground hover:text-foreground"
            >
              Remove
            </Button>

            <Button
              type="button"
              onClick={commit}
              disabled={editable && !canSave}
              className={cn(
                "h-auto rounded-full px-6 py-2.5 text-[15px] shadow-sm",
                "transition-[transform,background-color,color,box-shadow] duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
                accentClassName,
              )}
            >
              {editable ? "Save" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}

export default SmartPasteInput;
