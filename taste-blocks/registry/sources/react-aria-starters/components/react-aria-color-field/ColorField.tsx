'use client';
import {
  ColorField as AriaColorField,
  type ColorFieldProps as AriaColorFieldProps,
  Input,
  type ValidationResult
} from 'react-aria-components/ColorField';
import {Label, FieldError, Description} from './Form';
import './ColorField.css';

export interface ColorFieldProps extends AriaColorFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
}

export function ColorField({
  label,
  description,
  errorMessage,
  placeholder,
  ...props
}: ColorFieldProps) {
  return (
    <AriaColorField {...props}>
      {label && <Label>{label}</Label>}
      <Input className="react-aria-Input inset" placeholder={placeholder} />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaColorField>
  );
}
