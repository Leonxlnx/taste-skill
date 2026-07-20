"use client"

"use client"

import { MessageScroller, MessageScrollerButton, MessageScrollerContent, MessageScrollerItem, MessageScrollerProvider, MessageScrollerViewport } from "@/registry/sources/shadcn-ui/components/radix-nova/message-scroller"

export default function Preview() { return <MessageScrollerProvider><MessageScroller className="h-64 w-full max-w-80 rounded-xl border"><MessageScrollerViewport><MessageScrollerContent className="p-4">{Array.from({ length: 8 }, (_, index) => <MessageScrollerItem key={index} scrollAnchor={index === 7} className="rounded-lg bg-muted p-3">Message {index + 1}</MessageScrollerItem>)}</MessageScrollerContent></MessageScrollerViewport><MessageScrollerButton /></MessageScroller></MessageScrollerProvider> }
