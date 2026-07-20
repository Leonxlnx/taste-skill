"use client";

import CardStack, {
  type CardStackItem,
  useCardStack,
} from "@/registry/sources/animata/components/animata-card-stack/card-stack";

type PreviewCard = CardStackItem & {
  title: string;
  description: string;
  className: string;
};

const cards: PreviewCard[] = [
  {
    id: "motion",
    title: "Motion",
    description: "Continuity makes state changes easier to follow.",
    className: "bg-amber-100 text-amber-950",
  },
  {
    id: "hierarchy",
    title: "Hierarchy",
    description: "One clear focal point keeps the interaction readable.",
    className: "bg-sky-100 text-sky-950",
  },
  {
    id: "feedback",
    title: "Feedback",
    description: "Every action should produce an immediate response.",
    className: "bg-emerald-100 text-emerald-950",
  },
];

function ActiveCardAnnouncement() {
  const { activeItem } = useCardStack<PreviewCard>();

  return (
    <p aria-live="polite" className="mb-3 text-center text-sm text-zinc-500">
      Showing {activeItem?.title}
    </p>
  );
}

export default function AnimataCardStackPreview() {
  return (
    <div className="flex min-h-[30rem] items-center justify-center overflow-hidden rounded-2xl bg-zinc-100 p-8">
      <CardStack items={cards}>
        <section aria-label="Design principles" className="w-72">
          <ActiveCardAnnouncement />
          <CardStack.Viewport className="h-72 pt-10">
            <CardStack.List>
              {(item: PreviewCard, index, layer) => (
                <CardStack.Card
                  key={item.id}
                  layer={layer}
                  stackIndex={index}
                  className={`h-56 rounded-3xl border border-black/10 p-6 shadow-xl ${item.className}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">Principle</p>
                  <h2 className="mt-8 text-3xl font-semibold">{item.title}</h2>
                  <p className="mt-3 text-sm leading-6 opacity-75">{item.description}</p>
                  {index === 0 ? <CardStack.Trigger full aria-label="Show next principle" /> : null}
                </CardStack.Card>
              )}
            </CardStack.List>
          </CardStack.Viewport>
        </section>
      </CardStack>
    </div>
  );
}
