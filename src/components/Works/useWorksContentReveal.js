"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import revealStyles from "./WorksReveal.module.css";
import { CURTAIN_OPEN_EVENT } from "./useWorksCurtainReveal";
import {
  restoreSplitTextLines,
  splitTextElementIntoLines,
} from "./splitTextLines";
import {
  restoreSplitTextWords,
  splitTextElementIntoWords,
} from "./splitTextIntoWords";

const COUNT_UP_DURATION = 0.9;

export default function useWorksContentReveal({ sectionRef }) {
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return undefined;
    }

    gsap.registerPlugin(ScrollTrigger);

    const headings = [...section.querySelectorAll("[data-word-reveal]")];
    const wordInners = headings.flatMap((heading) =>
      splitTextElementIntoWords(
        heading,
        revealStyles.wordMask,
        revealStyles.wordInner,
        {
          mutedClass: revealStyles.wordMuted,
          mutedWordCount: Number.parseInt(
            heading.getAttribute("data-muted-word-count") ?? "0",
            10,
          ),
        },
      ),
    );

    const lineElements = [...section.querySelectorAll("[data-line-reveal]")];
    const lineInners = lineElements.flatMap((element) => {
      const maskClass =
        element.dataset.revealContext === "title"
          ? revealStyles.titleLineMask
          : revealStyles.bodyLineMask;

      return splitTextElementIntoLines(
        element,
        maskClass,
        revealStyles.lineInner,
      );
    });

    const navItems = [...section.querySelectorAll("[data-reveal-nav]")];

    const countItems = [...section.querySelectorAll("[data-count-stat]")]
      .map((statBlock) => ({
        valueEl: statBlock.querySelector("[data-count-value]"),
        endValue: Number.parseInt(
          statBlock.getAttribute("data-count-stat") ?? "0",
          10,
        ),
      }))
      .filter(({ valueEl, endValue }) => valueEl && Number.isFinite(endValue));

    let onCurtainOpen = null;

    const ctx = gsap.context(() => {
      gsap.set(wordInners, { y: "110%" });
      gsap.set(lineInners, { y: "110%" });
      gsap.set(navItems, { y: 40, opacity: 0 });

      const runCountUp = () => {
        countItems.forEach(({ valueEl, endValue }) => {
          valueEl.textContent = "0";
          const proxy = { val: 0 };
          gsap.to(proxy, {
            val: endValue,
            duration: COUNT_UP_DURATION,
            ease: "power2.out",
            onUpdate: () => {
              valueEl.textContent = String(Math.round(proxy.val));
            },
            onComplete: () => {
              valueEl.textContent = String(endValue);
            },
          });
        });
      };

      // Waits for the curtain to uncover the panel; the copy sits near its top,
      // so starting on scroll position alone plays it while still hidden.
      const tl = gsap.timeline({ paused: true });

      if (wordInners.length) {
        tl.fromTo(
          wordInners,
          { y: "110%" },
          {
            y: "0%",
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.08,
          },
        );
      }

      if (lineInners.length) {
        tl.fromTo(
          lineInners,
          { y: "110%" },
          {
            y: "0%",
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.1,
          },
          wordInners.length ? "-=0.35" : 0,
        );
      }

      if (navItems.length) {
        tl.fromTo(
          navItems,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.07,
          },
          wordInners.length || lineInners.length ? "-=0.4" : 0,
        );
      }

      tl.add(runCountUp, 0.15);

      if (section.hasAttribute("data-curtain-open")) {
        tl.play();
      } else {
        onCurtainOpen = () => tl.play();
        section.addEventListener(CURTAIN_OPEN_EVENT, onCurtainOpen, { once: true });
      }

      ScrollTrigger.refresh();
    }, section);

    return () => {
      if (onCurtainOpen) section.removeEventListener(CURTAIN_OPEN_EVENT, onCurtainOpen);
      ctx.revert();
      headings.forEach(restoreSplitTextWords);
      lineElements.forEach(restoreSplitTextLines);
    };
  }, [sectionRef]);
}
