"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useControlled } from "@base-ui/utils/useControlled";
import { useStableCallback } from "@base-ui/utils/useStableCallback";
import * as React from "react";
import {
  Country,
  default as ReactPhoneInput,
  Value,
  getCountries,
  getCountryCallingCode,
} from "react-phone-number-input/input";

export interface PhoneInputBaseProps {
  value?: Value;
  defaultValue?: Value;
  onValueChange?: (value: Value) => void;
  country?: Country | null;
  defaultCountry?: Country;
  onCountryChange?: (country: Country | null) => void;
  children?: React.ReactNode;
  disabled?: boolean;
}

export interface PhoneInputWithoutInternationalProps extends PhoneInputBaseProps {
  international?: false;
  withCountryCallingCode?: never;
}

export interface PhoneInputWithInternationalProps extends PhoneInputBaseProps {
  /**
   * Forces international format when a country is explicitly selected.
   *
   * @warning This prop only takes effect when a country is explicitly selected.
   *
   * By default, the component uses national format when a country is selected and international format
   * when no country is selected.
   */
  international: true;
  /**
   * Controls the display of country calling code in international format.
   *
   * @warning This prop only affects the display when international format is active and a country is explicitly selected.
   *
   * By default, the country calling code is omitted when the country is known. Use this prop when you want to ensure
   * the country calling code is always visible and undeletable, even when the country is already selected.
   *
   * For example, setting this to true will always show "+1" for US numbers, even when US is selected.
   */
  withCountryCallingCode?: boolean;
}

export interface PhoneInputWithoutPreferredCountryProps extends PhoneInputBaseProps {
  preferredCountry?: never;
  defaultInternationalForPreferredCountry?: never;
}

export interface PhoneInputWithPreferredCountryProps extends PhoneInputBaseProps {
  /**
   * Suggests a default country while maintaining flexibility for international numbers.
   * This prop acts as a smart fallback when no country is selected.
   *
   * This is useful when you have a strong indication of the user's country (e.g., building a sign up form for a local business)
   * but want to maintain flexibility for international numbers. When specified, users can enter numbers
   * in national format for this country while still being able to enter international numbers for any country.
   *
   * @description Maps to the `defaultCountry={preferredCountry}` prop in `react-phone-number-input`.
   */
  preferredCountry: Country;
  /**
   * Controls the initial format of value matching the preferred country.
   *
   * By default, when the initial value matches the preferred country, it will be formatted in national format.
   * Use this prop to force international format even for numbers matching the preferred country.
   *
   * @description Maps to `useNationalFormatForDefaultCountryValue={!defaultInternationalForPreferredCountry}` prop in `react-phone-number-input`.
   */
  defaultInternationalForPreferredCountry?: boolean;
}

export type PhoneInputProps = (
  PhoneInputWithoutInternationalProps | PhoneInputWithInternationalProps
) &
  (
    PhoneInputWithoutPreferredCountryProps | PhoneInputWithPreferredCountryProps
  );

interface PhoneInputContextProps {
  value: Value;
  onValueChange: (value: Value) => void;
  country: Country | null;
  onCountryChange: (country: Country | null) => void;
  preferredCountry: Country | undefined;
  defaultInternationalForPreferredCountry: boolean;
  international: boolean;
  withCountryCallingCode: boolean;
  disabled?: boolean;
}

export const PhoneInputContext = React.createContext<PhoneInputContextProps>({
  value: "" as Value,
  onValueChange: () => {},
  country: null,
  onCountryChange: () => {},
  preferredCountry: undefined,
  defaultInternationalForPreferredCountry: false,
  international: false,
  withCountryCallingCode: false,
  disabled: false,
});

function usePhoneInput() {
  const context = React.useContext(PhoneInputContext);
  if (!context) {
    throw new Error("usePhoneInput must be used within a <PhoneInput />.");
  }

  return context;
}

