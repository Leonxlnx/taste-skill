"use client";

import { DitheredLogo } from "@/registry/sources/componentry/components/componentry/dithered-logo";

const image = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
    <rect width="240" height="240" rx="48" fill="white"/>
    <path d="M48 164 96 76l30 54 22-38 44 72H48Z" fill="black"/>
  </svg>
`)}`;

export default function ComponentryDitheredImagePreview() {
  return (
    <div className="grid h-[380px] w-full max-w-2xl place-items-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
      <DitheredLogo className="h-72 w-72" imageSrc={image} label="Dithered geometric mark" />
    </div>
  );
}
