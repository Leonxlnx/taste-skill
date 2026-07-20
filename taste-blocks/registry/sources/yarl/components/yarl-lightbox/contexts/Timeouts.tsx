import * as React from "react";

import { makeUseContext } from "../utils.js";

export type TimeoutsContextType = {
  setTimeout: (fn: () => void, delay?: number) => number;
  clearTimeout: (id?: number) => void;
};

export const TimeoutsContext = React.createContext<TimeoutsContextType | null>(null);

export const useTimeouts = makeUseContext("useTimeouts", "TimeoutsContext", TimeoutsContext);

export function TimeoutsProvider({ children }: React.PropsWithChildren) {
  const [timeouts] = React.useState<number[]>([]);

  React.useEffect(
    () => () => {
      timeouts.forEach((tid) => window.clearTimeout(tid));
      timeouts.splice(0, timeouts.length);
    },
    [timeouts],
  );

  const context = React.useMemo(() => {
    const removeTimeout = (id: number) => {
      timeouts.splice(0, timeouts.length, ...timeouts.filter((tid) => tid !== id));
    };

    const setTimeout = (fn: () => void, delay?: number) => {
      const id = window.setTimeout(() => {
        removeTimeout(id);
        fn();
      }, delay);
      timeouts.push(id);
      return id;
    };

    const clearTimeout = (id?: number) => {
      if (id !== undefined) {
        removeTimeout(id);
        window.clearTimeout(id);
      }
    };

    return { setTimeout, clearTimeout };
  }, [timeouts]);

  return <TimeoutsContext.Provider value={context}>{children}</TimeoutsContext.Provider>;
}