function PhoneInput({
  value: valueProp,
  defaultValue,
  onValueChange,
  country: countryProp,
  defaultCountry,
  onCountryChange,
  preferredCountry,
  defaultInternationalForPreferredCountry = false,
  international = false,
  withCountryCallingCode = false,
  disabled = false,
  children,
}: PhoneInputProps) {
  const [value, setValueUnwrapped] = useControlled({
    controlled: valueProp,
    default: (defaultValue ?? "") as Value,
    name: "PhoneInput",
    state: "value",
  });
  const setValue = useStableCallback((nextValue: Value) => {
    setValueUnwrapped(nextValue);
    onValueChange?.(nextValue);
  });

  const [country, setCountryUnwrapped] = useControlled({
    controlled: countryProp,
    default: defaultCountry ?? null,
    name: "PhoneInput",
    state: "country",
  });
  const setCountry = useStableCallback((nextCountry: Country | null) => {
    setCountryUnwrapped(nextCountry);
    onCountryChange?.(nextCountry);
  });

  return (
    <PhoneInputContext.Provider
      data-slot="phone-input"
      value={{
        value,
        onValueChange: setValue,
        country,
        onCountryChange: setCountry,
        preferredCountry,
        defaultInternationalForPreferredCountry,
        international,
        withCountryCallingCode,
        disabled,
      }}
    >
      {children}
    </PhoneInputContext.Provider>
  );
}

interface PhoneInputInputProps extends Omit<
  React.ComponentProps<typeof ReactPhoneInput>,
  | "value"
  | "onChange"
  | "inputComponent"
  | "international"
  | "withCountryCallingCode"
  | "useNationalFormatForDefaultCountryValue"
> {
  render?: React.ReactElement<React.ComponentProps<"input">>;
  smartCaret?: boolean;
}

function getInputComponent(
  render: React.ReactElement<React.ComponentProps<"input">>,
) {
  return function InputComponent(props: React.ComponentProps<"input">) {
    return React.cloneElement(render, mergeProps(props, render.props));
  };
}

function PhoneInputInput({
  render,
  disabled: disabledProp,
  ...props
}: PhoneInputInputProps) {
  const {
    value,
    onValueChange,
    country,
    preferredCountry,
    defaultInternationalForPreferredCountry,
    international,
    withCountryCallingCode,
    disabled,
  } = usePhoneInput();

  const inputComponent = React.useMemo(
    () => (render ? getInputComponent(render) : undefined),
    [render],
  );

  // This is a workaround to prevent infinite rerenders. For more information, see:
  // https://github.com/catamphetamine/react-phone-number-input/issues/441.
  const handleChange = useStableCallback((nextValue: Value) => {
    setTimeout(() => onValueChange(nextValue ?? ("" as Value)));
  });

  return (
    <ReactPhoneInput
      data-slot="phone-input-input"
      inputComponent={inputComponent}
      country={country ?? undefined}
      {...(!country && { defaultCountry: preferredCountry })}
      useNationalFormatForDefaultCountryValue={
        !defaultInternationalForPreferredCountry
      }
      {...(country && { international })}
      {...(international && { withCountryCallingCode })}
      value={value}
      onChange={handleChange}
      disabled={disabled || disabledProp}
      {...props}
    />
  );
}

const INTERNATIONAL_COUNTRY_CODE = "international";

function PhoneInputCountrySelect({
  disabled: disabledProp,
  ...props
}: React.ComponentProps<"select">) {
  const { country, onCountryChange, disabled } = usePhoneInput();

  return (
    <select
      data-slot="phone-input-country-select"
      value={country ?? ""}
      disabled={disabled || disabledProp}
      onChange={(event) =>
        onCountryChange(
          event.target.value === INTERNATIONAL_COUNTRY_CODE
            ? null
            : (event.target.value as Country),
        )
      }
      {...props}
    />
  );
}

function PhoneInputCountrySelectOption(props: React.ComponentProps<"option">) {
  return <option data-slot="phone-input-country-select-option" {...props} />;
}

function PhoneInputCountryInternationalSelectOption({
  ...props
}: Omit<React.ComponentProps<"option">, "value">) {
  return (
    <PhoneInputCountrySelectOption
      value={INTERNATIONAL_COUNTRY_CODE}
      {...props}
    />
  );
}

function getCountryOptions() {
  return getCountries().map((countryCode) => ({
    countryCode,
    countryCallingCode: getCountryCallingCode(countryCode),
  }));
}

export {
  PhoneInput as Root,
  PhoneInputInput as Input,
  PhoneInputCountrySelect as CountrySelect,
  PhoneInputCountrySelectOption as CountrySelectOption,
  PhoneInputCountryInternationalSelectOption as CountryInternationalSelectOption,
  getCountryOptions,
  type Country,
  type Value,
  usePhoneInput,
  INTERNATIONAL_COUNTRY_CODE,
};
