"use client";

import { useEffect, useRef } from "react";
import { SCROLL_FRAME_EVENT } from "@/components/Works/AboutInterests";
import styles from "./CustomCursor.module.css";

const DOT = 19.5;
const GROWN = 52.5;
const PILL_PAD_X = 30;
const PILL_PAD_Y = 20;
const MARQUEE_GAP = 32;
const MARQUEE_COPIES = 3;
const MARQUEE_SPEED = 50;
/* Size changes ride a slightly underdamped spring (a touch of overshoot); position never lags. */
const STIFFNESS = 420;
const DAMPING = 31;
const SUBSTEP = 1 / 240;

function modeAt(target) {
  const el = target instanceof Element ? target : null;
  if (el?.closest("[data-cursor-hidden]")) return { mode: "hidden" };
  const labelled = el?.closest("[data-cursor-label]");
  if (labelled) {
    return {
      mode: "pill",
      text: labelled.dataset.cursorLabel,
      marquee: labelled.hasAttribute("data-cursor-marquee"),
    };
  }
  if (el?.closest("a[href], button")) return { mode: "grow" };
  return { mode: "dot" };
}

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const cursor = cursorRef.current;
    const text = textRef.current;
    const root = document.documentElement;

    let pointer = null;
    let mode = "dot";
    const size = { w: DOT, h: DOT };
    const velocity = { w: 0, h: 0 };
    const target = { w: DOT, h: DOT };
    let frame = 0;
    let lastTime = 0;
    let labelKey = "";
    let labelWidth = 0;

    /* Rebuilding the label restarts its marquee, so only do it when the label changes. */
    const renderLabel = (next) => {
      const key = `${next.marquee ? "marquee:" : ""}${next.text}`;
      if (key === labelKey) return;
      labelKey = key;
      cursor.toggleAttribute("data-marquee", next.marquee);
      if (!next.marquee) {
        text.textContent = next.text;
        text.style.marginLeft = "";
        text.style.animationDuration = "";
        labelWidth = text.offsetWidth;
        return;
      }
      const copies = Array.from({ length: MARQUEE_COPIES }, (_, index) => {
        const copy = document.createElement("span");
        copy.textContent = next.text;
        copy.style.paddingRight = `${MARQUEE_GAP}px`;
        if (index > 0) copy.setAttribute("aria-hidden", "true");
        return copy;
      });
      text.replaceChildren(...copies);
      text.style.marginLeft = `${PILL_PAD_X}px`;
      const cycle = copies[0].offsetWidth;
      text.style.animationDuration = `${cycle / MARQUEE_SPEED}s`;
      labelWidth = cycle - MARQUEE_GAP;
    };

    const place = () => {
      cursor.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
    };
    const paintSize = () => {
      cursor.style.width = `${size.w}px`;
      cursor.style.height = `${size.h}px`;
    };

    const step = (now) => {
      const elapsed = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;
      const steps = Math.max(1, Math.round(elapsed / SUBSTEP));
      const dt = elapsed / steps;
      let settled = true;
      for (const key of ["w", "h"]) {
        for (let i = 0; i < steps; i += 1) {
          const accel = STIFFNESS * (target[key] - size[key]) - DAMPING * velocity[key];
          velocity[key] += accel * dt;
          size[key] += velocity[key] * dt;
        }
        if (Math.abs(target[key] - size[key]) > 0.05 || Math.abs(velocity[key]) > 0.05) {
          settled = false;
        }
      }
      if (settled) {
        size.w = target.w;
        size.h = target.h;
      }
      paintSize();
      frame = settled ? 0 : requestAnimationFrame(step);
    };

    const animate = () => {
      if (frame) return;
      lastTime = performance.now();
      frame = requestAnimationFrame(step);
    };

    const apply = (next) => {
      const wasHidden = mode === "hidden";
      if (next.mode !== mode) {
        cursor.dataset.mode = next.mode;
        mode = next.mode;
      }
      if (mode === "pill") {
        renderLabel(next);
        target.w = labelWidth + PILL_PAD_X * 2;
        target.h = text.offsetHeight + PILL_PAD_Y * 2;
      } else {
        const diameter = mode === "grow" ? GROWN : DOT;
        target.w = diameter;
        target.h = diameter;
      }
      if (wasHidden && mode !== "hidden") {
        for (const key of ["w", "h"]) {
          size[key] = target[key];
          velocity[key] = 0;
        }
        paintSize();
      }
      cursor.toggleAttribute("data-visible", mode !== "hidden");
      animate();
    };

    const resolve = () => {
      if (pointer) apply(modeAt(document.elementFromPoint(pointer.x, pointer.y)));
    };

    const onPointerMove = (event) => {
      if (event.pointerType !== "mouse") return;
      pointer = { x: event.clientX, y: event.clientY };
      place();
      apply(modeAt(event.target));
    };

    // Clicks can swap a label (Copy → Copied) without the pointer moving.
    const onClick = () => setTimeout(resolve, 50);

    const onPointerOut = (event) => {
      if (event.relatedTarget) return;
      pointer = null;
      cursor.removeAttribute("data-visible");
    };

    const enable = () => {
      root.classList.add("custom-cursor");
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerout", onPointerOut);
      window.addEventListener("click", onClick);
      // Content scrolling under a still pointer fires no pointer events.
      document.addEventListener("scroll", resolve, { capture: true, passive: true });
      document.addEventListener(SCROLL_FRAME_EVENT, resolve, { capture: true });
    };

    const disable = () => {
      root.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("click", onClick);
      document.removeEventListener("scroll", resolve, { capture: true });
      document.removeEventListener(SCROLL_FRAME_EVENT, resolve, { capture: true });
      cancelAnimationFrame(frame);
      frame = 0;
      pointer = null;
      cursor.removeAttribute("data-visible");
    };

    paintSize();
    const sync = () => (media.matches ? enable() : disable());
    sync();
    media.addEventListener("change", sync);

    return () => {
      media.removeEventListener("change", sync);
      disable();
    };
  }, []);

  return (
    <div ref={cursorRef} className={styles.cursor} data-mode="dot" aria-hidden="true">
      <span ref={textRef} className={styles.text} />
    </div>
  );
}
