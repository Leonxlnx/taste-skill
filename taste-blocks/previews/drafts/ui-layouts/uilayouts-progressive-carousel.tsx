"use client";

import { useState } from "react";

import {
  ProgressSlider,
  SliderBtn,
  SliderBtnGroup,
  SliderContent,
  SliderWrapper,
} from "@/registry/sources/ui-layouts/components/uilayouts-progressive-carousel/progressive-carousel";

const slides = [
  { id: "signal", label: "Signal", color: "from-emerald-400 to-cyan-700" },
  { id: "orbit", label: "Orbit", color: "from-violet-500 to-indigo-950" },
  { id: "ember", label: "Ember", color: "from-amber-400 to-rose-700" },
];

export default function ProgressiveCarouselPreview() {
  const [paused, setPaused] = useState(false);

  return (
    <div className="relative">
      <ProgressSlider
        activeSlider="signal"
        autoPlay
        className="min-h-80 overflow-hidden rounded-2xl bg-zinc-950 p-5 text-white"
        duration={5000}
        paused={paused}
      >
        <SliderContent>
          {slides.map((slide) => (
            <SliderWrapper key={slide.id} value={slide.id}>
              <div className={`grid h-56 place-items-end rounded-xl bg-gradient-to-br p-6 ${slide.color}`}>
                <h3 className="text-3xl font-semibold">{slide.label}</h3>
              </div>
            </SliderWrapper>
          ))}
        </SliderContent>
        <SliderBtnGroup className="mt-4 grid grid-cols-3 gap-2">
          {slides.map((slide) => (
            <SliderBtn
              className="overflow-hidden rounded-lg border border-white/20 px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
              key={slide.id}
              progressBarClass="bottom-0 h-1 bg-white/70"
              value={slide.id}
            >
              {slide.label}
            </SliderBtn>
          ))}
        </SliderBtnGroup>
      </ProgressSlider>
      <button
        aria-pressed={paused}
        className="absolute right-8 top-8 rounded-full border border-white/30 bg-black/50 px-3 py-1.5 text-xs font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={() => setPaused((value) => !value)}
        type="button"
      >
        {paused ? "Resume autoplay" : "Pause autoplay"}
      </button>
    </div>
  );
}
