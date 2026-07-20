"use client"

import {
  AudioPlayer,
  AudioPlayerControlBar,
  AudioPlayerDurationDisplay,
  AudioPlayerElement,
  AudioPlayerMuteButton,
  AudioPlayerPlayButton,
  AudioPlayerSeekBackwardButton,
  AudioPlayerSeekForwardButton,
  AudioPlayerTimeDisplay,
  AudioPlayerTimeRange,
  AudioPlayerVolumeRange,
} from "@/registry/sources/vercel-ai-elements/components/vercel-ai-elements/audio-player";

const audio =
  "data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAj52nrKynnpGBcmRaVFNYYW59jZqlrK2poJOEdWdcVVNXX2x6ipikq62qopaHeGldVlNWXWl4h5aiqq2rpJiKemxfV1NVXGd1hJOgqa2spZqNfW5hWFNUWmRygZGep6ysp52PgHFjWVRUWWJvf46cpqytqJ+Sg3NmW1RTV2BtfIuZpKutqaGUhnZoXFVTVl5qeYiXo6qtqqOXiHlqXlZTVVxodoaUoamtq6SZi3xtYFdTVFtmc4OSn6itrKacjn9vYllUVFljcYCPnaesrKeekYFyZFpUU1hhbn2NmqWsramgk4R1Z1xVU1dfbHqKmKSrraqilod4aV1WU1ZdaXiHlqKqraukmIp6bF9XU1VcZ3WEk6Cpraylmo19bmFYU1RaZHKBkZ6nrKynnY+AcWNZVFRZYm9/jpymrK2on5KDc2ZbVFNXYG18i5mkq62poZSGdmhcVVNWXmp5iJejqq2qo5eIeWpeVlNVXGh2hpShqa2rpJmLfG1gV1NUW2Zzg5KfqK2sppyOf29iWVRUWWNx";

export default function AudioPlayerPreview() {
  return (
    <AudioPlayer className="w-full max-w-xl">
      <AudioPlayerElement src={audio} />
      <AudioPlayerControlBar>
        <AudioPlayerPlayButton />
        <AudioPlayerSeekBackwardButton seekOffset={5} />
        <AudioPlayerSeekForwardButton seekOffset={5} />
        <AudioPlayerTimeDisplay />
        <AudioPlayerTimeRange />
        <AudioPlayerDurationDisplay />
        <AudioPlayerMuteButton />
        <AudioPlayerVolumeRange />
      </AudioPlayerControlBar>
    </AudioPlayer>
  );
}
