import type React from "react";
import { forwardRef } from "react";

import { clsx, cssClass, cssVar, round } from "../utils";
import type { LayoutVariables, RenderFunction } from "../types";

type BaseProps<TComponent extends React.ElementType> = Pick<
  React.ComponentProps<TComponent>,
  "children" | "style" | "className"
>;

type PolymorphicRef<Component extends React.ElementType> = React.ComponentPropsWithRef<Component>["ref"];

type ElementProps<
  TComponent extends React.ElementType,
  TContext extends object | void,
  TRenderProps extends BaseProps<TComponent>,
> = Partial<TRenderProps> &
  Omit<React.ComponentProps<TComponent>, keyof TRenderProps> & {
    as?: TComponent;
    render?: RenderFunction<TRenderProps, TContext>;
    context?: TContext;
    classes?: string | (string | undefined)[];
    variables?: LayoutVariables;
  };

function Component<
  TComponent extends React.ElementType,
  TContext extends object | void,
  TRenderProps extends BaseProps<TComponent>,
>(
  {
    as,
    render,
    context,
    classes = [],
    variables = {},
    style: styleProp,
    className: classNameProp,
    children,
    ...rest
  }: ElementProps<TComponent, TContext, TRenderProps>,
  ref: PolymorphicRef<TComponent>,
) {
  const className = clsx(
    ...(Array.isArray(classes) ? classes : [classes]).filter((el) => typeof el === "string").map(cssClass),
    classNameProp,
  );

  const style = {
    ...Object.fromEntries(
      Object.entries(variables).map(([key, value]) => [
        cssVar(key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()),
        typeof value === "number" ? round(value, 5) : value,
      ]),
    ),
    ...styleProp,
  };

  const props = { style, className, children, ...rest };

  if (render) {
    // eslint-disable-next-line react-hooks/refs -- false-positive lint
    const rendered = render({ ref, ...props } as unknown as TRenderProps, context as TContext);
    if (rendered) return rendered;
  }

  const Element = as || "div";
  return <Element ref={ref} {...props} />;
}

export default forwardRef(Component) as <
  TComponent extends React.ElementType,
  TContext extends object | void,
  TRenderProps extends BaseProps<TComponent>,
>(
  props: ElementProps<TComponent, TContext, TRenderProps> & { ref?: PolymorphicRef<TComponent> },
) => React.ReactNode;
