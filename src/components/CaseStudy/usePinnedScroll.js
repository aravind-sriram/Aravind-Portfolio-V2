"use client";

import { useEffect } from "react";

/**
 * Sticks `pinRef` in the middle of the case-study scroller while `runwayRef` scrolls past.
 * `scene(pin, { reduced, scroller, scrolled, seek })` must be stable (module scope);
 * `scrolled()` is the pinned scroll offset (negative before pinning), `seek(offset)` jumps to one.
 * It returns:
 *   measure({ top, visible, pinTop }) -> extra scroll length in px while pinned
 *     (top = visible area's top edge, pinTop = pinned top edge, both in viewport px)
 *   update(scrolled)              -> apply the pinned scroll offset
 *   reset()                       -> undo inline styles
 */
export default function usePinnedScroll(runwayRef, pinRef, scene) {
  useEffect(() => {
    const runway = runwayRef.current;
    const pin = pinRef.current;
    const scroller = runway?.closest("main");
    if (!runway || !pin || !scroller) return undefined;

    let pinTop = 0;
    let frame = 0;
    const scrolled = () => pinTop - runway.getBoundingClientRect().top;
    const seek = (offset) => {
      scroller.scrollTop += offset - scrolled();
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const active = scene(pin, { reduced, scroller, scrolled, seek });

    const update = () => {
      frame = 0;
      active.update(Math.max(0, scrolled()));
    };

    const measure = () => {
      const { paddingTop, paddingBottom } = getComputedStyle(scroller);
      const top = parseFloat(paddingTop);
      const visible = scroller.clientHeight - top - parseFloat(paddingBottom);
      const pinHeight = pin.offsetHeight;
      pinTop = top + (pinHeight <= visible ? (visible - pinHeight) / 2 : visible - pinHeight);
      /* Sticky offsets are measured from inside the scroller's padding. */
      pin.style.top = `${pinTop - top}px`;
      runway.style.height = `${pinHeight + active.measure({ top, visible, pinTop })}px`;
      update();
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(pin);
    observer.observe(scroller);
    scroller.addEventListener("scroll", onScroll, { passive: true });
    measure();

    return () => {
      observer.disconnect();
      scroller.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      active.reset();
      pin.style.removeProperty("top");
      runway.style.removeProperty("height");
    };
  }, [runwayRef, pinRef, scene]);
}
