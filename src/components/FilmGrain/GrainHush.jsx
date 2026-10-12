"use client";

import { useEffect } from "react";
import grain from "./grain.module.css";

const WHITE_SELECTOR = `.${grain.surfaceWhite.split(" ")[0]}`;

// White coverage of the viewport at which the page grain starts to fade, and where it's fully hushed.
const HUSH_FROM = 0.3;
const HUSH_TO = 0.7;

const parseInset = (clipPath, rect) => {
  const match = /^inset\(([^)]*)\)/.exec(clipPath);
  if (!match) return null;
  const parts = match[1].split(/\s+/).filter(Boolean).slice(0, 4).map((value, index) => {
    const amount = parseFloat(value) || 0;
    if (!value.endsWith("%")) return amount;
    return (amount / 100) * (index % 2 === 0 ? rect.height : rect.width);
  });
  const [top, right = top, bottom = top, left = right] = parts;
  return {
    top: rect.top + top,
    right: rect.right - right,
    bottom: rect.bottom - bottom,
    left: rect.left + left,
  };
};

// The part of an element left visible by its own and its ancestors' inset() clip-paths.
const visibleRect = (element) => {
  const rect = element.getBoundingClientRect();
  let box = { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left };
  for (let node = element; node && node !== document.body; node = node.parentElement) {
    const clipPath = getComputedStyle(node).clipPath;
    if (!clipPath || clipPath === "none") continue;
    const clip = parseInset(clipPath, node === element ? rect : node.getBoundingClientRect());
    if (!clip) continue;
    box = {
      top: Math.max(box.top, clip.top),
      right: Math.min(box.right, clip.right),
      bottom: Math.min(box.bottom, clip.bottom),
      left: Math.max(box.left, clip.left),
    };
  }
  return box;
};

const whiteCoverage = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const spans = [];
  let widest = 0;
  for (const element of document.querySelectorAll(WHITE_SELECTOR)) {
    const box = visibleRect(element);
    const top = Math.max(box.top, 0);
    const bottom = Math.min(box.bottom, height);
    const span = Math.min(box.right, width) - Math.max(box.left, 0);
    if (bottom <= top || span <= 0) continue;
    spans.push([top, bottom]);
    widest = Math.max(widest, span / width);
  }
  spans.sort((a, b) => a[0] - b[0]);
  let covered = 0;
  let reach = 0;
  for (const [top, bottom] of spans) {
    if (bottom <= reach) continue;
    covered += bottom - Math.max(top, reach);
    reach = bottom;
  }
  return (covered / height) * widest;
};

/** Fades the page background's grain while white boxes fill the viewport, via `--page-hush`. */
export default function GrainHush() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;

    const update = () => {
      frame = 0;
      const linear = Math.min(1, Math.max(0, (whiteCoverage() - HUSH_FROM) / (HUSH_TO - HUSH_FROM)));
      const hush = linear * linear * (3 - 2 * linear);
      root.style.setProperty("--page-hush", hush.toFixed(3));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // Scroll events don't bubble, so listen in the capture phase to catch every scroller.
    document.addEventListener("scroll", schedule, { capture: true, passive: true });
    window.addEventListener("resize", schedule);
    // Clip-path reveals and route changes can move white boxes without a scroll.
    const interval = setInterval(schedule, 400);
    schedule();

    return () => {
      document.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
      clearInterval(interval);
      cancelAnimationFrame(frame);
      root.style.removeProperty("--page-hush");
    };
  }, []);

  return null;
}
