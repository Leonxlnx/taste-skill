import type {
  CommonPhotoAlbumProps,
  ComponentsProps,
  Photo,
  Render,
  ResolvedNumber,
  ResponsiveParameter,
} from "../types";

type CommonProps<TPhoto extends Photo> = Pick<
  CommonPhotoAlbumProps<TPhoto>,
  "spacing" | "padding" | "componentsProps" | "render"
>;

type ResolvedCommonProps<TPhoto extends Photo, TWidth extends number | undefined = number | undefined> = {
  spacing: ResolvedNumber<TWidth>;
  padding: ResolvedNumber<TWidth>;
  componentsProps: ComponentsProps<TPhoto>;
  render: Render<TPhoto> | undefined;
};

const breakpoints = Object.freeze([1200, 600, 300, 0]);

export function unwrap<Value, Arg>(value: Value | ((arg: Arg) => Value), arg: Arg) {
  return typeof value === "function" ? (value as (arg: Arg) => Value)(arg) : value;
}

export function unwrapParameter<Value>(
  value: ResponsiveParameter<Value> | undefined,
  containerWidth: number | undefined,
): Value | undefined {
  return containerWidth !== undefined ? unwrap(value, containerWidth) : undefined;
}

function selectResponsiveValue(values: readonly ResponsiveParameter[], containerWidth: number) {
  const index = breakpoints.findIndex((breakpoint) => breakpoint <= containerWidth);
  return unwrap(values[Math.max(index, 0)], containerWidth);
}

export function resolveResponsiveParameter(
  parameter: ResponsiveParameter | undefined,
  containerWidth: number,
  values: readonly ResponsiveParameter[],
  minValue?: number,
): number;

export function resolveResponsiveParameter(
  parameter: ResponsiveParameter | undefined,
  containerWidth: number | undefined,
  values: readonly ResponsiveParameter[],
  minValue?: number,
): number | undefined;

export function resolveResponsiveParameter(
  parameter: ResponsiveParameter | undefined,
  containerWidth: number | undefined,
  values: readonly ResponsiveParameter[],
  minValue = 0,
) {
  if (containerWidth === undefined) return undefined;
  const value = unwrapParameter(parameter, containerWidth);
  return Math.round(Math.max(value === undefined ? selectResponsiveValue(values, containerWidth) : value, minValue));
}

export function resolveCommonProps<TPhoto extends Photo>(
  containerWidth: number,
  props: CommonProps<TPhoto>,
): ResolvedCommonProps<TPhoto, number>;

export function resolveCommonProps<TPhoto extends Photo>(
  containerWidth: number | undefined,
  props: CommonProps<TPhoto>,
): ResolvedCommonProps<TPhoto>;

export function resolveCommonProps<TPhoto extends Photo>(
  containerWidth: number | undefined,
  { spacing, padding, componentsProps, render }: CommonProps<TPhoto>,
) {
  return {
    spacing: resolveResponsiveParameter(spacing, containerWidth, [20, 15, 10, 5]),
    padding: resolveResponsiveParameter(padding, containerWidth, [0, 0, 0, 0]),
    componentsProps: unwrap(componentsProps, containerWidth) || {},
    render: unwrap(render, containerWidth),
  };
}
