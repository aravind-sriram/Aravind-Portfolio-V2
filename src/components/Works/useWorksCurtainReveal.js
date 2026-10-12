"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const CURTAIN_OPEN_EVENT = "works-curtain-open";
/* Playhead share at which the eased wipe has uncovered the top of the panel
   (about 92% open), so content near the top is actually visible. */
const CURTAIN_OPEN_AT = 0.8;

export default function useWorksCurtainReveal({ sectionRef, curtainRef }) {
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const curtain = curtainRef.current;
    if (!section || !curtain) {
      return undefined;
    }

    gsap.registerPlugin(ScrollTrigger);

    gsap.set(curtain, { clipPath: "inset(100% 0 0 0)" });

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "top top",
          scrub: 0.85,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          if (section.hasAttribute("data-curtain-open")) return;
          if (timeline.progress() < CURTAIN_OPEN_AT) return;
          section.setAttribute("data-curtain-open", "");
          section.dispatchEvent(new Event(CURTAIN_OPEN_EVENT));
        },
      });

      timeline.fromTo(
        curtain,
        { clipPath: "inset(100% 0 0 0)" },
        { clipPath: "inset(0% 0 0 0)", ease: "power2.inOut", duration: 1 },
      );
    }, section);

    const main = curtain.querySelector("[data-works-main]");
    const syncMainScroll = () => {
      if (!main) return;
      const open = section.getBoundingClientRect().top <= 1;
      main.style.overflowY = open ? "" : "hidden";
    };
    syncMainScroll();
    window.addEventListener("scroll", syncMainScroll, { passive: true });

    const onResize = () => {
      ScrollTrigger.refresh();
      syncMainScroll();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", syncMainScroll);
      window.removeEventListener("resize", onResize);
      if (main) main.style.overflowY = "";
      section.removeAttribute("data-curtain-open");
      ctx.revert();
    };
  }, [sectionRef, curtainRef]);
}
