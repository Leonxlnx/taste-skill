import * as React from "react";

function svgIcon(name: string, children: React.ReactNode) {
  const icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
  icon.displayName = name;
  return icon;
}

export function createIcon(name: string, glyph: React.ReactNode) {
  return svgIcon(
    name,
    <g fill="currentColor">
      <path d="M0 0h24v24H0z" fill="none" />
      {glyph}
    </g>,
  );
}

export function createIconDisabled(name: string, glyph: React.ReactNode) {
  return svgIcon(
    name,
    <>
      <defs>
        <mask id="strike">
          <path d="M0 0h24v24H0z" fill="white" />
          <path d="M0 0L24 24" stroke="black" strokeWidth={4} />
        </mask>
      </defs>
      <path d="M0.70707 2.121320L21.878680 23.292883" stroke="currentColor" strokeWidth={2} />
      <g fill="currentColor" mask="url(#strike)">
        <path d="M0 0h24v24H0z" fill="none" />
        {glyph}
      </g>
    </>,
  );
}

export const CloseIcon = createIcon(
  "Close",
  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />,
);

export const PreviousIcon = createIcon("Previous", <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />);

export const NextIcon = createIcon("Next", <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />);

export const LoadingIcon = createIcon(
  "Loading",
  <>
    {Array.from({ length: 8 }).map((_, index, array) => (
      <line
        key={index}
        x1="12"
        y1="6.5"
        x2="12"
        y2="1.8"
        strokeLinecap="round"
        strokeWidth="2.6"
        stroke="currentColor"
        strokeOpacity={(1 / array.length) * (index + 1)}
        transform={`rotate(${(360 / array.length) * index}, 12, 12)`}
      />
    ))}
  </>,
);

export const ErrorIcon = createIcon(
  "Error",
  <path d="M21.9,21.9l-8.49-8.49l0,0L3.59,3.59l0,0L2.1,2.1L0.69,3.51L3,5.83V19c0,1.1,0.9,2,2,2h13.17l2.31,2.31L21.9,21.9z M5,18 l3.5-4.5l2.5,3.01L12.17,15l3,3H5z M21,18.17L5.83,3H19c1.1,0,2,0.9,2,2V18.17z" />,
);
