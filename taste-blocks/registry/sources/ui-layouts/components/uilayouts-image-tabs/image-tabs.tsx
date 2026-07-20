"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createContext, type ReactNode, useContext, useId, useState } from "react";

import { useMediaQuery } from "../../hooks/use-media-query";
import { cn } from "../../lib/utils";

interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
  isDesktop: boolean;
  baseId: string;
  shouldReduceMotion: boolean;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a TabsProvider");
  }
  return context;
};

export function TabsProvider({
  children,
  defaultValue,
  className,
}: {
  children: ReactNode;
  defaultValue: string;
  className?: string;
}) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const shouldReduceMotion = Boolean(useReducedMotion());
  const baseId = useId();

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, isDesktop, baseId, shouldReduceMotion }}>
      <div className={cn("h-full w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      aria-orientation="vertical"
      className={cn("h-fit rounded-xs", className)}
      onKeyDown={(event) => {
        if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) {
          return;
        }
        const tabs = Array.from(
          event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'),
        );
        const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
        if (current < 0 || tabs.length === 0) return;
        event.preventDefault();
        const next =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : (current + (["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1) + tabs.length) %
                tabs.length;
        tabs[next].focus();
        tabs[next].click();
      }}
      role="tablist"
    >
      {children}
    </div>
  );
}

export function TabItem({ children, value }: { children: ReactNode; value: string }) {
  const { activeTab } = useTabs();

  return (
    <motion.div
      className={cn(
        "mb-2 overflow-hidden rounded-lg border-2 text-sm md:text-base",
        activeTab === value
          ? "active border-[#F2F2F2] bg-[#F2F2F2] dark:border-[#656fe2] dark:bg-[#E0ECFB]"
          : "border-transparent bg-transparent dark:hover:border-[#656fe2]",
      )}
    >
      {children}
    </motion.div>
  );
}

export function TabHeader({ children, value }: { children: ReactNode; value: string }) {
  const { activeTab, baseId, setActiveTab } = useTabs();
  const isActive = activeTab === value;

  return (
    <button
      aria-controls={`${baseId}-panel-${value}`}
      aria-selected={isActive}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between p-4 text-left text-sm font-semibold text-black transition-all hover:bg-[#F2F2F2] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-[-2px] md:text-base dark:text-white dark:hover:bg-[#1e2a78] dark:hover:text-white",
        isActive && "active bg-[#F2F2F2] dark:bg-[#1e2a78]",
      )}
      id={`${baseId}-tab-${value}`}
      onClick={() => setActiveTab(value)}
      role="tab"
      tabIndex={isActive ? 0 : -1}
      type="button"
    >
      {children}
    </button>
  );
}

export function TabDes({ children, value }: { children: ReactNode; value: string }) {
  const { activeTab, baseId, shouldReduceMotion } = useTabs();
  return (
    <AnimatePresence initial={!shouldReduceMotion} mode="sync">
      {activeTab === value && (
        <motion.div
          animate={{ height: "auto", opacity: 1 }}
          aria-labelledby={`${baseId}-tab-${value}`}
          exit={{ height: 0, opacity: 0 }}
          id={`${baseId}-panel-${value}`}
          initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
          role="tabpanel"
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.3, ease: "easeInOut", delay: 0.14 }
          }
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function TabImageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { shouldReduceMotion } = useTabs();
  return (
    <div className={className}>
      <AnimatePresence initial={!shouldReduceMotion} mode="popLayout">
        {children}
      </AnimatePresence>
    </div>
  );
}

export function TabImage({ children, value }: { children: ReactNode; value: string }) {
  const { activeTab, isDesktop, shouldReduceMotion } = useTabs();

  if (activeTab !== value || !isDesktop) return null;

  return (
    <motion.div
      animate={{ opacity: 1, overflow: "hidden" }}
      className="h-[400px] overflow-hidden rounded-md p-4"
      exit={{ opacity: 0, overflow: "hidden" }}
      initial={shouldReduceMotion ? false : { opacity: 0, overflow: "hidden" }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
