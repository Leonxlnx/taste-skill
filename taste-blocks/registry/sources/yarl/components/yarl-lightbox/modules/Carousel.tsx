import * as React from "react";

import { ComponentProps, Slide } from "../types.js";
import { createModule } from "../config.js";
import {
  calculatePreload,
  clsx,
  composePrefix,
  cssClass,
  cssVar,
  getSlide,
  getSlideKey,
  hasSlides,
  isImageSlide,
  makeInertWhen,
  parseLengthPercentage,
  translateLabel,
  translateSlideCounter,
} from "../utils.js";
import { ImageSlide } from "../components/index.js";
import { useController } from "./Controller/index.js";
import { useA11yContext, useDocumentContext, useLightboxProps, useLightboxState } from "../contexts/index.js";
import { CLASS_FLEX_CENTER, CLASS_SLIDE, MODULE_CAROUSEL } from "../consts.js";

function cssPrefix(value?: string) {
  return composePrefix(MODULE_CAROUSEL, value);
}

function cssSlidePrefix(value?: string) {
  return composePrefix(CLASS_SLIDE, value);
}

type CarouselSlideProps = {
  slide: Slide;
  offset: number;
};

function CarouselSlide({ slide, offset }: CarouselSlideProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { currentIndex, slides } = useLightboxState();
  const { slideRect, focus } = useController();
  const {
    render,
    carousel: { imageFit, imageProps },
    on: { click: onClick },
    styles: { slide: style },
    labels,
  } = useLightboxProps();
  const { getOwnerDocument } = useDocumentContext();

  const offscreen = offset !== 0;

  React.useEffect(() => {
    if (offscreen && containerRef.current?.contains(getOwnerDocument().activeElement)) {
      focus();
    }
  }, [offscreen, focus, getOwnerDocument]);

  const renderSlide = () => {
    let rendered = render.slide?.({ slide, offset, rect: slideRect });

    if (!rendered && isImageSlide(slide)) {
      rendered = (
        <ImageSlide
          slide={slide}
          offset={offset}
          render={render}
          rect={slideRect}
          imageFit={imageFit}
          imageProps={imageProps}
          onClick={!offscreen ? () => onClick?.({ index: currentIndex }) : undefined}
        />
      );
    }

    return rendered ? (
      <>
        {render.slideHeader?.({ slide })}
        {(render.slideContainer ?? (({ children }) => children))({ slide, children: rendered })}
        {render.slideFooter?.({ slide })}
      </>
    ) : null;
  };

  return (
    <div
      ref={containerRef}
      className={clsx(
        cssClass(cssSlidePrefix()),
        !offscreen && cssClass(cssSlidePrefix("current")),
        cssClass(CLASS_FLEX_CENTER),
      )}
      {...makeInertWhen(offscreen)}
      style={style}
      role="group"
      aria-roledescription={translateLabel(labels, "Slide")}
      aria-label={translateSlideCounter(labels, slides, currentIndex + offset)}
    >
      {renderSlide()}
    </div>
  );
}

function Placeholder() {
  const style = useLightboxProps().styles.slide;
  return <div className={cssClass(CLASS_SLIDE)} style={style} />;
}

export function Carousel({ carousel, labels }: ComponentProps) {
  const { slides, currentIndex, globalIndex } = useLightboxState();
  const { setCarouselRef } = useController();
  const { autoPlaying, focusWithin } = useA11yContext();

  const spacingValue = parseLengthPercentage(carousel.spacing);
  const paddingValue = parseLengthPercentage(carousel.padding);

  const preload = calculatePreload(carousel, slides, 1);
  const items: ({ key: React.Key } & ({ slide: Slide; offset: number } | { slide?: never; offset?: never }))[] = [];

  if (hasSlides(slides)) {
    for (let index = currentIndex - preload; index <= currentIndex + preload; index += 1) {
      const slide = getSlide(slides, index);
      const key = globalIndex - currentIndex + index;
      const placeholder = carousel.finite && (index < 0 || index > slides.length - 1);

      items.push(
        !placeholder
          ? {
              key: [`${key}`, getSlideKey(slide)].filter(Boolean).join("|"),
              offset: index - currentIndex,
              slide,
            }
          : { key },
      );
    }
  }

  return (
    <div
      ref={setCarouselRef}
      className={clsx(cssClass(cssPrefix()), items.length > 0 && cssClass(cssPrefix("with_slides")))}
      style={{
        [`${cssVar(cssPrefix("slides_count"))}`]: items.length,
        [`${cssVar(cssPrefix("spacing_px"))}`]: spacingValue.pixel || 0,
        [`${cssVar(cssPrefix("spacing_percent"))}`]: spacingValue.percent || 0,
        [`${cssVar(cssPrefix("padding_px"))}`]: paddingValue.pixel || 0,
        [`${cssVar(cssPrefix("padding_percent"))}`]: paddingValue.percent || 0,
      }}
      role="region"
      aria-live={autoPlaying && !focusWithin ? "off" : "polite"}
      aria-roledescription={translateLabel(labels, "Carousel")}
      aria-label={translateLabel(labels, "Photo gallery")}
    >
      {items.map(({ key, slide, offset }) =>
        slide ? <CarouselSlide key={key} slide={slide} offset={offset} /> : <Placeholder key={key} />,
      )}
    </div>
  );
}

export const CarouselModule = createModule(MODULE_CAROUSEL, Carousel);
