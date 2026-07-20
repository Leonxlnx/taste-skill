'use client';
import {
  CheckboxButton,
  CheckboxField,
  type CheckboxFieldProps,
  type ValidationResult
} from 'react-aria-components/Checkbox';
import './Checkbox.css';
import {Description, FieldError} from './Form';
import type {ReactNode} from 'react';

interface CheckboxProps extends CheckboxFieldProps {
  children?: ReactNode;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function Checkbox({children, description, errorMessage, ...props}: CheckboxProps) {
  return (
    <CheckboxField {...props}>
      <CheckboxButton>
        {({isIndeterminate}) => (
          <>
            <div className="indicator">
              <svg
                viewBox="0 0 18 18"
                aria-hidden="true"
                key={isIndeterminate ? 'indeterminate' : 'check'}>
                {isIndeterminate ? (
                  <rect x={1} y={7.5} width={16} height={3} />
                ) : (
                  <polyline points="2 9 7 14 16 4" />
                )}
              </svg>
            </div>
            {children}
          </>
        )}
      </CheckboxButton>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </CheckboxField>
  );
}
