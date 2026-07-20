import * as React from "react";

import { LightboxProps, LightboxState, LightboxStateSwipeAction, LightboxStateUpdateAction } from "../types.js";
import { getSlideIfPresent, getSlideIndex, makeUseContext } from "../utils.js";
import { UNKNOWN_ACTION_TYPE } from "../consts.js";

export type LightboxStateAction = LightboxStateSwipeAction | LightboxStateUpdateAction;

export type LightboxStateContextType = LightboxState & {
  /** @deprecated - use `useLightboxState` props directly */
  state: LightboxState;
  /** @deprecated - use `useLightboxDispatch` instead */
  dispatch: React.Dispatch<LightboxStateAction>;
};

export const LightboxStateContext = React.createContext<LightboxStateContextType | null>(null);

export const useLightboxState = makeUseContext("useLightboxState", "LightboxStateContext", LightboxStateContext);

export type LightboxDispatchContextType = React.Dispatch<LightboxStateAction>;

export const LightboxDispatchContext = React.createContext<LightboxDispatchContextType | null>(null);

export const useLightboxDispatch = makeUseContext(
  "useLightboxDispatch",
  "LightboxDispatchContext",
  LightboxDispatchContext,
);

function reducer(state: LightboxState, action: LightboxStateAction): LightboxState {
  switch (action.type) {
    case "swipe": {
      const { slides } = state;
      const increment = action?.increment || 0;
      const globalIndex = state.globalIndex + increment;
      const currentIndex = getSlideIndex(globalIndex, slides.length);
      const currentSlide = getSlideIfPresent(slides, currentIndex);
      const animation =
        increment || action.duration !== undefined
          ? {
              increment,
              duration: action.duration,
              easing: action.easing,
            }
          : undefined;
      return { slides, currentIndex, globalIndex, currentSlide, animation };
    }
    case "update":
      if (action.slides !== state.slides || action.index !== state.currentIndex) {
        return {
          slides: action.slides,
          currentIndex: action.index,
          globalIndex: action.index,
          currentSlide: getSlideIfPresent(action.slides, action.index),
        };
      }
      return state;
    default:
      throw new Error(UNKNOWN_ACTION_TYPE);
  }
}

export type LightboxStateProviderProps = React.PropsWithChildren<Pick<LightboxProps, "slides" | "index">>;

export function LightboxStateProvider({ slides, index, children }: LightboxStateProviderProps) {
  const [state, dispatch] = React.useReducer(reducer, {
    slides,
    currentIndex: index,
    globalIndex: index,
    currentSlide: getSlideIfPresent(slides, index),
  });

  const [prevSlides, setPrevSlides] = React.useState(slides);
  const [prevIndex, setPrevIndex] = React.useState(index);

  if (slides !== prevSlides || index !== prevIndex) {
    setPrevSlides(slides);
    setPrevIndex(index);
    dispatch({ type: "update", slides, index });
  }

  const context = React.useMemo(() => ({ ...state, state, dispatch }), [state, dispatch]);

  return (
    <LightboxDispatchContext.Provider value={dispatch}>
      <LightboxStateContext.Provider value={context}>{children}</LightboxStateContext.Provider>
    </LightboxDispatchContext.Provider>
  );
}
