"use client";

import {
  TabDes,
  TabHeader,
  TabImage,
  TabImageContainer,
  TabItem,
  TabList,
  TabsProvider,
} from "@/registry/sources/ui-layouts/components/uilayouts-image-tabs/image-tabs";

const tabs = [
  { id: "compose", title: "Compose", description: "Shape the initial structure.", color: "from-cyan-400 to-blue-700" },
  { id: "refine", title: "Refine", description: "Tune hierarchy and rhythm.", color: "from-fuchsia-400 to-violet-800" },
  { id: "ship", title: "Ship", description: "Deliver the finished experience.", color: "from-amber-300 to-orange-700" },
];

export default function ImageTabsPreview() {
  return (
    <TabsProvider className="grid min-h-80 gap-4 rounded-2xl bg-zinc-950 p-5 text-white md:grid-cols-[minmax(0,2fr)_minmax(14rem,1fr)]" defaultValue="compose">
      <TabImageContainer>
        {tabs.map((tab) => (
          <TabImage key={tab.id} value={tab.id}>
            <div
              aria-label={`${tab.title} abstract preview`}
              className={`grid h-full place-items-center rounded-xl bg-gradient-to-br text-4xl font-semibold ${tab.color}`}
              role="img"
            >
              {tab.title}
            </div>
          </TabImage>
        ))}
      </TabImageContainer>
      <TabList className="self-center">
        {tabs.map((tab) => (
          <TabItem key={tab.id} value={tab.id}>
            <TabHeader value={tab.id}>{tab.title}</TabHeader>
            <TabDes value={tab.id}>
              <p className="px-4 pb-4 text-sm text-zinc-700 dark:text-zinc-800">{tab.description}</p>
            </TabDes>
          </TabItem>
        ))}
      </TabList>
    </TabsProvider>
  );
}
