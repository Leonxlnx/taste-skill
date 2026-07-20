"use client";

import { cva, type VariantProps } from "class-variance-authority";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import * as React from "react";
import { cn } from "./utils";

const videoPlayerVariants = cva(
  "group relative w-full touch-manipulation overflow-hidden rounded-xl bg-black",
  {
    variants: {
      size: {
        sm: "max-w-md",
        default: "max-w-2xl",
        lg: "max-w-4xl",
        full: "w-full",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface VideoPlayerProps
  extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, "controls">,
    VariantProps<typeof videoPlayerVariants> {
  src: string;
  poster?: string;
  showControls?: boolean;
  autoHide?: boolean;
  playerLabel?: string;
  videoLabel?: string;
  className?: string;
}

const VideoPlayer = React.forwardRef<HTMLVideoElement, VideoPlayerProps>(
  (
    {
      className,
      size,
      src,
      poster,
      showControls = true,
      autoHide = true,
      playerLabel = "Video player",
      videoLabel = "Video",
      onClick,
      playsInline = true,
      preload = "metadata",
      ...props
    },
    ref
  ) => {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [volume, setVolume] = React.useState(1);
    const [isMuted, setIsMuted] = React.useState(Boolean(props.muted));
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [controlsVisible, setControlsVisible] = React.useState(true);

    const videoRef = React.useRef<HTMLVideoElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const hideControlsTimeoutRef = React.useRef<number | null>(null);
    const liveRef = React.useRef<HTMLDivElement>(null);
    const inputId = React.useId();
    const progressId = `${inputId}-progress`;
    const volumeId = `${inputId}-volume`;

    React.useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

    const formatTime = (time: number) => {
      if (!Number.isFinite(time) || time < 0) return "0:00";
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time % 3600) / 60);
      const seconds = Math.floor(time % 60);
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
      }
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const announce = React.useCallback((message: string) => {
      if (!liveRef.current) return;
      liveRef.current.textContent = "";
      window.requestAnimationFrame(() => {
        if (liveRef.current) liveRef.current.textContent = message;
      });
    }, []);

    const clearHideControlsTimeout = React.useCallback(() => {
      if (hideControlsTimeoutRef.current === null) return;
      window.clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = null;
    }, []);

    const scheduleControlsHide = React.useCallback(() => {
      clearHideControlsTimeout();
      if (!(autoHide && videoRef.current && !videoRef.current.paused)) return;

      hideControlsTimeoutRef.current = window.setTimeout(() => {
        const container = containerRef.current;
        if (container?.contains(document.activeElement)) return;
        setControlsVisible(false);
      }, 3000);
    }, [autoHide, clearHideControlsTimeout]);

    const revealControls = React.useCallback(() => {
      setControlsVisible(true);
      scheduleControlsHide();
    }, [scheduleControlsHide]);

    const togglePlay = React.useCallback(() => {
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) {
        void video.play().catch(() => {
          setControlsVisible(true);
          announce("Playback could not start");
        });
      } else {
        video.pause();
      }
    }, [announce]);

    const toggleMute = React.useCallback(() => {
      const video = videoRef.current;
      if (!video) return;
      video.muted = !video.muted;
    }, []);

    const handleVolumeChange = React.useCallback((nextVolume: number) => {
      const video = videoRef.current;
      if (!video) return;
      const clampedVolume = Math.max(0, Math.min(1, nextVolume));
      video.volume = clampedVolume;
      video.muted = clampedVolume === 0;
    }, []);

    const handleSeek = React.useCallback((nextTime: number) => {
      const video = videoRef.current;
      if (!(video && Number.isFinite(nextTime))) return;
      const safeDuration = Number.isFinite(video.duration) ? video.duration : 0;
      video.currentTime = Math.max(0, Math.min(safeDuration, nextTime));
    }, []);

    const toggleFullscreen = React.useCallback(() => {
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => {
          announce("Fullscreen could not close");
        });
        return;
      }

      const container = containerRef.current;
      if (!container?.requestFullscreen) {
        announce("Fullscreen is not available");
        return;
      }
      void container.requestFullscreen().catch(() => {
        announce("Fullscreen could not open");
      });
    }, [announce]);

    const skip = React.useCallback(
      (seconds: number) => {
        const video = videoRef.current;
        if (!video) return;
        const safeDuration = Number.isFinite(video.duration)
          ? video.duration
          : video.currentTime + Math.abs(seconds);
        const nextTime = Math.max(
          0,
          Math.min(safeDuration, video.currentTime + seconds)
        );
        video.currentTime = nextTime;
        setCurrentTime(nextTime);
        announce(
          `${seconds > 0 ? "Forward" : "Back"} ${Math.abs(seconds)} seconds`
        );
      },
      [announce]
    );

    React.useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const onLoadedMetadata = () => {
        setDuration(Number.isFinite(video.duration) ? video.duration : 0);
        setCurrentTime(video.currentTime || 0);
      };
      const onTimeUpdate = () => setCurrentTime(video.currentTime || 0);
      const onPlay = () => {
        setIsPlaying(true);
        announce("Playing");
        scheduleControlsHide();
      };
      const onPause = () => {
        setIsPlaying(false);
        setControlsVisible(true);
        clearHideControlsTimeout();
        announce("Paused");
      };
      const onEnded = () => {
        setIsPlaying(false);
        setControlsVisible(true);
        clearHideControlsTimeout();
        announce("Playback ended");
      };
      const onVolumeChange = () => {
        setVolume(video.volume);
        setIsMuted(video.muted);
      };

      video.addEventListener("durationchange", onLoadedMetadata);
      video.addEventListener("loadedmetadata", onLoadedMetadata);
      video.addEventListener("timeupdate", onTimeUpdate);
      video.addEventListener("play", onPlay);
      video.addEventListener("pause", onPause);
      video.addEventListener("ended", onEnded);
      video.addEventListener("volumechange", onVolumeChange);

      return () => {
        video.removeEventListener("durationchange", onLoadedMetadata);
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        video.removeEventListener("timeupdate", onTimeUpdate);
        video.removeEventListener("play", onPlay);
        video.removeEventListener("pause", onPause);
        video.removeEventListener("ended", onEnded);
        video.removeEventListener("volumechange", onVolumeChange);
        clearHideControlsTimeout();
      };
    }, [announce, clearHideControlsTimeout, scheduleControlsHide]);

    React.useEffect(() => {
      const onFullscreenChange = () => {
        setIsFullscreen(document.fullscreenElement === containerRef.current);
      };
      document.addEventListener("fullscreenchange", onFullscreenChange);
      return () =>
        document.removeEventListener("fullscreenchange", onFullscreenChange);
    }, []);

    React.useEffect(() => {
      if (autoHide) return;
      clearHideControlsTimeout();
      setControlsVisible(true);
    }, [autoHide, clearHideControlsTimeout]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (
        event.target instanceof HTMLButtonElement ||
        event.target instanceof HTMLInputElement
      ) {
        return;
      }

      switch (event.key) {
        case " ":
        case "k":
          event.preventDefault();
          togglePlay();
          break;
        case "m":
          event.preventDefault();
          toggleMute();
          break;
        case "f":
          event.preventDefault();
          toggleFullscreen();
          break;
        case "ArrowLeft":
          event.preventDefault();
          skip(-10);
          break;
        case "ArrowRight":
          event.preventDefault();
          skip(10);
          break;
        case "ArrowUp":
          event.preventDefault();
          handleVolumeChange(volume + 0.1);
          break;
        case "ArrowDown":
          event.preventDefault();
          handleVolumeChange(volume - 0.1);
          break;
        default:
          break;
      }
    };

    const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
    const volumePercentage = (isMuted ? 0 : volume) * 100;
    const controlVisibility = controlsVisible
      ? "visible opacity-100"
      : "invisible opacity-0";

    return (
      <div
        aria-label={playerLabel}
        className={cn(
          videoPlayerVariants({ size }),
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
          className
        )}
        onBlurCapture={scheduleControlsHide}
        onFocusCapture={() => {
          clearHideControlsTimeout();
          setControlsVisible(true);
        }}
        onKeyDown={handleKeyDown}
        onPointerDown={revealControls}
        onPointerLeave={scheduleControlsHide}
        onPointerMove={revealControls}
        ref={containerRef}
        role="region"
        tabIndex={0}
      >
        <div
          aria-atomic="true"
          aria-live="polite"
          className="sr-only"
          ref={liveRef}
        />
        <video
          {...props}
          aria-label={videoLabel}
          className="h-full w-full object-cover"
          onClick={(event) => {
            togglePlay();
            onClick?.(event);
          }}
          playsInline={playsInline}
          poster={poster}
          preload={preload}
          ref={videoRef}
          src={src}
        />
        {showControls && (
          <>
            <div
              className={cn(
                "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-200 motion-reduce:transition-none",
                controlVisibility
              )}
            >
              <button
                aria-label={isPlaying ? "Pause" : "Play"}
                className="pointer-events-auto flex size-14 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none sm:size-16"
                onClick={(event) => {
                  event.stopPropagation();
                  togglePlay();
                }}
                type="button"
              >
                {isPlaying ? (
                  <Pause aria-hidden="true" className="size-6" />
                ) : (
                  <Play aria-hidden="true" className="size-6" />
                )}
              </button>
            </div>

            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/50 to-transparent transition-opacity duration-200 motion-reduce:transition-none",
                controlVisibility
              )}
              dir="ltr"
            >
              <div className="pointer-events-auto flex flex-col gap-2 p-3 sm:p-4">
                <div className="flex items-center gap-2 text-sm text-white">
                  <span aria-live="off" className="font-mono text-xs">
                    {formatTime(currentTime)}
                  </span>
                  <div className="group/progress relative min-w-0 flex-1">
                    <label className="sr-only" htmlFor={progressId}>
                      Seek
                    </label>
                    <input
                      aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
                      className="h-5 w-full cursor-pointer appearance-none rounded-full bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white [&::-moz-range-progress]:h-1 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-white [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-white/30 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white group-hover/progress:[&::-webkit-slider-thumb]:scale-125"
                      id={progressId}
                      max={duration || 0}
                      min={0}
                      onChange={(event) =>
                        handleSeek(Number.parseFloat(event.target.value))
                      }
                      style={{
                        background: `linear-gradient(to right, #ffffff 0%, #ffffff ${progressPercentage}%, rgba(255,255,255,0.3) ${progressPercentage}%, rgba(255,255,255,0.3) 100%)`,
                      }}
                      type="range"
                      value={currentTime}
                    />
                  </div>
                  <span className="font-mono text-xs">
                    {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1 sm:gap-2">
                    <button
                      aria-label="Skip back 10 seconds"
                      className="rounded-md p-2 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
                      onClick={(event) => {
                        event.stopPropagation();
                        skip(-10);
                      }}
                      type="button"
                    >
                      <SkipBack aria-hidden="true" className="size-4" />
                    </button>
                    <button
                      aria-label={isPlaying ? "Pause" : "Play"}
                      className="rounded-md p-2 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
                      onClick={(event) => {
                        event.stopPropagation();
                        togglePlay();
                      }}
                      type="button"
                    >
                      {isPlaying ? (
                        <Pause aria-hidden="true" className="size-4" />
                      ) : (
                        <Play aria-hidden="true" className="size-4" />
                      )}
                    </button>
                    <button
                      aria-label="Skip forward 10 seconds"
                      className="rounded-md p-2 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
                      onClick={(event) => {
                        event.stopPropagation();
                        skip(10);
                      }}
                      type="button"
                    >
                      <SkipForward aria-hidden="true" className="size-4" />
                    </button>
                    <div className="group/volume flex min-w-0 items-center gap-1 sm:gap-2">
                      <button
                        aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
                        className="rounded-md p-2 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleMute();
                        }}
                        type="button"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX aria-hidden="true" className="size-4" />
                        ) : (
                          <Volume2 aria-hidden="true" className="size-4" />
                        )}
                      </button>
                      <div className="w-14 overflow-hidden transition-[width] duration-200 motion-reduce:transition-none sm:w-0 sm:group-focus-within/volume:w-20 sm:group-hover/volume:w-20">
                        <label className="sr-only" htmlFor={volumeId}>
                          Volume
                        </label>
                        <input
                          aria-valuetext={`${Math.round(volumePercentage)} percent`}
                          className="h-5 w-full cursor-pointer appearance-none rounded-full bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white [&::-moz-range-progress]:h-1 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-white [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-white/30 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:mt-[-2px] [&::-webkit-slider-thumb]:size-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                          id={volumeId}
                          max={1}
                          min={0}
                          onChange={(event) =>
                            handleVolumeChange(
                              Number.parseFloat(event.target.value)
                            )
                          }
                          step={0.1}
                          style={{
                            background: `linear-gradient(to right, #ffffff 0%, #ffffff ${volumePercentage}%, rgba(255,255,255,0.3) ${volumePercentage}%, rgba(255,255,255,0.3) 100%)`,
                          }}
                          type="range"
                          value={isMuted ? 0 : volume}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    aria-label={
                      isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                    }
                    className="shrink-0 rounded-md p-2 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFullscreen();
                    }}
                    type="button"
                  >
                    {isFullscreen ? (
                      <Minimize aria-hidden="true" className="size-4" />
                    ) : (
                      <Maximize aria-hidden="true" className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export { VideoPlayer };
