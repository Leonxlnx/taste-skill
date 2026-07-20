"use client";

import dynamic from "next/dynamic";

const Preview = dynamic(() => import("@/previews/trickle-shutter"), { ssr: false });

export default function PreviewPage() {
  return (
    <main className="grid min-h-[100dvh] place-items-center overflow-hidden bg-white p-6">
      <Preview />
    </main>
  );
}
