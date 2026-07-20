import React, {
  type ElementType,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { Type as ListType } from './SwipeableList';
import { ItemContext } from './SwipeableListItem';

import './SwipeAction.css';

export interface SwipeActionProps {
  children: ReactNode;
  className?: string;
  destructive?: boolean;
  leading?: boolean;
  main?: boolean;
  onClick: () => void;
  Tag?: ElementType;
  trailing?: boolean;
}

const SwipeAction = ({
  children,
  className,
  destructive = false,
  main = false,
  leading,
  onClick,
  trailing,
  Tag = 'button',
}: SwipeActionProps) => {
  const context = React.useContext(ItemContext);
  const timeoutIds = React.useRef(new Set<number>());

  if (!context) {
    throw new Error('SwipeAction must be rendered inside SwipeableListItem.');
  }

  const {
    actionDelay,
    actionsRevealed,
    destructiveCallbackDelay,
    leadingFullSwipe,
    listType,
    onActionTriggered,
    setLeadingFullSwipeAction,
    setTrailingFullSwipeAction,
    trailingFullSwipe,
    scaleLeading,
    scaleTrailing,
  } = context;

  const scheduleTimeout = React.useCallback(
    (callback: () => void, delay: number) => {
      const timeoutId = window.setTimeout(() => {
        timeoutIds.current.delete(timeoutId);
        callback();
      }, delay);
      timeoutIds.current.add(timeoutId);
    },
    [],
  );

  React.useEffect(
    () => () => {
      timeoutIds.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutIds.current.clear();
    },
    [],
  );

  const onHandleClick = React.useCallback(() => {
    if (actionDelay) {
      scheduleTimeout(() => {
        onActionTriggered(destructive);
        onClick();
      }, actionDelay);
      return;
    }

    onActionTriggered(destructive);
    if (destructive) {
      scheduleTimeout(onClick, destructiveCallbackDelay);
    } else {
      onClick();
    }
  }, [
    actionDelay,
    destructive,
    destructiveCallbackDelay,
    onActionTriggered,
    onClick,
    scheduleTimeout,
  ]);

  React.useEffect(() => {
    if (leading && main) {
      setLeadingFullSwipeAction(onHandleClick);
      return () => setLeadingFullSwipeAction(null);
    }
  }, [leading, main, onHandleClick, setLeadingFullSwipeAction]);

  React.useEffect(() => {
    if (trailing && main) {
      setTrailingFullSwipeAction(onHandleClick);
      return () => setTrailingFullSwipeAction(null);
    }
  }, [trailing, main, onHandleClick, setTrailingFullSwipeAction]);

  const isNativeButton = Tag === 'button';
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!isNativeButton && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onHandleClick();
    }
  };
  const ActionTag: any = Tag;

  return (
    <ActionTag
      className={[
        'swipe-action',
        leading && 'swipe-action__leading',
        trailing && 'swipe-action__trailing',
        leading &&
          leadingFullSwipe &&
          !main &&
          listType === ListType.IOS &&
          'swipe-action__leading--full-swipe-rest',
        leading &&
          leadingFullSwipe &&
          main &&
          listType === ListType.IOS &&
          'swipe-action__leading--full-swipe-main',
        trailing &&
          trailingFullSwipe &&
          !main &&
          listType === ListType.IOS &&
          'swipe-action__trailing--full-swipe-rest',
        trailing &&
          trailingFullSwipe &&
          main &&
          listType === ListType.IOS &&
          'swipe-action__trailing--full-swipe-main',
        listType === ListType.MS &&
          !(scaleLeading || scaleTrailing) &&
          'swipe-action__grayed',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onHandleClick}
      onKeyDown={handleKeyDown}
      role={isNativeButton ? undefined : 'button'}
      tabIndex={actionsRevealed ? 0 : -1}
      type={isNativeButton ? 'button' : undefined}
    >
      {children}
    </ActionTag>
  );
};

export default SwipeAction;
