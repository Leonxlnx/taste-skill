"use client"

import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "@/registry/sources/shadcn-ui/components/radix-nova/message"

export default function Preview() { return <MessageGroup className="w-full max-w-80 gap-4"><Message><MessageAvatar>AM</MessageAvatar><MessageContent><MessageHeader>Alex · 10:42</MessageHeader><div className="rounded-xl bg-muted p-3">The revised brief is ready.</div><MessageFooter>Delivered</MessageFooter></MessageContent></Message></MessageGroup> }
