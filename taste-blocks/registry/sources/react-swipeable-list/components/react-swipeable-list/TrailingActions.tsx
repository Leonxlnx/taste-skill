import React, { type ReactElement, type ReactNode } from 'react';

import './TrailingActions.css';

interface ActionPlacementProps {
  main?: boolean;
  trailing?: boolean;
}

export interface TrailingActionsProps {
  children: ReactNode;
}

const TrailingActions = ({ children }: TrailingActionsProps) => {
  if (children === null || children === undefined) {
    return null;
  }

  if (Array.isArray(children)) {
    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) {
        return child;
      }
      return React.cloneElement(child as ReactElement<ActionPlacementProps>, {
        main: index === children.length - 1,
        trailing: true,
      });
    });
  }

  return React.cloneElement(children as ReactElement<ActionPlacementProps>, {
    main: true,
    trailing: true,
  });
};

export default TrailingActions;
