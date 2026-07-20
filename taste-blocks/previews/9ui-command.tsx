"use client"

"use client"

import { useState } from "react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/registry/sources/9ui/components/9ui-command/command"

export default function NineUiCommandPreview() {
  const [selection, setSelection] = useState("لم يتم اختيار أمر")

  return (
    <section className="grid w-full max-w-md gap-3" dir="rtl" lang="ar">
      <Command
        label="أوامر المشروع"
        className="min-h-72 border-neutral-200 bg-white text-neutral-950 shadow-sm"
      >
        <CommandInput aria-label="البحث في الأوامر" placeholder="ابحث عن أمر…" />
        <CommandList label="أوامر المشروع المتاحة">
          <CommandEmpty>لا توجد نتائج.</CommandEmpty>
          <CommandGroup heading="مساحة العمل">
            <CommandItem value="settings" onSelect={() => setSelection("فتح الإعدادات")}>
              فتح الإعدادات
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
            <CommandItem value="invite" onSelect={() => setSelection("دعوة عضو")}>
              دعوة عضو
              <CommandShortcut>⌘I</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="المشروع">
            <CommandItem value="new project" onSelect={() => setSelection("إنشاء مشروع")}>
              إنشاء مشروع
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
      <p aria-live="polite" className="text-sm text-neutral-600">
        {selection}
      </p>
    </section>
  )
}
