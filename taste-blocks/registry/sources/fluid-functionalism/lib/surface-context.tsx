"use client";

import { createContext, useContext, type ReactNode } from "react";

const SurfaceContext = createContext<number>(1);

export function useSurface(): number {
  return useContext(SurfaceContext);
}

export function SurfaceProvider({
  value,
  children,
}: {
  value: number;
  children: ReactNode;
}) {
  return (
    <SurfaceContext.Provider value={Math.max(1, Math.min(8, value))}>
      {children}
    </SurfaceContext.Provider>
  );
}
