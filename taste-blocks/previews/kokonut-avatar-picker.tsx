"use client"

"use client"

import { useState } from "react"

import AvatarPicker from "@/registry/sources/kokonut-ui/components/kokonut-avatar-picker/avatar-picker"

export default function KokonutAvatarPickerPreview() {
  const [profile, setProfile] = useState<{ username: string; avatarId: number } | null>(null)

  return (
    <div className="flex min-h-[620px] w-full items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      {profile ? (
        <div className="rounded-xl border bg-background px-6 py-5 text-center shadow-sm">
          <p className="font-medium">Profile ready</p>
          <p className="mt-1 text-muted-foreground text-sm">
            {profile.username}, avatar {profile.avatarId}
          </p>
          <button
            className="mt-4 min-h-10 rounded-md border px-4 text-sm"
            onClick={() => setProfile(null)}
            type="button"
          >
            Start over
          </button>
        </div>
      ) : (
        <AvatarPicker onComplete={setProfile} />
      )}
    </div>
  )
}
