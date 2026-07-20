"use client"

import {
  MicSelector,
  MicSelectorContent,
  MicSelectorEmpty,
  MicSelectorInput,
  MicSelectorItem,
  MicSelectorLabel,
  MicSelectorList,
  MicSelectorTrigger,
  MicSelectorValue,
} from "@/registry/sources/vercel-ai-elements/components/vercel-ai-elements/mic-selector";

export default function MicSelectorPreview() {
  return (
    <MicSelector>
      <MicSelectorTrigger className="w-full max-w-sm">
        <MicSelectorValue />
      </MicSelectorTrigger>
      <MicSelectorContent>
        <MicSelectorInput placeholder="Search microphones" />
        <MicSelectorEmpty>No microphone available.</MicSelectorEmpty>
        <MicSelectorList>
          {(devices) =>
            devices.map((device) => (
              <MicSelectorItem key={device.deviceId} value={device.deviceId}>
                <MicSelectorLabel device={device} />
              </MicSelectorItem>
            ))
          }
        </MicSelectorList>
      </MicSelectorContent>
    </MicSelector>
  );
}
