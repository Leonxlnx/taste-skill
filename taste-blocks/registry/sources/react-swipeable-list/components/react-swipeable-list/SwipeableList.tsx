import React, {
  PureComponent,
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react';

import './SwipeableList.css';

export const Type = {
  ANDROID: Symbol('ANDROID'),
  IOS: Symbol('IOS'),
  MS: Symbol('MS'),
} as const;

export type SwipeableListType = (typeof Type)[keyof typeof Type];

type ResetItem = (options?: { to?: number }) => void;

interface SwipeableListChildProps {
  actionDelay?: number;
  clickedCallback?: (itemId: string) => void;
  destructiveCallbackDelay?: number;
  fullSwipe?: boolean;
  id?: string;
  listType?: SwipeableListType;
  optOutMouseEvents?: boolean;
  resetState?: (reset: ResetItem) => void;
  scrollStartThreshold?: number;
  swipeStartThreshold?: number;
  threshold?: number;
}

export interface SwipeableListProps {
  actionDelay?: number;
  children: ReactNode;
  className?: string;
  destructiveCallbackDelay?: number;
  fullSwipe?: boolean;
  optOutMouseEvents?: boolean;
  scrollStartThreshold?: number;
  style?: CSSProperties;
  swipeStartThreshold?: number;
  Tag?: ElementType;
  threshold?: number;
  type?: SwipeableListType;
}

class SwipeableList extends PureComponent<SwipeableListProps> {
  private itemsMap: Record<string, ResetItem> = {};

  private clickedItem = (itemId: string) => {
    Object.keys(this.itemsMap).forEach((listItem) => {
      if (listItem !== itemId) {
        this.itemsMap[listItem]();
      }
    });
  };

  render() {
    const {
      actionDelay = 0,
      children,
      className = '',
      fullSwipe = false,
      destructiveCallbackDelay = 1000,
      optOutMouseEvents = false,
      style,
      type = Type.ANDROID,
      Tag = 'div',
      scrollStartThreshold,
      swipeStartThreshold,
      threshold = 0.5,
    } = this.props;
    const ListTag: any = Tag;

    return (
      <ListTag
        className={['swipeable-list', className].filter(Boolean).join(' ')}
        style={style}
      >
        {React.Children.map(children, (child, index) =>
          React.cloneElement(child as ReactElement<SwipeableListChildProps>, {
            actionDelay,
            destructiveCallbackDelay,
            fullSwipe,
            listType: type,
            optOutMouseEvents,
            scrollStartThreshold,
            swipeStartThreshold,
            threshold,
            clickedCallback: this.clickedItem,
            id: `listItem-${index}`,
            resetState: (reset: ResetItem) => {
              this.itemsMap[`listItem-${index}`] = reset;
            },
          }),
        )}
      </ListTag>
    );
  }
}

export default SwipeableList;
