"use client"

/**
 * @author: @dorianbaffier
 * @description: File Upload
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { Check, UploadCloud, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  type DragEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"

import { cn } from "../../lib/utils"

type FileStatus = "idle" | "dragging" | "uploading" | "complete" | "error"

export interface FileUploadError {
  message: string
  code: string
}

export interface FileUploadContext {
  signal: AbortSignal
  onProgress: (progress: number) => void
}

export interface FileUploadProps {
  uploadFile: (file: File, context: FileUploadContext) => Promise<void>
  onUploadSuccess?: (file: File) => void
  onUploadError?: (error: FileUploadError) => void
  onFileRemove?: (file: File) => void
  acceptedFileTypes?: string[]
  maxFileSize?: number
  validateFile?: (file: File) => FileUploadError | null
  className?: string
}

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024
const FILE_SIZES = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] as const

function formatBytes(bytes: number, decimals = 2): string {
  if (!(Number.isFinite(bytes) && bytes > 0)) return "0 Bytes"
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    FILE_SIZES.length - 1,
  )
  return `${Number.parseFloat((bytes / 1024 ** index).toFixed(Math.max(0, decimals)))} ${FILE_SIZES[index]}`
}

function acceptsFile(file: File, accept: string): boolean {
  const token = accept.trim().toLowerCase()
  if (!token) return false
  if (token.startsWith(".")) return file.name.toLowerCase().endsWith(token)
  if (token.endsWith("/*")) return file.type.toLowerCase().startsWith(token.slice(0, -1))
  return file.type.toLowerCase() === token
}

function UploadIllustration({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="relative h-16 w-16">
      <svg aria-hidden="true" className="h-full w-full" fill="none" viewBox="0 0 100 100">
        <circle
          className="stroke-gray-200 dark:stroke-gray-700"
          cx="50"
          cy="50"
          r="45"
          strokeDasharray="4 4"
          strokeWidth="2"
        >
          {!reducedMotion && (
            <animateTransform
              attributeName="transform"
              dur="60s"
              from="0 50 50"
              repeatCount="indefinite"
              to="360 50 50"
              type="rotate"
            />
          )}
        </circle>

        <path
          className="fill-blue-100 stroke-blue-500 dark:fill-blue-900/30 dark:stroke-blue-400"
          d="M30 35H70C75 35 75 40 75 40V65C75 70 70 70 70 70H30C25 70 25 65 25 65V40C25 35 30 35 30 35Z"
          strokeWidth="2"
        >
          {!reducedMotion && (
            <animate
              attributeName="d"
              dur="2s"
              repeatCount="indefinite"
              values="M30 35H70C75 35 75 40 75 40V65C75 70 70 70 70 70H30C25 70 25 65 25 65V40C25 35 30 35 30 35Z;M30 38H70C75 38 75 43 75 43V68C75 73 70 73 70 73H30C25 73 25 68 25 68V43C25 38 30 38 30 38Z;M30 35H70C75 35 75 40 75 40V65C75 70 70 70 70 70H30C25 70 25 65 25 65V40C25 35 30 35 30 35Z"
            />
          )}
        </path>

        <path
          className="stroke-blue-500 dark:stroke-blue-400"
          d="M30 35C30 35 35 35 40 35C45 35 45 30 50 30C55 30 55 35 60 35C65 35 70 35 70 35"
          strokeWidth="2"
        />

        <g className="translate-y-2 transform">
          <line
            className="stroke-blue-500 dark:stroke-blue-400"
            strokeLinecap="round"
            strokeWidth="2"
            x1="50"
            x2="50"
            y1="45"
            y2="60"
          >
            {!reducedMotion && (
              <animate attributeName="y2" dur="2s" repeatCount="indefinite" values="60;55;60" />
            )}
          </line>
          <polyline
            className="stroke-blue-500 dark:stroke-blue-400"
            fill="none"
            points="42,52 50,45 58,52"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          >
            {!reducedMotion && (
              <animate
                attributeName="points"
                dur="2s"
                repeatCount="indefinite"
                values="42,52 50,45 58,52;42,47 50,40 58,47;42,52 50,45 58,52"
              />
            )}
          </polyline>
        </g>
      </svg>
    </div>
  )
}

function UploadingAnimation({
  progress,
  reducedMotion,
}: {
  progress: number
  reducedMotion: boolean
}) {
  const maskId = `upload-progress-${useId().replaceAll(":", "")}`
  return (
    <div className="relative h-16 w-16">
      <svg
        aria-label={`Upload progress: ${Math.round(progress)}%`}
        className="h-full w-full"
        fill="none"
        role="img"
        viewBox="0 0 240 240"
      >
        <title>Upload progress</title>
        <defs>
          <mask id={maskId}>
            <rect fill="black" height="240" width="240" />
            <circle
              cx="120"
              cy="120"
              fill="white"
              r="120"
              strokeDasharray={`${(progress / 100) * 754}, 754`}
              transform="rotate(-90 120 120)"
            />
          </mask>
        </defs>
        <style>{`
          @keyframes kokonut-upload-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes kokonut-upload-ccw { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
          .kokonut-upload-rings circle { transform-origin: 120px 120px; }
          .kokonut-upload-rings circle:nth-child(odd) { animation: kokonut-upload-cw 8s linear infinite; }
          .kokonut-upload-rings circle:nth-child(even) { animation: kokonut-upload-ccw 8s linear infinite; }
          .kokonut-upload-rings[data-reduced-motion] circle { animation: none !important; }
          @media (prefers-reduced-motion: reduce) { .kokonut-upload-rings circle { animation: none; } }
        `}</style>
        <g
          className="kokonut-upload-rings"
          data-reduced-motion={reducedMotion || undefined}
          mask={`url(#${maskId})`}
          strokeDasharray="18% 40%"
          strokeWidth="10"
        >
          <circle cx="120" cy="120" opacity="0.95" r="150" stroke="#FF2E7E" />
          <circle cx="120" cy="120" opacity="0.95" r="140" stroke="#FFD600" />
          <circle cx="120" cy="120" opacity="0.95" r="130" stroke="#00E5FF" />
          <circle cx="120" cy="120" opacity="0.95" r="120" stroke="#FF3D71" />
          <circle cx="120" cy="120" opacity="0.95" r="110" stroke="#4ADE80" />
          <circle cx="120" cy="120" opacity="0.95" r="100" stroke="#2196F3" />
          <circle cx="120" cy="120" opacity="0.95" r="90" stroke="#FFA726" />
          <circle cx="120" cy="120" opacity="0.95" r="80" stroke="#FF1493" />
          <circle cx="120" cy="120" opacity="0.95" r="70" stroke="#FFEB3B" />
          <circle cx="120" cy="120" opacity="0.95" r="60" stroke="#00BCD4" />
          <circle cx="120" cy="120" opacity="0.95" r="50" stroke="#FF4081" />
          <circle cx="120" cy="120" opacity="0.95" r="40" stroke="#76FF03" />
          <circle cx="120" cy="120" opacity="0.95" r="30" stroke="#448AFF" />
          <circle cx="120" cy="120" opacity="0.95" r="20" stroke="#FF3D00" />
        </g>
      </svg>
    </div>
  )
}

function normalizeUploadError(error: unknown): FileUploadError {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return { message: error.message, code: error.code }
  }
  return {
    message: error instanceof Error ? error.message : "Upload failed",
    code: "UPLOAD_FAILED",
  }
}

export default function FileUpload({
  uploadFile,
  onUploadSuccess,
  onUploadError,
  onFileRemove,
  acceptedFileTypes = [],
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  validateFile,
  className,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<FileStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<FileUploadError | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadAbortRef = useRef<AbortController | null>(null)
  const reducedMotion = useReducedMotion() ?? false
  const safeMaxFileSize =
    Number.isFinite(maxFileSize) && maxFileSize > 0
      ? maxFileSize
      : DEFAULT_MAX_FILE_SIZE

  useEffect(
    () => () => {
      uploadAbortRef.current?.abort()
    },
    [],
  )

  const reportError = useCallback(
    (nextError: FileUploadError) => {
      setError(nextError)
      setStatus("error")
      onUploadError?.(nextError)
    },
    [onUploadError],
  )

  const validate = useCallback(
    (selectedFile: File): FileUploadError | null => {
      if (selectedFile.size > safeMaxFileSize) {
        return {
          message: `File size exceeds ${formatBytes(safeMaxFileSize)}`,
          code: "FILE_TOO_LARGE",
        }
      }
      if (
        acceptedFileTypes.length > 0 &&
        !acceptedFileTypes.some((type) => acceptsFile(selectedFile, type))
      ) {
        return {
          message: `File type must match ${acceptedFileTypes.join(", ")}`,
          code: "INVALID_FILE_TYPE",
        }
      }
      return validateFile?.(selectedFile) ?? null
    },
    [acceptedFileTypes, safeMaxFileSize, validateFile],
  )

  const handleFileSelect = useCallback(
    async (selectedFile: File | null) => {
      if (!selectedFile || status === "uploading") return
      setError(null)
      const validationError = validate(selectedFile)
      if (validationError) {
        reportError(validationError)
        return
      }

      const controller = new AbortController()
      uploadAbortRef.current?.abort()
      uploadAbortRef.current = controller
      setFile(selectedFile)
      setProgress(0)
      setStatus("uploading")

      try {
        await uploadFile(selectedFile, {
          signal: controller.signal,
          onProgress: (nextProgress) => {
            if (controller.signal.aborted) return
            setProgress(Math.min(100, Math.max(0, nextProgress)))
          },
        })
        if (controller.signal.aborted) return
        setProgress(100)
        setStatus("complete")
        onUploadSuccess?.(selectedFile)
      } catch (uploadError) {
        if (!controller.signal.aborted) reportError(normalizeUploadError(uploadError))
      } finally {
        if (uploadAbortRef.current === controller) uploadAbortRef.current = null
      }
    },
    [onUploadSuccess, reportError, status, uploadFile, validate],
  )

  const resetState = useCallback(() => {
    uploadAbortRef.current?.abort()
    uploadAbortRef.current = null
    if (file) onFileRemove?.(file)
    setFile(null)
    setStatus("idle")
    setProgress(0)
    setError(null)
  }, [file, onFileRemove])

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (status !== "uploading" && status !== "complete") setStatus("dragging")
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    if (status === "dragging") setStatus("idle")
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (status === "uploading" || status === "complete") return
    setStatus("idle")
    void handleFileSelect(event.dataTransfer.files?.[0] ?? null)
  }

  const idle = status === "idle" || status === "dragging" || status === "error"

  return (
    <div
      aria-busy={status === "uploading"}
      aria-label="File upload"
      className={cn("relative mx-auto w-full max-w-sm", className)}
      role="group"
    >
      <div className="group relative w-full rounded-xl bg-white p-0.5 ring-1 ring-gray-200 dark:bg-black dark:ring-white/10">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        <div className="relative w-full rounded-[10px] bg-gray-50/50 p-1.5 dark:bg-white/[0.02]">
          <div
            className={cn(
              "relative overflow-hidden rounded-lg border border-gray-100 bg-white dark:border-white/[0.08] dark:bg-black/50",
              error && "border-red-500/50",
            )}
          >
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-0 bg-blue-500/5 transition-opacity duration-200 motion-reduce:transition-none",
                status === "dragging" ? "opacity-100" : "opacity-0",
              )}
            />

            <div className="relative h-[240px]">
              <AnimatePresence mode="wait">
                {idle ? (
                  <motion.div
                    animate={{
                      opacity: status === "dragging" ? 0.8 : 1,
                      y: 0,
                      scale: status === "dragging" && !reducedMotion ? 0.98 : 1,
                    }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-6"
                    exit={{ opacity: 0, y: reducedMotion ? 0 : -10 }}
                    initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
                    key="dropzone"
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
                  >
                    <div className="mb-4">
                      <UploadIllustration reducedMotion={reducedMotion} />
                    </div>
                    <div className="mb-4 space-y-1.5 text-center">
                      <h3 className="font-semibold text-gray-900 text-lg tracking-tight dark:text-white">
                        Drop a file or browse
                      </h3>
                      <p className="text-gray-500 text-xs dark:text-gray-400">
                        {acceptedFileTypes.length > 0
                          ? acceptedFileTypes.join(", ")
                          : "Any file type"}{" "}
                        up to {formatBytes(safeMaxFileSize)}
                      </p>
                    </div>
                    <button
                      className="group/upload flex min-h-11 w-4/5 items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-900 text-sm transition-colors duration-150 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                    >
                      Choose file
                      <UploadCloud className="h-4 w-4 transition-transform duration-150 motion-reduce:transition-none [@media(hover:hover)]:group-hover/upload:-translate-y-0.5" />
                    </button>
                    <input
                      accept={acceptedFileTypes.join(",") || undefined}
                      aria-label="Choose file"
                      className="sr-only"
                      onChange={(event) => {
                        void handleFileSelect(event.target.files?.[0] ?? null)
                        event.target.value = ""
                      }}
                      ref={fileInputRef}
                      type="file"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-6"
                    exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.97 }}
                    initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.97 }}
                    key={status}
                    transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
                  >
                    <div className="mb-4">
                      {status === "complete" ? (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <Check aria-hidden="true" className="h-7 w-7" />
                        </div>
                      ) : (
                        <UploadingAnimation progress={progress} reducedMotion={reducedMotion} />
                      )}
                    </div>
                    <div aria-live="polite" className="mb-4 max-w-full space-y-1.5 text-center">
                      <h3 className="truncate font-semibold text-gray-900 text-sm dark:text-white">
                        {file?.name}
                      </h3>
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          {formatBytes(file?.size ?? 0)}
                        </span>
                        <span className="font-medium text-blue-500">
                          {status === "complete" ? "Uploaded" : `${Math.round(progress)}%`}
                        </span>
                      </div>
                    </div>
                    <button
                      className="flex min-h-11 w-4/5 items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-900 text-sm transition-colors duration-150 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                      onClick={resetState}
                      type="button"
                    >
                      <X aria-hidden="true" className="h-4 w-4" />
                      {status === "complete" ? "Remove file" : "Cancel upload"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-4 bottom-4 left-4 rounded-lg border border-red-500/20 bg-red-50 px-4 py-2 dark:bg-red-950/80"
                  exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
                  initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
                  role="alert"
                  transition={{ duration: reducedMotion ? 0 : 0.16, ease: "easeOut" }}
                >
                  <p className="text-red-700 text-sm dark:text-red-300">{error.message}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
