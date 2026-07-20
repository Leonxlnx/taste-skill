"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import React, {
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "../../lib/utils";

interface ProgressSliderContextType {
  active: string;
  progress: number;
  handleButtonClick: (value: string) => void;
  vertical: boolean;
}

export interface ProgressSliderProps {
  children: ReactNode;
  autoPlay?: boolean;
  paused?: boolean;
  duration?: number;
  fastDuration?: number;
  vertical?: boolean;
  activeSlider: string;
  className?: string;
}

interface SliderContentProps {
  children: ReactNode;
  className?: string;
}

interface SliderWrapperProps {
  children: ReactNode;
  value: string;
  className?: string;
}

interface ProgressBarProps {
  children: ReactNode;
  className?: string;
}

interface SliderBtnProps {
  children: ReactNode;
  value: string;
  className?: string;
  progressBarClass?: string;
}

const ProgressSliderContext = createContext<ProgressSliderContextType | undefined>(undefined);

export const useProgressSliderContext = (): ProgressSliderContextType => {
  const context = useContext(ProgressSliderContext);
  if (!context) {
    throw new Error("useProgressSliderContext must be used within a ProgressSlider");
  }
  return context;
};

export const ProgressSlider: FC<ProgressSliderProps> = ({
  children,
  autoPlay = false,
  paused = false,
  duration = 5000,
  fastDuration = 400,
  vertical = false,
  activeSlider,
  className,
}) => {
  const [active, setActive] = useState(activeSlider);
  const [progress, setProgress] = useState(0);
  const [isFastForward, setIsFastForward] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [sliderValues, setSliderValues] = useState<string[]>([]);
  const frame = useRef(0);
  const firstFrameTime = useRef(0);
  const fastForwardStart = useRef(0);
  const targetValue = useRef<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(rootRef);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const getChildren = React.Children.toArray(children).find(
      (child) => (child as React.ReactElement<{ children?: ReactNode }>).type === SliderContent,
    ) as React.ReactElement<{ children?: ReactNode }> | undefined;

    const values = getChildren
      ? React.Children.toArray(getChildren.props.children).map(
          (child) => (child as React.ReactElement<{ value: string }>).props.value,
        )
      : [];
    setSliderValues(values);
  }, [children]);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState === "visible");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (
      sliderValues.length === 0 ||
      !pageVisible ||
      !isInView ||
      shouldReduceMotion ||
      (!isFastForward && (!autoPlay || paused || interactionPaused))
    ) {
      return;
    }

    firstFrameTime.current = performance.now();
    const animate = (now: number) => {
      const currentDuration = Math.max(1, isFastForward ? fastDuration : duration);
      const timeFraction = (now - firstFrameTime.current) / currentDuration;

      if (timeFraction <= 1) {
        setProgress(
          isFastForward
            ? fastForwardStart.current + (100 - fastForwardStart.current) * timeFraction
            : timeFraction * 100,
        );
        frame.current = requestAnimationFrame(animate);
        return;
      }

      if (isFastForward) {
        setIsFastForward(false);
        if (targetValue.current !== null) {
          setActive(targetValue.current);
          targetValue.current = null;
        }
      } else {
        const currentIndex = sliderValues.indexOf(active);
        setActive(sliderValues[(currentIndex + 1) % sliderValues.length]);
      }
      setProgress(0);
    };

    frame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame.current);
  }, [active, autoPlay, duration, fastDuration, interactionPaused, isFastForward, isInView, pageVisible, paused, shouldReduceMotion, sliderValues]);

  const handleButtonClick = (value: string) => {
    if (value === active) return;
    if (shouldReduceMotion) {
      setActive(value);
      setProgress(0);
      return;
    }

    fastForwardStart.current = autoPlay && !paused && !interactionPaused ? progress : 0;
    setProgress(fastForwardStart.current);
    targetValue.current = value;
    setIsFastForward(true);
  };

  return (
    <ProgressSliderContext.Provider value={{ active, progress, handleButtonClick, vertical }}>
      <div
        ref={rootRef}
        className={cn("relative", className)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setInteractionPaused(false);
          }
        }}
        onFocusCapture={() => setInteractionPaused(true)}
        onMouseEnter={() => setInteractionPaused(true)}
        onMouseLeave={() => setInteractionPaused(false)}
      >
        {children}
      </div>
    </ProgressSliderContext.Provider>
  );
};

export const SliderContent: FC<SliderContentProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

export const SliderWrapper: FC<SliderWrapperProps> = ({ children, value, className }) => {
  const { active } = useProgressSliderContext();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={!shouldReduceMotion} mode="popLayout">
      {active === value && (
        <motion.div
          key={value}
          animate={{ opacity: 1 }}
          className={className}
          exit={{ opacity: 0 }}
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const SliderBtnGroup: FC<ProgressBarProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

export const SliderBtn: FC<SliderBtnProps> = ({ children, value, className, progressBarClass }) => {
  const { active, progress, handleButtonClick, vertical } = useProgressSliderContext();
  const isActive = active === value;

  return (
    <button
      aria-pressed={isActive}
      className={cn("relative", isActive ? "opacity-100" : "opacity-50", className)}
      onClick={() => handleButtonClick(value)}
      type="button"
    >
      {children}
      <span aria-hidden="true" className="absolute inset-0 -z-10 max-h-full max-w-full overflow-hidden">
        <span
          className={cn("absolute left-0", progressBarClass)}
          style={{ [vertical ? "height" : "width"]: isActive ? `${progress}%` : "0%" }}
        />
      </span>
    </button>
  );
};
