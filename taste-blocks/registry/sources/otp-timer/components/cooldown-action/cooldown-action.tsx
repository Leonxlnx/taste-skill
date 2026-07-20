"use client"

import { Component, type CSSProperties, type MouseEvent, type ReactNode } from "react"

export type CooldownActionProps = {
  /** Preserved from upstream; the upstream component does not consume it. */
  options?: Record<string, unknown>
  minutes?: number
  seconds?: number
  /**
   * Runs the action. The cooldown restarts after a synchronous return or a
   * fulfilled promise; a thrown error or rejected promise leaves it available.
   */
  resend: () => void | Promise<void>
  ButtonText?: ReactNode
  text?: ReactNode
  textColor?: string
  background?: string
  buttonColor?: string
  buttonStyle?: CSSProperties
  buttonClassName?: string
  timerSpanClass?: string
  timerSpanStyle?: CSSProperties
}

type CooldownActionState = {
  minutes: number
  seconds: number
  pending: boolean
  announcement: string
}

const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
}

function wholeSeconds(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : fallback
}

function cooldownSeconds({ minutes, seconds }: CooldownActionProps) {
  return wholeSeconds(minutes, 0) * 60 + wholeSeconds(seconds, 30)
}

function splitSeconds(total: number) {
  return { minutes: Math.floor(total / 60), seconds: total % 60 }
}

export default class CooldownAction extends Component<
  CooldownActionProps,
  CooldownActionState
> {
  private myInterval: ReturnType<typeof setTimeout> | undefined
  private endAt = 0
  private mounted = false
  private actionPending = false

  constructor(props: CooldownActionProps) {
    super(props)
    this.state = {
      ...splitSeconds(cooldownSeconds(props)),
      pending: false,
      announcement: "",
    }

    this.handleClick = this.handleClick.bind(this)
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this)
    this.otptimer = this.otptimer.bind(this)
    this.updateTimer = this.updateTimer.bind(this)
  }

  componentDidMount() {
    this.mounted = true
    document.addEventListener("visibilitychange", this.handleVisibilityChange)
    this.otptimer()
  }

  componentDidUpdate(previousProps: CooldownActionProps) {
    if (cooldownSeconds(previousProps) !== cooldownSeconds(this.props)) {
      this.setState({ announcement: "" }, this.otptimer)
    }
  }

  componentWillUnmount() {
    this.mounted = false
    this.actionPending = false
    this.clearTimer()
    document.removeEventListener("visibilitychange", this.handleVisibilityChange)
  }

  private clearTimer() {
    if (this.myInterval !== undefined) {
      clearTimeout(this.myInterval)
      this.myInterval = undefined
    }
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      this.clearTimer()
    } else {
      this.updateTimer()
    }
  }

  otptimer() {
    this.clearTimer()
    this.endAt = Date.now() + cooldownSeconds(this.props) * 1000
    this.updateTimer()
  }

  private updateTimer() {
    if (!this.mounted) return

    this.clearTimer()
    const remainingMilliseconds = Math.max(0, this.endAt - Date.now())
    const remaining = Math.ceil(remainingMilliseconds / 1000)
    const next = splitSeconds(remaining)

    this.setState(
      (current) => ({
        ...next,
        pending: current.pending,
        announcement:
          remaining === 0 && (current.minutes > 0 || current.seconds > 0)
            ? "Action available."
            : current.announcement,
      }),
      () => {
        if (!this.mounted || remaining === 0 || document.hidden) return
        const remainder = remainingMilliseconds % 1000
        this.myInterval = setTimeout(
          this.updateTimer,
          Math.max(16, remainder || 1000)
        )
      }
    )
  }

  async handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    if (
      this.actionPending ||
      this.state.minutes > 0 ||
      this.state.seconds > 0
    ) {
      return
    }

    this.actionPending = true
    this.setState({ pending: true, announcement: "Action in progress." })

    try {
      await this.props.resend()
      this.actionPending = false
      if (!this.mounted) return
      this.setState(
        {
          pending: false,
          announcement: "Action completed. Cooldown started.",
        },
        this.otptimer
      )
    } catch {
      this.actionPending = false
      if (!this.mounted) return
      this.setState({
        pending: false,
        announcement: "Action failed. Try again.",
      })
    }
  }

  render() {
    const { minutes, seconds, pending, announcement } = this.state
    const available = minutes === 0 && seconds === 0
    const actionLabel = this.props.ButtonText || "Try again"
    const countdownLabel = this.props.text || "Available in:"
    const textStyle: CSSProperties | undefined = this.props.textColor
      ? { color: this.props.textColor }
      : undefined
    const buttonStyling: CSSProperties = {
      minBlockSize: "2.75rem",
      minInlineSize: "2.75rem",
      background: this.props.background,
      color: this.props.buttonColor,
      ...this.props.buttonStyle,
    }

    return (
      <div style={textStyle}>
        {available ? (
          <button
            aria-busy={pending}
            className={this.props.buttonClassName}
            disabled={pending}
            onClick={this.handleClick}
            style={buttonStyling}
            type="button"
          >
            <span>{actionLabel}</span>
            {pending ? <span aria-hidden="true">…</span> : null}
          </button>
        ) : (
          <span
            aria-live="off"
            className={this.props.timerSpanClass}
            style={this.props.timerSpanStyle}
          >
            <span>{countdownLabel} </span>
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </span>
        )}
        <span aria-atomic="true" aria-live="polite" role="status" style={visuallyHidden}>
          {announcement}
        </span>
      </div>
    )
  }
}
