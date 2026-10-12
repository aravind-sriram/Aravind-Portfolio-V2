"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const GREY = { r: 172, g: 172, b: 172 };
const WHITE = { r: 255, g: 255, b: 255 };

function mixChannel(from, to, amount) {
  return Math.round(from + (to - from) * amount);
}

function colorAt(amount) {
  const t = Math.min(1, Math.max(0, amount));
  return `rgb(${mixChannel(GREY.r, WHITE.r, t)}, ${mixChannel(GREY.g, WHITE.g, t)}, ${mixChannel(GREY.b, WHITE.b, t)})`;
}

/** Same sweep length as the old travel from the bottom of the panel to 18%. */
const SWEEP_VIEWPORT_RATIO = 0.82;
const HOLD_ABOVE_CENTER = 40;

/**
 * The heading scrolls up to just above the center, then the heading and
 * paragraph hold there while the letters turn white. They move again only
 * after the last letter is white.
 */
export default function useArsenalTitleScroll({ sectionRef }) {
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return undefined;
    }

    const main = section.querySelector("[data-works-main]");
    const block = section.querySelector("[data-design-arsenal]");
    const pin = section.querySelector("[data-arsenal-pin]");
    const title = section.querySelector("[data-arsenal-title]");
    const chars = [...section.querySelectorAll("[data-arsenal-char]")];
    if (!main || !block || !pin || !title || chars.length === 0) {
      return undefined;
    }

    gsap.registerPlugin(ScrollTrigger);

    const paint = (progress) => {
      const count = chars.length;
      chars.forEach((char, index) => {
        const start = index / count;
        const span = 1 / count;
        char.style.color = colorAt((progress - start) / span);
      });
    };

    let stickyTop = 0;
    let distance = 0;

    const layoutHold = () => {
      const mainHeight = main.clientHeight;
      const titleHeight = title.getBoundingClientRect().height;
      stickyTop = Math.max(
        0,
        Math.round((mainHeight - titleHeight) / 2) - HOLD_ABOVE_CENTER,
      );
      pin.style.position = "sticky";
      pin.style.top = `${stickyTop}px`;
      pin.style.zIndex = "1";
      distance = Math.round(mainHeight * SWEEP_VIEWPORT_RATIO);
      block.style.minHeight = `${pin.offsetHeight + distance}px`;
    };

    layoutHold();

    const trigger = ScrollTrigger.create({
      trigger: block,
      scroller: main,
      start: () => `top top+=${stickyTop}`,
      end: () => `+=${distance}`,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => paint(self.progress),
      onLeave: () => paint(1),
      onLeaveBack: () => paint(0),
    });

    paint(trigger.progress);

    let resizeTimer = null;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        layoutHold();
        ScrollTrigger.refresh();
      }, 150);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(main);

    return () => {
      window.clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      trigger.kill();
      pin.style.position = "";
      pin.style.top = "";
      pin.style.zIndex = "";
      block.style.minHeight = "";
      chars.forEach((char) => {
        char.style.color = "";
      });
    };
  }, [sectionRef]);
}
