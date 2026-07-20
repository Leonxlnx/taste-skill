"use client";

import { BanIcon, CheckCircle2Icon, UploadIcon } from "lucide-react";
import * as React from "react";

import { cn } from "./lib/utils";
import * as DropzonePrimitive from "./dropzone-primitive";

function Dropzone(props: React.ComponentProps<typeof DropzonePrimitive.Root>) {
  return <DropzonePrimitive.Root data-slot="dropzone" {...props} />;
}

function DropzoneInput(
  props: React.ComponentProps<typeof DropzonePrimitive.Input>,
) {
  return <DropzonePrimitive.Input data-slot="dropzone-input" {...props} />;
}

function DropzoneZone({
  className,
  ...props
}: React.ComponentProps<typeof DropzonePrimitive.Zone>) {
  return (
    <DropzonePrimitive.Zone
      data-slot="dropzone-zone"
      className={cn(
        "border-input hover:border-accent-foreground/50 hover:bg-accent focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[drag-active]:border-accent-foreground/50 data-[drag-reject]:border-destructive data-[drag-active]:bg-accent data-[drag-reject]:bg-destructive/30 cursor-pointer rounded-lg border-2 border-dashed p-6 shadow-xs transition-colors motion-reduce:transition-none outline-none focus-visible:ring-3 data-[disabled]:cursor-not-allowed data-[disabled]:border-inherit data-[disabled]:bg-inherit data-[disabled]:opacity-50 data-[drag-reject]:cursor-no-drop data-[no-click]:cursor-default",
        className,
      )}
      {...props}
    />
  );
}

function DropzoneUploadIcon(props: React.ComponentProps<typeof UploadIcon>) {
  return (
    <>
      <DropzonePrimitive.DragAccepted>
        <CheckCircle2Icon data-slot="dropzone-upload-icon" {...props} />
      </DropzonePrimitive.DragAccepted>
      <DropzonePrimitive.DragRejected>
        <BanIcon data-slot="dropzone-upload-icon" {...props} />
      </DropzonePrimitive.DragRejected>
      <DropzonePrimitive.DragDefault>
        <UploadIcon data-slot="dropzone-upload-icon" {...props} />
      </DropzonePrimitive.DragDefault>
    </>
  );
}

function DropzoneTrigger(
  props: React.ComponentProps<typeof DropzonePrimitive.Trigger>,
) {
  return <DropzonePrimitive.Trigger data-slot="dropzone-trigger" {...props} />;
}

function DropzoneAccepted(
  props: React.ComponentProps<typeof DropzonePrimitive.Accepted>,
) {
  return (
    <DropzonePrimitive.Accepted data-slot="dropzone-accepted" {...props} />
  );
}

function DropzoneRejected(
  props: React.ComponentProps<typeof DropzonePrimitive.Rejected>,
) {
  return (
    <DropzonePrimitive.Rejected data-slot="dropzone-rejected" {...props} />
  );
}

export {
  Dropzone,
  DropzoneInput,
  DropzoneZone,
  DropzoneUploadIcon,
  DropzoneTrigger,
  DropzoneAccepted,
  DropzoneRejected,
};
