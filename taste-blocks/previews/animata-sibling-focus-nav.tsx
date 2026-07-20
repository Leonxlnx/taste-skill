"use client";

import SiblingFocusNav from "@/registry/sources/animata/components/animata-sibling-focus-nav/sibling-focus-nav";

const links = ["Overview", "Principles", "Examples", "Notes"];

export default function AnimataSiblingFocusNavPreview() {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-2xl bg-[#f4efe6] p-8">
      <SiblingFocusNav aria-label="Preview navigation" className="justify-center">
        {links.map((label) => (
          <SiblingFocusNav.Link
            key={label}
            href={`#${label.toLowerCase()}`}
            className="text-lg font-medium text-stone-900"
            onClick={(event) => event.preventDefault()}
          >
            {label}
          </SiblingFocusNav.Link>
        ))}
      </SiblingFocusNav>
    </div>
  );
}
