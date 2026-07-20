import React, {
  PureComponent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';

import { Type as ListType, type SwipeableListType } from './SwipeableList';
import './SwipeableListItem.css';

type ActionSide = 'leading' | 'trailing';
type FullSwipeAction = (() => void) | null;

interface ItemContextValue {
  actionDelay: number;
  actionsRevealed: boolean;
  destructiveCallbackDelay: number;
  leadingFullSwipe: boolean;
  listType: SwipeableListType;
  onActionTriggered: (destructive: boolean) => void;
  scaleLeading: boolean;
  scaleTrailing: boolean;
  setLeadingFullSwipeAction: (action: FullSwipeAction) => void;
  setTrailingFullSwipeAction: (action: FullSwipeAction) => void;
  trailingFullSwipe: boolean;
}

export const ItemContext = React.createContext<ItemContextValue | null>(null);

const ActionAnimation = {
  RETURN: Symbol('Return'),
  REMOVE: Symbol('Remove'),
  NONE: Symbol('None'),
} as const;

const DragDirection = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
  UNKNOWN: 'unknown',
} as const;

type DragDirectionValue = (typeof DragDirection)[keyof typeof DragDirection];

const FPS_INTERVAL = 1000 / 60;

const classNames = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(' ');

const measure = (element: HTMLElement, fn: (node: HTMLElement) => number) => {
  const previousWidth = element.style.width;
  const previousVisibility = element.style.visibility;

  element.style.width = 'auto';
  element.style.visibility = 'hidden';

  try {
    return fn(element);
  } finally {
    element.style.width = previousWidth;
    element.style.visibility = previousVisibility;
  }
};

interface SwipeableListItemState {
  leadingFullSwipe: boolean;
  revealedSide: ActionSide | null;
  scaleLeading: boolean;
  scaleTrailing: boolean;
  statusMessage: string;
  trailingFullSwipe: boolean;
  triggerAction: boolean;
}

const initialState: SwipeableListItemState = {
  leadingFullSwipe: false,
  trailingFullSwipe: false,
  triggerAction: false,
  scaleLeading: false,
  scaleTrailing: false,
  revealedSide: null,
  statusMessage: '',
};

export interface SwipeableListItemProps {
  actionDelay?: number;
  blockSwipe?: boolean;
  children?: ReactNode;
  className?: string;
  clickedCallback?: (itemId: string) => void;
  destructiveCallbackDelay?: number;
  fullSwipe?: boolean;
  id?: string;
  leadingActions?: ReactNode;
  leadingActionsRevealLabel?: string;
  listType?: SwipeableListType;
  maxSwipe?: number;
  onClick?: () => void;
  onSwipeEnd?: (dragDirection: string) => void;
  onSwipeProgress?: (progress: number, dragDirection: string) => void;
  onSwipeStart?: (dragDirection: string) => void;
  optOutMouseEvents?: boolean;
  resetState?: (reset: (options?: { to?: number }) => void) => void;
  scrollStartThreshold?: number;
  swipeStartThreshold?: number;
  threshold?: number;
  trailingActions?: ReactNode;
  trailingActionsRevealLabel?: string;
}

class SwipeableListItem extends PureComponent<
  SwipeableListItemProps,
  SwipeableListItemState
