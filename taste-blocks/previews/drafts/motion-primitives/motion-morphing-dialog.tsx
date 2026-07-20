"use client";

import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogTitle,
  MorphingDialogTrigger,
} from "@/registry/sources/motion-primitives/components/motion-morphing-dialog/morphing-dialog";

export default function MotionMorphingDialogPreview() {
  return (
    <MorphingDialog transition={{ duration: 0.28, ease: "easeOut" }}>
      <MorphingDialogTrigger className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-left shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900">
        <span className="block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Project note
        </span>
        <span className="mt-2 block text-lg font-semibold text-zinc-950">
          Review interaction details
        </span>
      </MorphingDialogTrigger>
      <MorphingDialogContainer className="p-4">
        <MorphingDialogContent className="relative w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-7 shadow-2xl">
          <MorphingDialogTitle className="pr-20">
            <h2 className="text-2xl font-semibold text-zinc-950">
              Review interaction details
            </h2>
          </MorphingDialogTitle>
          <MorphingDialogDescription className="mt-3 text-sm leading-6 text-zinc-600">
            The shared-layout transition keeps the trigger and dialog visually
            connected while focus moves into the open layer.
          </MorphingDialogDescription>
          <MorphingDialogClose className="absolute right-5 top-5 rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 focus-visible:outline-2 focus-visible:outline-zinc-900">
            Close
          </MorphingDialogClose>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
