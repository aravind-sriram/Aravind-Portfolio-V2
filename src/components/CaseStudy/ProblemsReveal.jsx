"use client";

import { useRef } from "react";
import styles from "./CaseStudy.module.css";
import createStepper from "./createStepper";
import usePinnedScroll from "./usePinnedScroll";

/* Scroll distance per card, as a fraction of the visible panel height. */
const STEP = 0.4;
/* Extra pinned scroll after the last card lands, in steps. */
const HOLD = 0.5;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const easeOut = (progress) => 1 - (1 - progress) ** 3;

const revealCards = (pin) => [...pin.querySelectorAll("[data-reveal-card]")].slice(1);

/* Offsets that park each card just below the visible panel while the pin is stuck. */
const startDistances = (cards, { top, visible, pinTop }) =>
  cards.map((card) => top + visible - (pinTop + card.offsetTop) + 16);

const raise = (card, distance, progress) => {
  card.style.transform = `translateY(${((1 - easeOut(progress)) * distance).toFixed(2)}px)`;
};

/* Scrubs every `[data-reveal-card]` after the first up from below the panel, one per STEP. */
function scrubScene(pin, { reduced }) {
  const cards = revealCards(pin);
  let step = 1;
  let distances = [];

  return {
    measure(context) {
      if (reduced) return 0;
      step = context.visible * STEP;
      distances = startDistances(cards, context);
      return step * (cards.length + HOLD);
    },
    update(scrolled) {
      if (reduced) return;
      cards.forEach((card, index) => {
        raise(card, distances[index], clamp((scrolled - index * step) / step, 0, 1));
      });
    },
    reset() {
      cards.forEach((card) => card.style.removeProperty("transform"));
    },
  };
}

/* Same rise, but each wheel gesture brings up exactly one card. */
function stepScene(pin, context) {
  if (context.reduced) return scrubScene(pin, context);
  const cards = revealCards(pin);
  let distances = [];

  return createStepper(cards.length + 1, context, {
    measure: (measured) => {
      distances = startDistances(cards, measured);
    },
    render: (shown) => {
      cards.forEach((card, index) => {
        raise(card, distances[index] ?? 0, clamp(shown - index, 0, 1));
      });
    },
    clear: () => cards.forEach((card) => card.style.removeProperty("transform")),
  });
}

export default function ProblemsReveal({ stepped = false, children }) {
  const runwayRef = useRef(null);
  const pinRef = useRef(null);
  usePinnedScroll(runwayRef, pinRef, stepped ? stepScene : scrubScene);

  return (
    <div ref={runwayRef}>
      <div ref={pinRef} className={styles.problemsPin}>
        {children}
      </div>
    </div>
  );
}
