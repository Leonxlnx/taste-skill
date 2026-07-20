"use client"

"use client"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/registry/sources/shadcn-ui/components/radix-nova/resizable"

export default function Preview() { return <ResizablePanelGroup orientation="horizontal" className="h-64 w-full rounded-xl border"><ResizablePanel defaultSize={35}><div className="grid h-full place-items-center">Files</div></ResizablePanel><ResizableHandle withHandle /><ResizablePanel defaultSize={65}><div className="grid h-full place-items-center">Preview</div></ResizablePanel></ResizablePanelGroup> }
