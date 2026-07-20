import * as React from "react";

import { makeUseContext } from "../utils.js";
import { EventTypes } from "../types.js";

export type Topic = keyof EventTypes;

export type Event<T extends Topic> = EventTypes[T];

export type EventCallback<T extends Topic> = (...args: Event<T> extends void ? [] : [event: Event<T>]) => void;

export type Subscribe = <T extends Topic>(topic: T, callback: EventCallback<T>) => () => void;

export type Unsubscribe = <T extends Topic>(topic: T, callback: EventCallback<T>) => void;

export type Publish = <T extends Topic>(
  ...args: Event<T> extends void ? [topic: T] : [topic: T, event: Event<T>]
) => void;

export type EventsContextType = {
  subscribe: Subscribe;
  unsubscribe: Unsubscribe;
  publish: Publish;
};

export const EventsContext = React.createContext<EventsContextType | null>(null);

export const useEvents = makeUseContext("useEvents", "EventsContext", EventsContext);

export function EventsProvider({ children }: React.PropsWithChildren) {
  const [subscriptions] = React.useState<{ [T in Topic]?: EventCallback<T>[] }>({});

  React.useEffect(
    () => () => {
      (Object.keys(subscriptions) as Topic[]).forEach((topic) => delete subscriptions[topic]);
    },
    [subscriptions],
  );

  const context = React.useMemo<EventsContextType>(() => {
    const unsubscribe = <T extends Topic>(topic: T, callback: EventCallback<T>) => {
      subscriptions[topic]?.splice(
        0,
        subscriptions[topic]!.length,
        ...subscriptions[topic]!.filter((cb) => cb !== callback),
      );
    };

    const subscribe = <T extends Topic>(topic: T, callback: EventCallback<T>) => {
      if (!subscriptions[topic]) {
        subscriptions[topic] = [];
      }
      subscriptions[topic]!.push(callback);

      return () => unsubscribe(topic, callback);
    };

    const publish = <T extends Topic>(...[topic, event]: Event<T> extends void ? [T] : [T, Event<T>]) => {
      // most likely culprit - https://github.com/microsoft/TypeScript/issues/29131
      subscriptions[topic]?.forEach((callback) => (callback as unknown as (event?: Event<T>) => void)(event));
    };

    return { publish, subscribe, unsubscribe };
  }, [subscriptions]);

  return <EventsContext.Provider value={context}>{children}</EventsContext.Provider>;
}
