import React, { type ReactElement, type ReactNode } from 'react';

import './LeadingActions.css';

interface ActionPlacementProps {
  leading?: boolean;
  main?: boolean;
}

export interface LeadingActionsProps {
  children: ReactNode;
}

const LeadingActions = ({ children }: LeadingActionsProps) => {
  if (children === null || children === undefined) {
    return null;
  }

  if (Array.isArray(children)) {
    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) {
        return child;
      }
      return React.cloneElement(child as ReactElement<ActionPlacementProps>, {
        leading: true,
        main: index === 0,
      });
    });
  }

  return React.cloneElement(children as ReactElement<ActionPlacementProps>, {
    leading: true,
    main: true,
  });
};

export default LeadingActions;
