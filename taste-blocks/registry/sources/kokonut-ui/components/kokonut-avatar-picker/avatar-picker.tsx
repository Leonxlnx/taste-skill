"use client"

/**
 * @author: @dorianbaffier
 * @description: Avatar Picker
 * @version: 2.0.0
 * @date: 2026-02-22
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { Check, ChevronRight, User2 } from "lucide-react"
import type { Variants } from "motion/react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { type FormEvent, useId, useState } from "react"

import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Input } from "../ui/input"
import { cn } from "../../lib/utils"

interface Avatar {
  id: number
  art: React.ReactNode
  alt: string
  accent: string
}

function AvatarOne() {
  return (
    <svg aria-hidden="true" fill="none" height="40" viewBox="0 0 36 36" width="40">
      <rect fill="#ff005b" height="36" width="36" />
      <rect
        fill="#ffb238"
        height="36"
        rx="6"
        transform="translate(9 -5) rotate(219 18 18) scale(1)"
        width="36"
      />
      <g transform="translate(4.5 -4) rotate(9 18 18)">
        <path d="M15 19c2 1 4 1 6 0" fill="none" stroke="#000" strokeLinecap="round" />
        <rect fill="#000" height="2" rx="1" width="1.5" x="10" y="14" />
        <rect fill="#000" height="2" rx="1" width="1.5" x="24" y="14" />
      </g>
    </svg>
  )
}

function AvatarTwo() {
  return (
    <svg aria-hidden="true" fill="none" height="40" viewBox="0 0 36 36" width="40">
      <rect fill="#ff7d10" height="36" width="36" />
      <rect
        fill="#0a0310"
        height="36"
        rx="6"
        transform="translate(5 -1) rotate(55 18 18) scale(1.1)"
        width="36"
      />
      <g transform="translate(7 -6) rotate(-5 18 18)">
        <path d="M15 20c2 1 4 1 6 0" fill="none" stroke="#fff" strokeLinecap="round" />
        <rect fill="#fff" height="2" rx="1" width="1.5" x="14" y="14" />
        <rect fill="#fff" height="2" rx="1" width="1.5" x="20" y="14" />
      </g>
    </svg>
  )
}

function AvatarThree() {
  return (
    <svg aria-hidden="true" fill="none" height="40" viewBox="0 0 36 36" width="40">
      <rect fill="#0a0310" height="36" width="36" />
      <rect
        fill="#ff005b"
        height="36"
        rx="36"
        transform="translate(-3 7) rotate(227 18 18) scale(1.2)"
        width="36"
      />
      <g transform="translate(-3 3.5) rotate(7 18 18)">
        <path d="M13,21 a1,0.75 0 0,0 10,0" fill="#fff" />
        <rect fill="#fff" height="2" rx="1" width="1.5" x="12" y="14" />
        <rect fill="#fff" height="2" rx="1" width="1.5" x="22" y="14" />
      </g>
    </svg>
  )
}

function AvatarFour() {
  return (
    <svg aria-hidden="true" fill="none" height="40" viewBox="0 0 36 36" width="40">
      <rect fill="#d8fcb3" height="36" width="36" />
      <rect
        fill="#89fcb3"
        height="36"
        rx="6"
        transform="translate(9 -5) rotate(219 18 18) scale(1)"
        width="36"
      />
      <g transform="translate(4.5 -4) rotate(9 18 18)">
        <path d="M15 19c2 1 4 1 6 0" fill="none" stroke="#000" strokeLinecap="round" />
        <rect fill="#000" height="2" rx="1" width="1.5" x="10" y="14" />
        <rect fill="#000" height="2" rx="1" width="1.5" x="24" y="14" />
      </g>
    </svg>
  )
}

const avatars: Avatar[] = [
  { id: 1, art: <AvatarOne />, alt: "Avatar 1", accent: "255, 0, 91" },
  { id: 2, art: <AvatarTwo />, alt: "Avatar 2", accent: "255, 125, 16" },
  { id: 3, art: <AvatarThree />, alt: "Avatar 3", accent: "255, 0, 91" },
  { id: 4, art: <AvatarFour />, alt: "Avatar 4", accent: "137, 252, 179" },
]

export interface AvatarPickerProps {
  onComplete: (data: { username: string; avatarId: number }) => void
  className?: string
  title?: string
  description?: string
  submitLabel?: string
  defaultUsername?: string
  defaultAvatarId?: number
}

const containerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const thumbnailVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
}

export default function AvatarPicker({
  onComplete,
  className,
  title = "Pick your avatar",
  description = "Choose one to get started",
  submitLabel = "Continue",
  defaultUsername = "",
  defaultAvatarId = avatars[0].id,
}: AvatarPickerProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(
    avatars.find((avatar) => avatar.id === defaultAvatarId) ?? avatars[0],
  )
  const [username, setUsername] = useState(defaultUsername)
  const [isFocused, setIsFocused] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const usernameId = useId()
  const countId = `${usernameId}-count`
  const errorId = `${usernameId}-error`
  const trimmedUsername = username.trim()
  const isValid = trimmedUsername.length >= 3
  const showError = trimmedUsername.length > 0 && !isValid

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isValid) return
    onComplete({ username: trimmedUsername, avatarId: selectedAvatar.id })
  }

  return (
    <Card
      className={cn(
        "relative mx-auto w-full max-w-[400px] border-border bg-card",
        className,
      )}
    >
      <CardContent className="p-6 sm:p-8">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-1 text-center">
            <h2 className="font-semibold text-xl tracking-tight">{title}</h2>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative h-40 w-40">
              <motion.div
                animate={{
                  boxShadow: `0 0 0 2px rgba(${selectedAvatar.accent}, 0.55), 0 6px 24px rgba(${selectedAvatar.accent}, 0.18)`,
                }}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full"
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.45, ease: "easeOut" }
                }
              />

              <div className="relative h-full w-full overflow-hidden rounded-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    animate={{ opacity: 1 }}
                    aria-label={selectedAvatar.alt}
                    className="absolute inset-0 flex items-center justify-center"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    key={selectedAvatar.id}
                    role="img"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { duration: 0.2, ease: "easeOut" }
                    }
                  >
                    <div className="scale-[4] transform">{selectedAvatar.art}</div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.span
                animate={{ opacity: 1 }}
                className="text-[11px] text-muted-foreground uppercase tracking-[0.12em]"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                key={selectedAvatar.id}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.16, ease: "easeOut" }
                }
              >
                {selectedAvatar.alt}
              </motion.span>
            </AnimatePresence>

            <motion.div
              animate="animate"
              className="grid grid-cols-4 gap-2 sm:gap-3"
              initial="initial"
              variants={containerVariants}
            >
              {avatars.map((avatar) => {
                const isSelected = selectedAvatar.id === avatar.id
                return (
                  <motion.button
                    aria-label={`Select ${avatar.alt}`}
                    aria-pressed={isSelected}
                    className={cn(
                      "relative h-14 w-14 overflow-hidden rounded-xl border bg-muted transition-[opacity,box-shadow] duration-200 ease-out motion-reduce:transition-none",
                      isSelected
                        ? "border-foreground/20 opacity-100 ring-2 ring-foreground/70 ring-offset-2 ring-offset-background"
                        : "border-border opacity-50 [@media(hover:hover)]:hover:opacity-100",
                    )}
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar)}
                    type="button"
                    variants={thumbnailVariants}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.06 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.94 }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="scale-[2.3] transform">{avatar.art}</div>
                    </div>
                    {isSelected && (
                      <div className="absolute right-0 bottom-0 flex h-5 w-5 items-center justify-center rounded-tl-md bg-foreground">
                        <Check aria-hidden="true" className="h-3 w-3 text-background" />
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </motion.div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-medium text-sm" htmlFor={usernameId}>
                  Username
                </label>
                <span
                  className={cn(
                    "text-xs tabular-nums transition-colors duration-200 ease-out motion-reduce:transition-none",
                    username.length >= 18
                      ? "text-amber-500 dark:text-amber-400"
                      : "text-muted-foreground/50",
                  )}
                  id={countId}
                >
                  {username.length}/20
                </span>
              </div>

              <div className="relative">
                <Input
                  aria-describedby={`${countId}${showError ? ` ${errorId}` : ""}`}
                  aria-invalid={showError}
                  autoComplete="username"
                  className={cn(
                    "h-10 pl-9 text-sm",
                    showError &&
                      "border-destructive/50 focus-visible:ring-destructive",
                  )}
                  id={usernameId}
                  maxLength={20}
                  name="username"
                  onBlur={() => setIsFocused(false)}
                  onChange={(event) => setUsername(event.target.value)}
                  onFocus={() => setIsFocused(true)}
                  placeholder="your_username"
                  spellCheck={false}
                  type="text"
                  value={username}
                />
                <User2
                  aria-hidden="true"
                  className={cn(
                    "absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transition-colors duration-200 ease-out motion-reduce:transition-none",
                    isFocused ? "text-foreground" : "text-muted-foreground",
                  )}
                />
              </div>

              <AnimatePresence>
                {showError && (
                  <motion.p
                    animate={{ opacity: 1, y: 0 }}
                    className="ml-0.5 text-destructive text-xs"
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -4 }}
                    id={errorId}
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -4 }}
                    role="alert"
                    transition={{ duration: shouldReduceMotion ? 0 : 0.15, ease: "easeOut" }}
                  >
                    Username must be at least 3 characters
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <Button className="group h-10 w-full text-sm" disabled={!isValid} type="submit">
              {submitLabel}
              <ChevronRight
                aria-hidden="true"
                className="ml-1 h-4 w-4 transition-transform duration-200 ease-out motion-reduce:transition-none [@media(hover:hover)]:group-hover:translate-x-0.5"
              />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
