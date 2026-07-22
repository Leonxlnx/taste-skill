"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId, useState } from "react";

export type AccordionItem = { id: string; title: string; description: string };

export function BouncyAccordion({ items }: { items: AccordionItem[] }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);
  const baseId = useId();
  const reduce = useReducedMotion();
  const transition = reduce ? { duration: 0 } : { type: "spring" as const, duration: .55, bounce: .32 };

  return <div className="disclosure">{items.map((item, index) => {
    const open = active === item.id;
    const activeIndex = items.findIndex(({ id }) => id === active);
    const touchesOpen = Math.abs(activeIndex - index) <= 1;
    const contentId = `${baseId}-${item.id}-content`;
    const triggerId = `${baseId}-${item.id}-trigger`;
    return <motion.article animate={{ marginTop: index > 0 && (open || activeIndex === index - 1) ? 12 : 0, borderRadius: touchesOpen ? 20 : 0 }} transition={transition} className={open ? "is-open" : ""} key={item.id}>
      <button id={triggerId} aria-controls={contentId} aria-expanded={open} onClick={() => setActive(open ? null : item.id)}><span>{item.title}</span><motion.span aria-hidden animate={{ rotate: open ? 45 : 0 }} transition={transition}>＋</motion.span></button>
      <motion.div id={contentId} role="region" aria-labelledby={triggerId} aria-hidden={!open} inert={!open} className="answer" animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} transition={transition}><p>{item.description}</p></motion.div>
    </motion.article>;
  })}</div>;
}
