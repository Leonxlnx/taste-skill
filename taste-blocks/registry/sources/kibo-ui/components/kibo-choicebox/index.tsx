"use client";

import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  useContext,
  useId,
} from "react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";

export type ChoiceboxProps = ComponentProps<typeof RadioGroup>;

export const Choicebox = ({ className, ...props }: ChoiceboxProps) => (
  <RadioGroup className={cn("w-full", className)} {...props} />
);

type ChoiceboxItemContextValue = {
  value: ChoiceboxItemProps["value"];
  id?: ChoiceboxItemProps["id"];
};

const ChoiceboxItemContext = createContext<ChoiceboxItemContextValue | null>(
  null
);

const useChoiceboxItemContext = () => {
  const context = useContext(ChoiceboxItemContext);

  if (!context) {
    throw new Error(
      "useChoiceboxItemContext must be used within a ChoiceboxItem"
    );
  }

  return context;
};

export type ChoiceboxItemProps = Pick<
  ComponentProps<typeof RadioGroupItem>,
  "children" | "className" | "id" | "value"
>;

export const ChoiceboxItem = ({
  className,
  children,
  value,
  id,
}: ChoiceboxItemProps) => {
  const generatedId = useId();
  const itemId = id ?? generatedId;

  return (
    <ChoiceboxItemContext.Provider value={{ value, id: itemId }}>
      <FieldLabel htmlFor={itemId}>
        <Field className={className} orientation="horizontal">
          {children}
        </Field>
      </FieldLabel>
    </ChoiceboxItemContext.Provider>
  );
};

export type ChoiceboxItemHeaderProps = ComponentProps<typeof FieldContent>;

export const ChoiceboxItemHeader = ({
  className,
  ...props
}: ChoiceboxItemHeaderProps) => (
  <FieldContent className={className} {...props} />
);

export type ChoiceboxItemTitleProps = ComponentProps<typeof FieldTitle>;

export const ChoiceboxItemTitle = ({
  className,
  ...props
}: ChoiceboxItemTitleProps) => <FieldTitle className={className} {...props} />;

export type ChoiceboxItemSubtitleProps = HTMLAttributes<HTMLSpanElement>;

export const ChoiceboxItemSubtitle = ({
  className,
  ...props
}: ChoiceboxItemSubtitleProps) => (
  <span
    className={cn("font-normal text-muted-foreground text-xs", className)}
    {...props}
  />
);

export type ChoiceboxItemDescriptionProps = ComponentProps<
  typeof FieldDescription
>;

export const ChoiceboxItemDescription = ({
  className,
  ...props
}: ChoiceboxItemDescriptionProps) => (
  <FieldDescription className={className} {...props} />
);

export type ChoiceboxIndicatorProps = Omit<
  ComponentProps<typeof RadioGroupItem>,
  "value"
>;

export const ChoiceboxIndicator = (props: ChoiceboxIndicatorProps) => {
  const context = useChoiceboxItemContext();

  return (
    <RadioGroupItem
      {...props}
      id={props.id ?? context.id}
      value={context.value}
    />
  );
};
