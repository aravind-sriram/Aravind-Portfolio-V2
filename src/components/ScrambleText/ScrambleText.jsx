"use client";

import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import styles from "./ScrambleText.module.css";

const CHARSET_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CHARSET_LOWER = "abcdefghijklmnopqrstuvwxyz";
const DURATION_MS = 550;

function charsetFor(original) {
  if (original === " ") return null;
  const isLetter = original.toLowerCase() !== original.toUpperCase();
  if (!isLetter) return null;
  return original === original.toUpperCase() ? CHARSET_UPPER : CHARSET_LOWER;
}

function randomCharFor(original, pool = charsetFor(original)) {
  if (!pool || pool.length === 0) return original;
  return pool[Math.floor(Math.random() * pool.length)];
}

let measureContext = null;

/* Per character, the letters of its case that render no wider in the element's font. Kerning
   can still widen a combination, so `fits` checks each whole frame against the settled text. */
function narrowerPools(chars, element) {
  measureContext ??= document.createElement("canvas").getContext("2d");
  const style = getComputedStyle(element);
  measureContext.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const widthOf = (value) => measureContext.measureText(value).width;
  const limit = widthOf(chars.join(""));
  const pools = chars.map((char) => {
    const charset = charsetFor(char);
    if (!charset) return null;
    return [...charset].filter((candidate) => widthOf(candidate) <= widthOf(char));
  });
  return { pools, fits: (value) => widthOf(value) <= limit };
}

const FRAME_ATTEMPTS = 6;

const ScrambleText = forwardRef(function ScrambleText(
  { text, className = "", as: Tag = "span", externalTrigger = false, fixedWidth = false },
  ref,
) {
  const displayRef = useRef(null);
  const frameRef = useRef(null);
  const startRef = useRef(0);

  const runScramble = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    const chars = text.split("");
    const { pools, fits } =
      fixedWidth && displayRef.current
        ? narrowerPools(chars, displayRef.current)
        : { pools: chars.map((char) => charsetFor(char)), fits: () => true };
    const settled = new Array(chars.length).fill(false);
    startRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / DURATION_MS, 1);

      chars.forEach((char, index) => {
        const threshold = (index + 1) / chars.length;
        if (progress >= threshold * 0.85) {
          settled[index] = true;
        }
      });

      const frame = () =>
        chars
          .map((char, index) => (settled[index] ? char : randomCharFor(char, pools[index])))
          .join("");
      let output = frame();
      for (let attempt = 1; attempt < FRAME_ATTEMPTS && !fits(output); attempt += 1) {
        output = frame();
      }
      if (!fits(output)) output = text;

      if (displayRef.current) {
        displayRef.current.textContent = output;
      }

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else if (displayRef.current) {
        displayRef.current.textContent = text;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
  }, [text, fixedWidth]);

  useImperativeHandle(ref, () => ({
    scramble: runScramble,
    reset: () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      if (displayRef.current) {
        displayRef.current.textContent = text;
      }
    },
  }));

  const handleMouseEnter = () => {
    runScramble();
  };

  const handleMouseLeave = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (displayRef.current) {
      displayRef.current.textContent = text;
    }
  };

  return (
    <Tag
      className={fixedWidth ? `${styles.fixed} ${className}`.trim() : className}
      onMouseEnter={externalTrigger ? undefined : handleMouseEnter}
      onMouseLeave={externalTrigger ? undefined : handleMouseLeave}
    >
      {fixedWidth && (
        <span className={styles.sizer} aria-hidden="true">
          {text}
        </span>
      )}
      <span ref={displayRef} className={fixedWidth ? styles.overlay : undefined}>
        {text}
      </span>
    </Tag>
  );
});

export default ScrambleText;
