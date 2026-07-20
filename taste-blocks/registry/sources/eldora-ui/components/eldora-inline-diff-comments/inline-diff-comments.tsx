"use client"

import { useId, useRef, useState } from "react"
import { CheckCircle2, MessageSquarePlus, X } from "lucide-react"

import { Avatar, AvatarFallback } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { Textarea } from "../ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"
import { cn } from "../../lib/utils"

export type DiffLine =
  | { kind: "hunk"; content: string }
  | { kind: "context"; old: number | null; new: number | null; content: string }
  | { kind: "add"; old: number | null; new: number | null; content: string }
  | { kind: "del"; old: number | null; new: number | null; content: string }

export type InlineComment = {
  id: string
  author: string
  initials: string
  body: string
  createdAt: string
}

export interface InlineDiffCommentsProps {
  diff: readonly DiffLine[]
  fileName: string
  className?: string
  initialComments?: Readonly<Record<number, readonly InlineComment[]>>
  onComment?: (lineIndex: number, body: string) => void
  onResolvedChange?: (lineIndex: number, resolved: boolean) => void
}

export default function InlineDiffComments({
  diff,
  fileName,
  className,
  initialComments = {},
  onComment,
  onResolvedChange,
}: InlineDiffCommentsProps) {
  const instanceId = useId()
  const [openThreadAt, setOpenThreadAt] = useState<number | null>(null)
  const [resolvedMap, setResolvedMap] = useState<Record<number, boolean>>({})
  const [commentsMap, setCommentsMap] = useState<Record<number, InlineComment[]>>(
    () =>
      Object.fromEntries(
        Object.entries(initialComments).map(([index, comments]) => [
          Number(index),
          [...comments],
        ])
      )
  )
  const addButtonRefs = useRef(new Map<number, HTMLButtonElement>())

  function closeThread(index: number, restoreFocus = true) {
    setOpenThreadAt(null)
    if (restoreFocus) {
      requestAnimationFrame(() => addButtonRefs.current.get(index)?.focus())
    }
  }

  function toggleResolve(index: number) {
    setResolvedMap((current) => {
      const resolved = !current[index]
      onResolvedChange?.(index, resolved)
      return { ...current, [index]: resolved }
    })
  }

  function addComment(index: number, body: string) {
    const comment: InlineComment = {
      id: crypto.randomUUID(),
      author: "You",
      initials: "YO",
      body,
      createdAt: "now",
    }
    setCommentsMap((current) => ({
      ...current,
      [index]: [...(current[index] ?? []), comment],
    }))
    onComment?.(index, body)
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div
        role="table"
        aria-label={`Diff of ${fileName}`}
        className={cn(
          "bg-card overflow-hidden rounded-md border dark:border-white/10",
          className
        )}
      >
        <div className="flex items-center justify-between border-b px-3 py-2 dark:border-white/10">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-[13px] font-medium">{fileName}</span>
            <Badge
              variant="secondary"
              aria-label="File status: modified"
              className="h-5 px-1.5 text-[11px]"
            >
              modified
            </Badge>
          </div>
        </div>

        {diff.length === 0 ? (
          <p className="text-muted-foreground px-3 py-6 text-center text-sm">
            No diff lines.
          </p>
        ) : (
          <ol role="rowgroup" className="divide-y dark:divide-white/10">
            {diff.map((line, index) => {
              const isChange = line.kind === "add" || line.kind === "del"
              const isOpen = openThreadAt === index
              const isResolved = resolvedMap[index] ?? false
              const threadId = `${instanceId}-thread-${index}`
              const oldLine = line.kind === "hunk" ? "" : (line.old ?? "")
              const newLine = line.kind === "hunk" ? "" : (line.new ?? "")

              return (
                <li
                  key={`${line.kind}:${oldLine}:${newLine}:${line.content}:${index}`}
                  role="row"
                  className={cn(
                    "group relative flex items-stretch text-[13px]",
                    line.kind === "hunk" && "bg-muted/50 text-muted-foreground",
                    line.kind === "add" &&
                      "bg-emerald-50/60 dark:bg-emerald-950/20",
                    line.kind === "del" && "bg-rose-50/60 dark:bg-rose-950/20"
                  )}
                >
                  <div
                    role="cell"
                    className="flex w-11 shrink-0 items-center justify-center sm:w-8"
                  >
                    {line.kind !== "hunk" ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            ref={(node) => {
                              if (node) addButtonRefs.current.set(index, node)
                              else addButtonRefs.current.delete(index)
                            }}
                            type="button"
                            size="icon"
                            variant="secondary"
                            aria-label={isOpen ? "Close inline comment" : "Add inline comment"}
                            aria-controls={threadId}
                            aria-expanded={isOpen}
                            className="size-11 rounded-full opacity-100 shadow-sm transition-opacity sm:size-7 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100 motion-reduce:transition-none"
                            onClick={() => {
                              if (isOpen) closeThread(index, false)
                              else setOpenThreadAt(index)
                            }}
                          >
                            <MessageSquarePlus className="size-4 sm:size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {isOpen ? "Close comment" : "Add comment"}
                        </TooltipContent>
                      </Tooltip>
                    ) : null}
                  </div>

                  <div
                    role="cell"
                    dir="ltr"
                    className="text-muted-foreground grid w-16 shrink-0 grid-cols-2 border-r text-[11px] dark:border-white/10"
                  >
                    <span className="px-2 py-1 text-right tabular-nums">
                      {line.kind === "add" || line.kind === "hunk"
                        ? ""
                        : (line.old ?? "")}
                    </span>
                    <span className="px-2 py-1 text-right tabular-nums">
                      {line.kind === "del" || line.kind === "hunk"
                        ? ""
                        : (line.new ?? "")}
                    </span>
                  </div>

                  <div role="cell" className="min-w-0 flex-1">
                    <pre
                      dir="ltr"
                      className={cn(
                        "overflow-x-auto px-2 py-1 font-mono text-[12px] leading-5 whitespace-pre",
                        isChange && "pl-5"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mr-1 inline-block w-2 text-center font-semibold",
                          line.kind === "add" && "text-emerald-600",
                          line.kind === "del" && "text-rose-600"
                        )}
                      >
                        {line.kind === "add"
                          ? "+"
                          : line.kind === "del"
                            ? "-"
                            : " "}
                      </span>
                      {line.content}
                    </pre>

                    {isOpen && line.kind !== "hunk" ? (
                      <div
                        id={threadId}
                        className="bg-background border-t px-2 py-2 dark:border-white/10"
                      >
                        <InlineThread
                          resolved={isResolved}
                          comments={commentsMap[index] ?? []}
                          onAddComment={(body) => addComment(index, body)}
                          onToggleResolve={() => toggleResolve(index)}
                          onClose={() => closeThread(index)}
                        />
                      </div>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </TooltipProvider>
  )
}

function InlineThread({
  resolved,
  comments,
  onAddComment,
  onToggleResolve,
  onClose,
}: {
  resolved: boolean
  comments: readonly InlineComment[]
  onAddComment: (body: string) => void
  onToggleResolve: () => void
  onClose: () => void
}) {
  const fieldId = useId()
  const [draft, setDraft] = useState("")
  const textRef = useRef<HTMLTextAreaElement | null>(null)

  function addComment() {
    const body = draft.trim()
    if (!body) return
    setDraft("")
    onAddComment(body)
    requestAnimationFrame(() => textRef.current?.focus())
  }

  return (
    <div
      className="bg-card rounded-md border dark:border-white/10"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault()
          onClose()
        }
      }}
    >
      <div className="flex items-center justify-between gap-2 px-2 py-1.5">
        <Badge
          aria-live="polite"
          className={cn(
            "h-5 gap-1 px-1.5 text-[11px]",
            resolved
              ? "bg-emerald-600 text-white hover:bg-emerald-600/90 dark:bg-emerald-500 dark:hover:bg-emerald-500/90"
              : "bg-secondary text-foreground dark:bg-neutral-800 dark:text-neutral-100"
          )}
        >
          {resolved ? <CheckCircle2 className="size-3.5" /> : null}
          {resolved ? "Resolved" : "Open"}
        </Badge>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant={resolved ? "secondary" : "default"}
            size="sm"
            onClick={onToggleResolve}
            aria-pressed={resolved}
            className="h-8 px-2 text-[12px]"
          >
            {resolved ? "Reopen" : "Resolve"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close thread"
            onClick={onClose}
            className="size-8"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <ul aria-live="polite" className="space-y-2 px-2 py-2">
        {comments.length === 0 ? (
          <li className="text-muted-foreground text-[12px]">
            No comments yet.
          </li>
        ) : (
          comments.map((comment) => (
            <li key={comment.id} className="flex items-start gap-2">
              <Avatar className="size-6">
                <AvatarFallback className="text-[9px]">
                  {comment.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[12px] font-medium">
                    {comment.author}
                  </p>
                  <span className="text-muted-foreground shrink-0 text-[10px]">
                    {comment.createdAt}
                  </span>
                </div>
                <p className="mt-0.5 text-[13px] leading-5 break-words">
                  {comment.body}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>

      <Separator />

      <div className="flex flex-col gap-2 px-2 py-2">
        <label htmlFor={fieldId} className="sr-only">
          Add a comment
        </label>
        <Textarea
          autoFocus
          id={fieldId}
          ref={textRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault()
              addComment()
            }
          }}
          placeholder="Comment"
          rows={2}
          className="min-h-16 py-1.5 text-[13px]"
        />
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 px-2 text-[12px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={addComment}
            disabled={!draft.trim()}
            className="h-8 px-2 text-[12px]"
          >
            Comment
          </Button>
        </div>
      </div>
    </div>
  )
}
