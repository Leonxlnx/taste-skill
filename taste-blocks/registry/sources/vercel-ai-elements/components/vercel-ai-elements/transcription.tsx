"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo } from "react";

export interface TranscriptionSegment {
  endSecond: number;
  startSecond: number;
  text: string;
}

interface TranscriptionContextValue {
  segments: TranscriptionSegment[];
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onSeek?: (time: number) => void;
}

const TranscriptionContext = createContext<TranscriptionContextValue | null>(
  null
);

const useTranscription = () => {
  const context = useContext(TranscriptionContext);
  if (!context) {
    throw new Error(
      "Transcription components must be used within Transcription"
    );
  }
  return context;
};

export type TranscriptionProps = Omit<ComponentProps<"div">, "children"> & {
  segments: TranscriptionSegment[];
  currentTime?: number;
  onSeek?: (time: number) => void;
  children: (segment: TranscriptionSegment, index: number) => ReactNode;
};

export const Transcription = ({
  segments,
  currentTime: externalCurrentTime,
  onSeek,
  className,
  children,
  ...props
}: TranscriptionProps) => {
  const [currentTime, setCurrentTime] = useControllableState({
    defaultProp: 0,
    onChange: onSeek,
    prop: externalCurrentTime,
  });

  const contextValue = useMemo(
    () => ({ currentTime, onSeek, onTimeUpdate: setCurrentTime, segments }),
    [currentTime, onSeek, setCurrentTime, segments]
  );

  return (
    <TranscriptionContext.Provider value={contextValue}>
      <div
        className={cn(
          "flex flex-wrap gap-1 text-sm leading-relaxed",
          className
        )}
        data-slot="transcription"
        {...props}
      >
        {segments
          .filter((segment) => segment.text.trim())
          .map((segment, index) => children(segment, index))}
      </div>
    </TranscriptionContext.Provider>
  );
};

export type TranscriptionSegmentProps = ComponentProps<"button"> & {
  segment: TranscriptionSegment;
  index: number;
};

export const TranscriptionSegment = ({
  segment,
  index,
  className,
  onClick,
  ...props
}: TranscriptionSegmentProps) => {
  const { currentTime, onSeek } = useTranscription();

  const isActive =
    currentTime >= segment.startSecond && currentTime < segment.endSecond;
  const isPast = currentTime >= segment.endSecond;

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (onSeek) {
        onSeek(segment.startSecond);
      }
      onClick?.(event);
    },
    [onSeek, segment.startSecond, onClick]
  );

  return (
    <button
      className={cn(
        "inline text-start",
        isActive && "text-primary",
        isPast && "text-muted-foreground",
        !(isActive || isPast) && "text-muted-foreground/60",
        onSeek && "cursor-pointer hover:text-foreground",
        !onSeek && "cursor-default",
        className
      )}
      data-active={isActive}
      data-index={index}
      data-slot="transcription-segment"
      onClick={handleClick}
      type="button"
      {...props}
    >
      {segment.text}
    </button>
  );
};