> {
  state = initialState;

  private listElement: HTMLDivElement | null = null;
  private leadingActionsElement: HTMLDivElement | null = null;
  private trailingActionsElement: HTMLDivElement | null = null;
  private wrapperElement: HTMLDivElement | null = null;
  private leadingRevealButton: HTMLButtonElement | null = null;
  private trailingRevealButton: HTMLButtonElement | null = null;

  private requestedAnimationFrame: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private animationCleanups = new Set<() => void>();
  private measureOnFrame = false;
  private updateOnFrame = false;

  private leadingActionsWidth = 0;
  private trailingActionsWidth = 0;
  private maxSwipeThreshold = 0;

  private startTime: number | null = null;
  private previousSwipeDistancePercent = 0;
  private leadingFullSwipeAction: FullSwipeAction = null;
  private trailingFullSwipeAction: FullSwipeAction = null;
  private id: string;

  private dragStartPoint = { x: -1, y: -1 };
  private dragDirection: DragDirectionValue = DragDirection.UNKNOWN;
  private dragActive = false;
  private left = 0;
  private leadingActionsOpened = false;
  private trailingActionsOpened = false;
  private openSideAtDragStart: ActionSide | null = null;

  constructor(props: SwipeableListItemProps) {
    super(props);
    this.id = props.id ?? '';
    this.resetDragState();
  }

  private setLeadingFullSwipeAction = (action: FullSwipeAction) => {
    this.leadingFullSwipeAction = action;
  };

  private setTrailingFullSwipeAction = (action: FullSwipeAction) => {
    this.trailingFullSwipeAction = action;
  };

  private resetDragState = () => {
    this.dragStartPoint = { x: -1, y: -1 };
    this.dragDirection = DragDirection.UNKNOWN;
    this.left = 0;
    this.previousSwipeDistancePercent = 0;
    this.leadingActionsOpened = false;
    this.trailingActionsOpened = false;
    this.openSideAtDragStart = null;
  };

  private get dragHorizontalDirectionThreshold() {
    return this.props.swipeStartThreshold || 10;
  }

  private get dragVerticalDirectionThreshold() {
    return this.props.scrollStartThreshold || 10;
  }

  private get listType() {
    return this.props.listType ?? ListType.ANDROID;
  }

  private get fullSwipe() {
    if (this.listType === ListType.IOS) {
      return this.props.fullSwipe ?? false;
    }

    return true;
  }

  private get isRtl() {
    return Boolean(
      this.wrapperElement &&
        window.getComputedStyle(this.wrapperElement).direction === 'rtl',
    );
  }

  private get prefersReducedMotion() {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }

  componentDidMount() {
    if (!this.listElement) {
      return;
    }

    if (!this.props.optOutMouseEvents) {
      this.listElement.addEventListener('mousedown', this.handleDragStartMouse);
    }

    this.listElement.addEventListener('touchstart', this.handleDragStartTouch, {
      passive: true,
    });
    this.listElement.addEventListener('touchend', this.handleDragEndTouch);
    this.listElement.addEventListener('touchcancel', this.handleDragCancel);
    this.listElement.addEventListener('touchmove', this.handleTouchMove, {
      capture: true,
      passive: false,
    });

    this.measureElements();
    this.observeResizeTargets();

    if (this.props.resetState) {
      this.props.resetState(this.playReturnAnimation);
    }
  }

  componentDidUpdate(previousProps: SwipeableListItemProps) {
    if (
      previousProps.leadingActions !== this.props.leadingActions ||
      previousProps.trailingActions !== this.props.trailingActions
    ) {
      this.observeResizeTargets();
      this.scheduleMeasure();
    } else if (previousProps.maxSwipe !== this.props.maxSwipe) {
      this.scheduleMeasure();
    }
  }

  componentWillUnmount() {
    this.cancelScheduledFrame();
    this.removeGlobalDragListeners();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.animationCleanups.forEach((cleanup) => cleanup());
    this.animationCleanups.clear();

    if (!this.listElement) {
      return;
    }

    if (!this.props.optOutMouseEvents) {
      this.listElement.removeEventListener('mousedown', this.handleDragStartMouse);
    }

    this.listElement.removeEventListener('touchstart', this.handleDragStartTouch);
    this.listElement.removeEventListener('touchend', this.handleDragEndTouch);
    this.listElement.removeEventListener('touchcancel', this.handleDragCancel);
    this.listElement.removeEventListener('touchmove', this.handleTouchMove, true);
  }

  private observeResizeTargets = () => {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver ??= new ResizeObserver(this.scheduleMeasure);
    this.resizeObserver.disconnect();

    if (this.wrapperElement) {
      this.resizeObserver.observe(this.wrapperElement);
    }
    if (this.leadingActionsElement?.firstElementChild) {
      this.resizeObserver.observe(this.leadingActionsElement.firstElementChild);
    }
    if (this.trailingActionsElement?.firstElementChild) {
      this.resizeObserver.observe(this.trailingActionsElement.firstElementChild);
    }
  };

  private measureElements = () => {
    if (!this.listElement) {
      return;
    }

    if (this.leadingActionsElement) {
      this.leadingActionsWidth = measure(
        this.leadingActionsElement,
        (element) => element.offsetWidth,
      );
    }

    if (this.trailingActionsElement) {
      this.trailingActionsWidth = measure(
        this.trailingActionsElement,
        (element) => element.offsetWidth,
      );
    }

    this.maxSwipeThreshold =
      (this.props.maxSwipe ?? 1) * this.listElement.offsetWidth;

    const openSide = this.leadingActionsOpened
      ? 'leading'
      : this.trailingActionsOpened
        ? 'trailing'
        : null;
    if (openSide) {
      this.applyOpenPosition(openSide);
    }
  };

  private requestFrame = () => {
    if (this.requestedAnimationFrame !== null) {
      return;
    }

    this.requestedAnimationFrame = window.requestAnimationFrame(() => {
      this.requestedAnimationFrame = null;

      if (this.measureOnFrame) {
        this.measureOnFrame = false;
        this.measureElements();
      }
      if (this.updateOnFrame) {
        this.updateOnFrame = false;
        this.updatePosition();
      }
    });
  };

  private scheduleMeasure = () => {
    this.measureOnFrame = true;
    this.requestFrame();
  };

  private scheduleUpdatePosition = () => {
    this.updateOnFrame = true;
    this.requestFrame();
  };

  private cancelScheduledFrame = () => {
    if (this.requestedAnimationFrame !== null) {
      window.cancelAnimationFrame(this.requestedAnimationFrame);
      this.requestedAnimationFrame = null;
    }
    this.measureOnFrame = false;
    this.updateOnFrame = false;
  };

  private addAnimationEndListener = (
    element: HTMLElement,
    callback: () => void,
  ) => {
    const cleanup = () => {
      element.removeEventListener('animationend', handleAnimationEnd);
      this.animationCleanups.delete(cleanup);
    };
    const handleAnimationEnd = () => {
      cleanup();
      callback();
    };

    this.animationCleanups.add(cleanup);
    element.addEventListener('animationend', handleAnimationEnd);
  };

  private sideForOffset = (offset: number): ActionSide | null => {
    if (offset === 0) {
      return null;
    }
    if (offset > 0) {
      return this.isRtl ? 'trailing' : 'leading';
    }
    return this.isRtl ? 'leading' : 'trailing';
  };

  private offsetForSide = (side: ActionSide) => {
    const width =
      side === 'leading' ? this.leadingActionsWidth : this.trailingActionsWidth;
    const positive = side === 'leading' ? !this.isRtl : this.isRtl;
    return width * (positive ? 1 : -1);
  };

  private elementForSide = (side: ActionSide) =>
    side === 'leading'
      ? this.leadingActionsElement
      : this.trailingActionsElement;

  private sideForHorizontalDirection = (
    direction: typeof DragDirection.LEFT | typeof DragDirection.RIGHT,
  ): ActionSide => {
    if (direction === DragDirection.RIGHT) {
      return this.isRtl ? 'trailing' : 'leading';
    }
    return this.isRtl ? 'leading' : 'trailing';
  };

  private applyOpenPosition = (side: ActionSide) => {
    if (!this.listElement) {
      return;
    }

    const offset = this.offsetForSide(side);
    this.left = offset;
    this.leadingActionsOpened = side === 'leading';
    this.trailingActionsOpened = side === 'trailing';

    this.listElement.className =
      'swipeable-list-item__content swipeable-list-item__content--return';
    this.listElement.style.transform = `translateX(${offset}px)`;

    if (this.leadingActionsElement) {
      this.leadingActionsElement.className = classNames(
        'swipeable-list-item__leading-actions',
        side === 'leading' && 'swipeable-list-item__leading-actions--return',
      );
      this.leadingActionsElement.style.width = `${
        side === 'leading' ? this.leadingActionsWidth : 0
      }px`;
    }
    if (this.trailingActionsElement) {
      this.trailingActionsElement.className = classNames(
        'swipeable-list-item__trailing-actions',
        side === 'trailing' && 'swipeable-list-item__trailing-actions--return',
      );
      this.trailingActionsElement.style.width = `${
        side === 'trailing' ? this.trailingActionsWidth : 0
      }px`;
    }
  };

  private focusFirstAction = (side: ActionSide) => {
    this.elementForSide(side)
      ?.querySelector<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      )
      ?.focus();
  };

  private focusRevealButton = (side: ActionSide) => {
    (side === 'leading'
      ? this.leadingRevealButton
      : this.trailingRevealButton
    )?.focus();
  };

  private revealActions = (side: ActionSide, moveFocus = true) => {
    if (!this.elementForSide(side)) {
      return;
    }

    this.props.clickedCallback?.(this.id);
    this.measureElements();
    this.applyOpenPosition(side);
    this.setState(
      {
        leadingFullSwipe: false,
        trailingFullSwipe: false,
        triggerAction: false,
        scaleLeading: false,
        scaleTrailing: false,
        revealedSide: side,
        statusMessage: '',
      },
      () => {
        if (moveFocus) {
          this.focusFirstAction(side);
        }
      },
    );
  };

  private closeActions = (returnFocus = false) => {
    const side =
      this.state.revealedSide ??
      (this.leadingActionsOpened
        ? 'leading'
        : this.trailingActionsOpened
          ? 'trailing'
          : this.sideForOffset(this.left));
    this.playReturnAnimation();
    this.setState({ revealedSide: null }, () => {
      if (returnFocus && side) {
        this.focusRevealButton(side);
      }
    });
  };

  private handleRevealKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    const side = this.sideForHorizontalDirection(
      event.key === 'ArrowRight' ? DragDirection.RIGHT : DragDirection.LEFT,
    );
    if (this.elementForSide(side)) {
      event.preventDefault();
      this.revealActions(side);
    }
  };

  private handleWrapperKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && this.state.revealedSide) {
      event.preventDefault();
      event.stopPropagation();
      this.closeActions(true);
    }
  };

  private addMouseDragListeners = () => {
    window.addEventListener('mouseup', this.handleDragEndMouse);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('blur', this.handleDragCancel);
    window.addEventListener('pointercancel', this.handleDragCancel);
  };

  private addTouchDragListeners = () => {
    window.addEventListener('touchend', this.handleDragEndTouch);
    window.addEventListener('touchcancel', this.handleDragCancel);
    window.addEventListener('blur', this.handleDragCancel);
    window.addEventListener('pointercancel', this.handleDragCancel);
  };

  private removeGlobalDragListeners = () => {
    window.removeEventListener('mouseup', this.handleDragEndMouse);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('touchend', this.handleDragEndTouch);
    window.removeEventListener('touchcancel', this.handleDragCancel);
    window.removeEventListener('blur', this.handleDragCancel);
    window.removeEventListener('pointercancel', this.handleDragCancel);
  };

  private handleDragStartMouse = (event: MouseEvent) => {
    this.addMouseDragListeners();
    this.handleDragStart(event);
  };

  private handleDragStartTouch = (event: TouchEvent) => {
    const touch = event.targetTouches[0];
    if (!touch) {
      return;
    }

    this.addTouchDragListeners();
    this.handleDragStart(touch);
  };

  private handleDragStart = ({ clientX, clientY }: MouseEvent | Touch) => {
    this.props.clickedCallback?.(this.id);

    const openSide = this.leadingActionsOpened
      ? 'leading'
      : this.trailingActionsOpened
        ? 'trailing'
        : null;

    if (!openSide) {
      this.resetDragState();
      this.setState({
        leadingFullSwipe: false,
        trailingFullSwipe: false,
        triggerAction: false,
        scaleLeading: false,
        scaleTrailing: false,
        revealedSide: null,
      });
    }

    this.openSideAtDragStart = openSide;
    const startOffset = openSide ? this.offsetForSide(openSide) : 0;
    this.left = startOffset;
    this.dragStartPoint = { x: clientX - startOffset, y: clientY };
    this.dragActive = true;

    if (this.listElement) {
      this.listElement.className = 'swipeable-list-item__content';
    }
    if (this.leadingActionsElement) {
      this.leadingActionsElement.className =
        'swipeable-list-item__leading-actions';
    }
    if (this.trailingActionsElement) {
      this.trailingActionsElement.className =
        'swipeable-list-item__trailing-actions';
    }

    this.startTime = Date.now();
    this.scheduleUpdatePosition();
  };

  private handleMouseMove = (event: MouseEvent) => {
    if (!this.dragActive || !this.dragStartedWithinItem()) {
      return;
    }

    const { clientX, clientY } = event;
    this.setDragDirection(clientX, clientY);

    if (this.isSwiping()) {
      event.stopPropagation();
      event.preventDefault();
      this.setLeftFromPointer(clientX);
    }
  };

  private handleTouchMove = (event: TouchEvent) => {
    if (!this.dragActive || !this.dragStartedWithinItem()) {
      return;
    }

    const touch = event.targetTouches[0];
    if (!touch) {
      return;
    }
    const { clientX, clientY } = touch;
    this.setDragDirection(clientX, clientY);

    if (!event.cancelable) {
      return;
    }

    if (this.isSwiping()) {
      event.stopPropagation();
      event.preventDefault();
      this.setLeftFromPointer(clientX);
    }
  };

  private setLeftFromPointer = (clientX: number) => {
    const nextLeft = clientX - this.dragStartPoint.x;
    this.left =
      nextLeft > 0
        ? Math.min(nextLeft, this.maxSwipeThreshold)
        : Math.max(nextLeft, -this.maxSwipeThreshold);
    this.scheduleUpdatePosition();
  };

  private handleDragEndMouse = () => {
    if (!this.dragActive) {
      return;
    }

    this.removeGlobalDragListeners();
    this.dragActive = false;
    this.handleDragEnd();
  };

  private handleDragEndTouch = () => {
    if (!this.dragActive) {
      return;
    }

    this.removeGlobalDragListeners();
    this.dragActive = false;
    this.handleDragEnd();
  };

  private handleDragCancel = () => {
    if (!this.dragActive) {
      return;
    }

    const openSide = this.openSideAtDragStart;
    this.dragActive = false;
    this.removeGlobalDragListeners();
    this.cancelScheduledFrame();
    this.setState(
      {
        leadingFullSwipe: false,
        trailingFullSwipe: false,
        triggerAction: false,
        scaleLeading: false,
        scaleTrailing: false,
        revealedSide: openSide,
      },
      () => {
        if (openSide) {
          this.applyOpenPosition(openSide);
        } else if (this.left !== 0) {
          this.playReturnAnimation();
        } else {
          this.resetDragState();
        }
      },
    );
  };

  private playReturnAnimationForLeadingActions = ({
    to,
    isIosType,
    playMsReturnAnimation,
  }: {
    to: number;
    isIosType: boolean;
    playMsReturnAnimation: boolean;
  }) => {
    if (!this.leadingActionsElement) {
      return;
    }

    this.leadingActionsElement.className = classNames(
      'swipeable-list-item__leading-actions',
      playMsReturnAnimation
        ? 'swipeable-list-item__actions--return-ms'
        : 'swipeable-list-item__leading-actions--return',
    );

    if (this.leadingActionsOpened && isIosType && to !== 0) {
      this.leadingActionsElement.className += ' test-actions-opened';
    }

    if (playMsReturnAnimation) {
      this.addAnimationEndListener(this.leadingActionsElement, () => {
        if (this.leadingActionsElement) {
          this.leadingActionsElement.style.width = '0px';
        }
      });
    } else {
      this.leadingActionsElement.style.width = `${
        to === 0 || !isIosType
          ? 0
          : this.leadingActionsOpened
            ? this.leadingActionsWidth
            : 0
      }px`;
    }
  };

  private playReturnAnimationForTrailingActions = ({
    to,
    isIosType,
    playMsReturnAnimation,
  }: {
    to: number;
    isIosType: boolean;
    playMsReturnAnimation: boolean;
  }) => {
    if (!this.trailingActionsElement) {
      return;
    }

    this.trailingActionsElement.className = classNames(
      'swipeable-list-item__trailing-actions',
      playMsReturnAnimation
        ? 'swipeable-list-item__actions--return-ms'
        : 'swipeable-list-item__trailing-actions--return',
    );

    if (this.trailingActionsOpened && isIosType && to !== 0) {
      this.trailingActionsElement.className += ' test-actions-opened';
    }

    if (playMsReturnAnimation) {
      this.addAnimationEndListener(this.trailingActionsElement, () => {
        if (this.trailingActionsElement) {
          this.trailingActionsElement.style.width = '0px';
        }
      });
    } else {
      this.trailingActionsElement.style.width = `${
        to === 0 || !isIosType
          ? 0
          : this.trailingActionsOpened
            ? this.trailingActionsWidth
            : 0
      }px`;
    }
  };

  private playReturnAnimation = ({ to = 0 }: { to?: number } = {}) => {
    if (this.left === 0 || !this.listElement) {
      return;
    }

    const side = this.sideForOffset(this.left);
    const isIosType = this.listType === ListType.IOS;
    const playMsReturnAnimation =
      this.state.triggerAction &&
      this.listType === ListType.MS &&
      !this.prefersReducedMotion;

    if (playMsReturnAnimation) {
      this.addAnimationEndListener(this.listElement, () => {
        if (this.listElement) {
          this.listElement.style.transform = 'translateX(0)';
        }
      });
    }

    this.listElement.className = classNames(
      'swipeable-list-item__content',
      playMsReturnAnimation && side
        ? `swipeable-list-item__content--return-${side}-ms`
        : 'swipeable-list-item__content--return',
    );

    if (!playMsReturnAnimation) {
      this.listElement.style.transform = `translateX(${isIosType ? to : 0}px)`;
    }

    if (side === 'trailing') {
      this.playReturnAnimationForTrailingActions({
        to,
        isIosType,
        playMsReturnAnimation,
      });
    } else if (side === 'leading') {
      this.playReturnAnimationForLeadingActions({
        to,
        isIosType,
        playMsReturnAnimation,
      });
    }

    if (to === 0) {
      this.resetDragState();
      this.setState({
        revealedSide: null,
        scaleLeading: false,
        scaleTrailing: false,
      });
    }
  };

  private playRemoveAnimation = () => {
    if (!this.listElement || !this.wrapperElement) {
      return;
    }

    this.wrapperElement.className =
      'swipeable-list-item swipeable-list-item--remove';
    this.listElement.className =
      'swipeable-list-item__content swipeable-list-item__content--remove';

    const activeSide = this.state.leadingFullSwipe
      ? 'leading'
      : this.state.trailingFullSwipe
        ? 'trailing'
        : this.sideForOffset(this.left);
    const leadingFullSwipe = activeSide === 'leading';
    const trailingFullSwipe = activeSide === 'trailing';
    const translateLength = activeSide
      ? this.listElement.offsetWidth *
        (this.offsetForSide(activeSide) >= 0 ? 1 : -1)
      : 0;

    this.listElement.style.transform = `translateX(${translateLength}px)`;
    this.setState({ leadingFullSwipe, trailingFullSwipe });

    const actionElement = activeSide ? this.elementForSide(activeSide) : null;
    if (actionElement) {
      actionElement.className += ` swipeable-list-item__${activeSide}-actions--return`;
      actionElement.style.width = `${Math.abs(translateLength)}px`;
    }
  };

  private playActionAnimation = ({
    type,
  }: {
    type: (typeof ActionAnimation)[keyof typeof ActionAnimation];
  }) => {
    if (!this.listElement) {
      return;
    }

    switch (type) {
      case ActionAnimation.REMOVE:
        this.playRemoveAnimation();
        break;
      case ActionAnimation.NONE:
        break;
      default:
        this.playReturnAnimation();
    }
  };

  private handleDragEnd = () => {
    this.cancelScheduledFrame();

    if (!this.isSwiping()) {
      return;
    }

    const { leadingFullSwipe, trailingFullSwipe, triggerAction } = this.state;
    this.props.onSwipeEnd?.(this.dragDirection);

    if (triggerAction) {
      if (leadingFullSwipe && this.leadingFullSwipeAction) {
        this.leadingFullSwipeAction();
        return;
      }

      if (trailingFullSwipe && this.trailingFullSwipeAction) {
        this.trailingFullSwipeAction();
        return;
      }
    }

    const openSide = this.leadingActionsOpened
      ? 'leading'
      : this.trailingActionsOpened
        ? 'trailing'
        : null;

    if (openSide) {
      this.left = this.offsetForSide(openSide);
      this.playReturnAnimation({ to: this.left });
      this.setState({ revealedSide: openSide });
    } else {
      this.playReturnAnimation();
      this.resetDragState();
    }
  };

  private dragStartedWithinItem = () => {
    const { x, y } = this.dragStartPoint;
    return x !== -1 && y !== -1;
  };

  private setDragDirection = (x: number, y: number) => {
    if (this.dragDirection !== DragDirection.UNKNOWN) {
      return;
    }

    const { x: startX, y: startY } = this.dragStartPoint;
    const horizontalDistance = Math.abs(x - startX);
    const verticalDistance = Math.abs(y - startY);

    if (
      horizontalDistance <= this.dragHorizontalDirectionThreshold &&
      verticalDistance <= this.dragVerticalDirectionThreshold
    ) {
      return;
    }

    const angle = Math.atan2(y - startY, x - startX);
    const octant = Math.round((8 * angle) / (2 * Math.PI) + 8) % 8;

    switch (octant) {
      case 0:
        if (
          this.elementForSide(
            this.sideForHorizontalDirection(DragDirection.RIGHT),
          ) &&
          horizontalDistance > this.dragHorizontalDirectionThreshold
        ) {
          this.dragDirection = DragDirection.RIGHT;
        }
        break;
      case 1:
      case 2:
      case 3:
        if (verticalDistance > this.dragVerticalDirectionThreshold) {
          this.dragDirection = DragDirection.DOWN;
        }
        break;
      case 4:
        if (
          this.elementForSide(
            this.sideForHorizontalDirection(DragDirection.LEFT),
          ) &&
          horizontalDistance > this.dragHorizontalDirectionThreshold
        ) {
          this.dragDirection = DragDirection.LEFT;
        }
        break;
      case 5:
      case 6:
      case 7:
        if (verticalDistance > this.dragVerticalDirectionThreshold) {
          this.dragDirection = DragDirection.UP;
        }
        break;
      default:
        this.dragDirection = DragDirection.UNKNOWN;
    }

    if (this.props.onSwipeStart && this.isSwiping()) {
      this.props.onSwipeStart(this.dragDirection);
    }
  };

  private isSwiping = () => {
    const horizontalDrag =
      this.dragDirection === DragDirection.LEFT ||
      this.dragDirection === DragDirection.RIGHT;

    return (
      !this.props.blockSwipe && this.dragStartedWithinItem() && horizontalDrag
    );
  };

  private updatePosition = () => {
    if (!this.isSwiping() || this.startTime === null) {
      return;
    }

    const elapsed = Date.now() - this.startTime;
    if (elapsed <= FPS_INTERVAL) {
      return;
    }

    let activeSide = this.sideForOffset(this.left);
    if (activeSide && !this.elementForSide(activeSide)) {
      this.left = 0;
      activeSide = null;
    }

    if (activeSide && this.listType === ListType.IOS) {
      const opened =
        Math.abs(this.left) >
        (activeSide === 'leading'
          ? this.leadingActionsWidth
          : this.trailingActionsWidth);
      this.leadingActionsOpened = activeSide === 'leading' && opened;
      this.trailingActionsOpened = activeSide === 'trailing' && opened;
    }

    if (this.leadingActionsElement) {
      this.leadingActionsElement.style.width = `${
        activeSide === 'leading' ? Math.abs(this.left) : 0
      }px`;
    }
    if (this.trailingActionsElement) {
      this.trailingActionsElement.style.width = `${
        activeSide === 'trailing' ? Math.abs(this.left) : 0
      }px`;
    }

    if (this.listElement) {
      if (this.fullSwipe) {
        const threshold =
          this.listElement.offsetWidth * (this.props.threshold ?? 0.5);
        const triggerAction = Boolean(activeSide && Math.abs(this.left) > threshold);

        this.setState({
          leadingFullSwipe: triggerAction && activeSide === 'leading',
          trailingFullSwipe: triggerAction && activeSide === 'trailing',
          triggerAction,
          scaleLeading: triggerAction && activeSide === 'leading',
          scaleTrailing: triggerAction && activeSide === 'trailing',
        });
      }

      this.listElement.style.transform = `translateX(${this.left}px)`;

      if (this.props.onSwipeProgress) {
        const listElementWidth = this.listElement.offsetWidth;
        let swipeDistancePercent = this.previousSwipeDistancePercent;

        if (listElementWidth !== 0) {
          const swipeDistance = Math.max(
            0,
            listElementWidth - Math.abs(this.left),
          );
          swipeDistancePercent =
            100 - Math.round((100 * swipeDistance) / listElementWidth);
        }

        if (this.previousSwipeDistancePercent !== swipeDistancePercent) {
          this.props.onSwipeProgress(
            swipeDistancePercent,
            this.dragDirection,
          );
          this.previousSwipeDistancePercent = swipeDistancePercent;
        }
      }
    }

    this.startTime = Date.now();
  };

  private onActionTriggered = (isDestructive: boolean) => {
    const focusSide =
      this.state.revealedSide ??
      (this.state.leadingFullSwipe
        ? 'leading'
        : this.state.trailingFullSwipe
          ? 'trailing'
          : this.sideForOffset(this.left));

    this.playActionAnimation({
      type: isDestructive ? ActionAnimation.REMOVE : ActionAnimation.RETURN,
    });
    this.setState(
      {
        revealedSide: null,
        statusMessage: isDestructive ? 'Item action completed.' : '',
      },
      () => {
        if (focusSide) {
          this.focusRevealButton(focusSide);
        }
      },
    );
  };

  private bindListElement = (element: HTMLDivElement | null) => {
    this.listElement = element;
  };

  private bindWrapperElement = (element: HTMLDivElement | null) => {
    this.wrapperElement = element;
  };

  private bindLeadingActionsElement = (element: HTMLDivElement | null) => {
    this.leadingActionsElement = element;
  };

  private bindTrailingActionsElement = (element: HTMLDivElement | null) => {
    this.trailingActionsElement = element;
  };

  private renderActions = (
    actions: ReactNode,
    type: ActionSide,
    binder: (element: HTMLDivElement | null) => void,
  ) => {
    const {
      actionDelay = 0,
      destructiveCallbackDelay = 1000,
    } = this.props;
    const {
      leadingFullSwipe,
      trailingFullSwipe,
      scaleLeading,
      scaleTrailing,
      revealedSide,
    } = this.state;
    const scaled =
      this.listType === ListType.MS &&
      ((scaleLeading && type === 'leading') ||
        (scaleTrailing && type === 'trailing'));
    const actionsRevealed = revealedSide === type;

    return (
      <div
        aria-hidden={!actionsRevealed}
        className={classNames(
          `swipeable-list-item__${type}-actions`,
          scaled && `swipeable-list-item__${type}-actions--scaled`,
        )}
        data-testid={`${type}-actions`}
        inert={!actionsRevealed}
        ref={binder}
      >
        <ItemContext.Provider
          value={{
            actionDelay,
            actionsRevealed,
            destructiveCallbackDelay,
            listType: this.listType,
            leadingFullSwipe,
            onActionTriggered: this.onActionTriggered,
            scaleLeading,
            scaleTrailing,
            setLeadingFullSwipeAction: this.setLeadingFullSwipeAction,
            setTrailingFullSwipeAction: this.setTrailingFullSwipeAction,
            trailingFullSwipe,
          }}
        >
          {actions}
        </ItemContext.Provider>
      </div>
    );
  };

  private handleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!this.props.onClick) {
      return;
    }

    if (
      this.leadingActionsOpened ||
      this.trailingActionsOpened ||
      this.isSwiping()
    ) {
      event.preventDefault();
      return;
    }

    const delta = Math.abs(event.clientX - this.dragStartPoint.x);
    if (delta > 10) {
      event.preventDefault();
      return;
    }

    this.props.onClick();
  };

  render() {
    const {
      children,
      className,
      leadingActions,
      leadingActionsRevealLabel = 'Show leading actions',
      trailingActions,
      trailingActionsRevealLabel = 'Show trailing actions',
    } = this.props;
    const { revealedSide, statusMessage } = this.state;

    return (
      <div
        className={classNames('swipeable-list-item', className)}
        id={this.id || undefined}
        onClick={this.handleClick}
        onKeyDown={this.handleWrapperKeyDown}
        ref={this.bindWrapperElement}
      >
        {leadingActions &&
          this.renderActions(
            leadingActions,
            'leading',
            this.bindLeadingActionsElement,
          )}
        <div
          className="swipeable-list-item__content"
          data-testid="content"
          ref={this.bindListElement}
        >
          {children}
          <div className="swipeable-list-item__controls">
            {leadingActions && (
              <button
                aria-expanded={revealedSide === 'leading'}
                className="swipeable-list-item__reveal-button"
                onClick={() => this.revealActions('leading')}
                onKeyDown={this.handleRevealKeyDown}
                ref={(element) => {
                  this.leadingRevealButton = element;
                }}
                type="button"
              >
                {leadingActionsRevealLabel}
              </button>
            )}
            {trailingActions && (
              <button
                aria-expanded={revealedSide === 'trailing'}
                className="swipeable-list-item__reveal-button"
                onClick={() => this.revealActions('trailing')}
                onKeyDown={this.handleRevealKeyDown}
                ref={(element) => {
                  this.trailingRevealButton = element;
                }}
                type="button"
              >
                {trailingActionsRevealLabel}
              </button>
            )}
          </div>
        </div>
        {trailingActions &&
          this.renderActions(
            trailingActions,
            'trailing',
            this.bindTrailingActionsElement,
          )}
        <div
          aria-live="polite"
          className="swipeable-list-item__status"
          role="status"
        >
          {statusMessage}
        </div>
      </div>
    );
  }
}

export default SwipeableListItem;
