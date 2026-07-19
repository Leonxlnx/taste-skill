import type { ReactNode } from "react";
import "./contour-relief.css";

interface ContourReliefProps {
  children: ReactNode;
  className?: string;
}

const contourPaths = [
  "M-40 314C62 268 89 180 168 154c92-30 151 46 250 9 77-28 95-110 184-137 76-23 149 11 238 62",
  "M-31 338C73 294 111 205 183 183c89-28 146 45 243 11 83-29 109-105 193-130 74-22 141 7 224 54",
  "M-16 365C87 324 131 233 202 211c83-25 139 44 234 13 87-29 122-100 200-123 70-20 132 4 207 43",
  "M14 390c91-39 139-123 208-147 80-27 133 40 224 15 91-26 134-93 207-114 64-18 120 1 187 34",
  "M62 414c72-39 120-110 184-137 75-32 128 34 213 14 91-21 143-83 211-103 57-17 107-2 165 25",
  "M126 432c53-40 94-94 153-122 69-34 121 25 199 11 88-16 148-72 211-91 49-14 91-4 139 17",
  "M205 445c40-36 77-75 127-99 62-30 112 16 182 8 83-10 150-59 208-77 40-13 77-8 117 8",
  "M310 453c31-27 61-52 100-69 54-24 98 8 160 6 74-3 145-43 197-60 31-10 58-8 88 1",
  "M-18 117C81 73 171 108 249 74 322 42 353-8 435-16c92-9 151 52 247 37 58-9 100-41 171-36",
  "M-30 87C72 43 162 78 237 45c69-30 105-75 184-85 93-11 157 48 251 34 61-9 108-40 181-35",
  "M-43 57C55 14 144 47 219 16c66-27 104-67 179-79 91-15 161 40 251 29 65-8 114-37 190-34",
  "M-54 27C37-12 125 16 201-12c63-23 102-60 174-73 88-16 163 32 249 24 69-6 120-33 198-30"
];

export function ContourRelief({ children, className = "" }: ContourReliefProps) {
  return (
    <div className={`tb-contour-relief ${className}`.trim()}>
      <svg
        className="tb-contour-relief__lines"
        viewBox="0 0 800 450"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        {contourPaths.map((path) => (
          <path key={path} d={path} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="tb-contour-relief__content">{children}</div>
    </div>
  );
}
