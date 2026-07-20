import {
  CSSProperties,
  ElementType,
  FunctionComponent,
  PureComponent,
  ReactNode,
} from 'react';

/** Type of list; changes the behavior of swipeable items. */
export const Type: {
  readonly ANDROID: unique symbol;
  readonly IOS: unique symbol;
  readonly MS: unique symbol;
};

export type Type = (typeof Type)[keyof typeof Type];

export interface SwipeActionProps {
  children: ReactNode;
  className?: string;
  /** Plays the remove state before the callback. Default: `false`. */
  destructive?: boolean;
  /** Callback called after the swipe action is triggered. */
  onClick: () => void;
  /** Element used for the action. Default: `button`. */
  Tag?: ElementType;
}

export const SwipeAction: FunctionComponent<SwipeActionProps>;

export interface LeadingActionsProps {
  children: ReactNode;
}

export const LeadingActions: FunctionComponent<LeadingActionsProps>;

export interface TrailingActionsProps {
  children: ReactNode;
}

export const TrailingActions: FunctionComponent<TrailingActionsProps>;

export interface SwipeableListProps {
  /** Delay before an action and its animation run. Default: `0`. */
  actionDelay?: number;
  children: ReactNode;
  className?: string;
  /** Delay before a destructive callback runs. Default: `1000`. */
  destructiveCallbackDelay?: number;
  /** Allows a full swipe to trigger an iOS-style action. Default: `false`. */
  fullSwipe?: boolean;
  /** Disables mouse swiping. Default: `false`. */
  optOutMouseEvents?: boolean;
  /** Vertical distance that establishes scrolling. Default: `10`. */
  scrollStartThreshold?: number;
  style?: CSSProperties;
  /** Horizontal distance that establishes swiping. Default: `10`. */
  swipeStartThreshold?: number;
  /** Element used for the list. Default: `div`. */
  Tag?: ElementType;
  /** Fraction of row width required to trigger an action. Default: `0.5`. */
  threshold?: number;
  /** Interaction style. Default: `Type.ANDROID`. */
  type?: Type;
}

export const SwipeableList: FunctionComponent<SwipeableListProps>;

export interface SwipeableListItemProps {
  /** Delay before an action and its animation run. Default: `0`. */
  actionDelay?: number;
  /** Blocks all swipe gestures. Default: `false`. */
  blockSwipe?: boolean;
  children?: ReactNode;
  className?: string;
  /** Delay before a destructive callback runs. Default: `1000`. */
  destructiveCallbackDelay?: number;
  /** Allows a full swipe to trigger an iOS-style action. Default: `false`. */
  fullSwipe?: boolean;
  leadingActions?: ReactNode;
  /** Visible label for the leading action reveal control. */
  leadingActionsRevealLabel?: string;
  listType?: Type;
  /** Maximum swipe distance as a fraction of row width. Default: `1`. */
  maxSwipe?: number;
  onClick?: () => void;
  onSwipeEnd?: (dragDirection: string) => void;
  onSwipeProgress?: (progress: number, dragDirection: string) => void;
  onSwipeStart?: (dragDirection: string) => void;
  /** Disables mouse swiping. Default: `false`. */
  optOutMouseEvents?: boolean;
  /** Vertical distance that establishes scrolling. Default: `10`. */
  scrollStartThreshold?: number;
  /** Horizontal distance that establishes swiping. Default: `10`. */
  swipeStartThreshold?: number;
  /** Fraction of row width required to trigger an action. Default: `0.5`. */
  threshold?: number;
  trailingActions?: ReactNode;
  /** Visible label for the trailing action reveal control. */
  trailingActionsRevealLabel?: string;
}

export class SwipeableListItem extends PureComponent<SwipeableListItemProps> {}
