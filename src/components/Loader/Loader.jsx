"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./Loader.module.css";

const WORDS = ["YOUR", "NEXT", "DESIGNER"];
const SCROLL_KEYS = new Set([" ", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"]);

/* Plays once per full page load; client-side visits back to "/" skip it. */
let hasPlayed = false;

const pad = (value) => String(value).padStart(3, "0");

export default function Loader() {
  const [visible, setVisible] = useState(() => !hasPlayed);
  const rootRef = useRef(null);
  const countRef = useRef(null);

  useEffect(() => {
    if (!visible) return undefined;

    const root = rootRef.current;
    const blockScroll = (event) => event.preventDefault();
    const blockKeys = (event) => {
      if (SCROLL_KEYS.has(event.key)) event.preventDefault();
    };
    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });
    window.addEventListener("keydown", blockKeys);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const counter = { value: 1 };
    const tl = gsap.timeline({
      onComplete: () => {
        hasPlayed = true;
        setVisible(false);
      },
    });

    if (!reduceMotion) {
      tl.to(counter, {
        value: 100,
        duration: 1.8,
        delay: 0.4,
        ease: (progress) => progress ** 1.4,
        onUpdate: () => {
          countRef.current.textContent = pad(Math.round(counter.value));
        },
      }).to(
        root.querySelectorAll("[data-loader-rise]"),
        { yPercent: -100, duration: 0.5, ease: "expo.in" },
        "+=0.5"
      );
    }

    tl.to(root, { autoAlpha: 0, duration: 0.4, ease: "power1.out" }, reduceMotion ? 0 : "+=0.2");

    return () => {
      tl.kill();
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
      window.removeEventListener("keydown", blockKeys);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div ref={rootRef} className={styles.loader} aria-hidden="true">
      <span className={`${styles.mask} ${styles.count}`}>
        <span ref={countRef} data-loader-rise>
          {pad(1)}
        </span>
      </span>
      <div className={styles.words}>
        {WORDS.map((word) => (
          <span key={word} className={styles.mask}>
            <span data-loader-rise>{word}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
