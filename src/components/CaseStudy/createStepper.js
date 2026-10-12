/* Pinned scroll reserved per step, as a fraction of the visible panel height. */
const STEP = 0.4;
/* Pinned slack after the last step's anchor, in steps; scrolling past it releases the section. */
const HOLD = 0.02;
/* Tween duration between steps, in ms. */
const DURATION = 650;
/* Wheel events closer together than this (with small deltas) belong to one gesture. */
const GESTURE_GAP = 80;
const MOUSE_TICK = 50;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const easeInOut = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Builds a `usePinnedScroll` scene where, while pinned, each wheel gesture moves exactly one
 * step: the scroll is held at that step's anchor and `shown` (0 … count - 1) tweens there, so
 * the scene never rests between steps. `render(shown)` paints, `measure(context)` runs before
 * each repaint on resize, and `clear()` undoes the painting.
 */
export default function createStepper(
  count,
  { reduced, scroller, scrolled, seek },
  { render, measure, clear },
) {
  const last = count - 1;
  let step = 1;
  let length = 0;
  let index = 0;
  let shown = 0;
  let animating = false;
  let frame = 0;
  let lastWheel = 0;

  /* A scene near the end of the page may run out of scroll before its last anchor. */
  const limit = () =>
    scrolled() + scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop;
  const anchor = (target) => Math.min(target * step, limit());

  const goTo = (next) => {
    index = next;
    cancelAnimationFrame(frame);
    if (reduced) {
      shown = next;
      animating = false;
      render(shown);
      return;
    }
    const from = shown;
    const start = performance.now();
    animating = true;
    const tick = (now) => {
      const t = clamp((now - start) / DURATION, 0, 1);
      shown = from + (next - from) * easeInOut(t);
      render(shown);
      if (t < 1) frame = requestAnimationFrame(tick);
      else animating = false;
    };
    frame = requestAnimationFrame(tick);
  };

  const onWheel = (event) => {
    if (event.ctrlKey || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
    const now = performance.now();
    const sameGesture = now - lastWheel < GESTURE_GAP && Math.abs(event.deltaY) < MOUSE_TICK;
    lastWheel = now;
    const offset = scrolled();
    if (offset < -1 || offset > length) return;

    /* Input that belongs to a step in progress never reaches the page, even at either end. */
    if (animating || sameGesture) {
      event.preventDefault();
      return;
    }
    const down = event.deltaY > 0;
    if (down ? index >= last : index <= 0) return;

    event.preventDefault();
    const next = index + (down ? 1 : -1);
    goTo(next);
    seek(anchor(next));
  };

  scroller.addEventListener("wheel", onWheel, { passive: false });

  return {
    measure(context) {
      step = context.visible * STEP;
      length = step * (last + HOLD);
      measure?.(context);
      render(shown);
      return length;
    },
    update(offset) {
      if (animating) return;
      const position =
        offset >= anchor(last) - 1 ? last : clamp(Math.floor((offset + 1) / step), 0, last);
      if (position !== index) goTo(position);
    },
    reset() {
      scroller.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(frame);
      clear();
    },
  };
}
