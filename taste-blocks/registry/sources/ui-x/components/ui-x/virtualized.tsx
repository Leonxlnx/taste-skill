"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import * as React from "react";
import { experimental_VGrid as VGrid, VList, Virtualizer } from "virtua";

const VirtualizedContext = React.createContext<{
  scrollRef: React.RefObject<HTMLDivElement | null>;
  withScrollRef: boolean;
}>({
  scrollRef: { current: null },
  withScrollRef: false,
});

function useVirtualized() {
  const context = React.useContext(VirtualizedContext);
  if (!context) {
    throw new Error("useVirtualized must be used within a <Virtualized />.");
  }
  return context;
}

function Virtualized({ render, ...props }: useRender.ComponentProps<"div">) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const element = useRender({
    render,
    ref: scrollRef,
    defaultTagName: "div",
    props: mergeProps<"div">(
      { "data-slot": "virtualized" } as React.ComponentProps<"div">,
      props,
    ),
  });

  return (
    <VirtualizedContext.Provider value={{ scrollRef, withScrollRef: true }}>
      {element}
    </VirtualizedContext.Provider>
  );
}

export interface VirtualizedListProps extends Omit<
  React.ComponentProps<typeof VList>,
  "horizontal"
> {
  orientation?: "vertical" | "horizontal";
}

function VirtualizedList({
  orientation = "vertical",
  ...props
}: VirtualizedListProps) {
  const { withScrollRef } = useVirtualized();

  if (withScrollRef) {
    throw new Error(
      "<VirtualizedList /> must not be used within a <Virtualized />.",
    );
  }

  return (
    <VList
      data-slot="virtualized-list"
      horizontal={orientation === "horizontal"}
      {...props}
    />
  );
}

function VirtualizedGrid(props: React.ComponentProps<typeof VGrid>) {
  return <VGrid data-slot="virtualized-grid" {...props} />;
}

function VirtualizedVirtualizer({
  ...props
}: Omit<React.ComponentProps<typeof Virtualizer>, "scrollRef">) {
  const { scrollRef, withScrollRef } = useVirtualized();

  return (
    <Virtualizer
      data-slot="virtualized-virtualizer"
      scrollRef={withScrollRef ? scrollRef : undefined}
      {...props}
    />
  );
}

export {
  Virtualized,
  VirtualizedList,
  VirtualizedGrid,
  VirtualizedVirtualizer,
};
