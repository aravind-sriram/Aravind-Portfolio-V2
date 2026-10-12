"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./CaseStudy.module.css";

/* Horizontal px moved per px scrolled. */
const SPEED = 0.5;
/* One copy can be a few px narrower than the bled-out row, so two alone could leave a sliver. */
const COPIES = 3;

/* Rows slide with the page scroll, alternating right and left, and wrap seamlessly. Screens load
   eagerly: they slide into view by transform inside a clipped row, which lazy loading can miss. */
export default function ScreenMarquee({ rows }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const scroller = root?.closest("main");
    if (!root || !scroller) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const tracks = [...root.querySelectorAll("[data-marquee-track]")];
    let copyWidths = [];
    let frame = 0;

    const update = () => {
      frame = 0;
      const travelled =
        Math.max(0, scroller.getBoundingClientRect().bottom - root.getBoundingClientRect().top) *
        SPEED;
      tracks.forEach((track, index) => {
        const copyWidth = copyWidths[index];
        if (!copyWidth) return;
        const shift = travelled % copyWidth;
        const x = track.dataset.direction === "right" ? shift - copyWidth : -shift;
        track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
      });
    };

    const measure = () => {
      copyWidths = tracks.map((track) => track.scrollWidth / COPIES);
      update();
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(root);
    scroller.addEventListener("scroll", onScroll, { passive: true });
    measure();

    return () => {
      observer.disconnect();
      scroller.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      tracks.forEach((track) => track.style.removeProperty("transform"));
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.marquee} data-reveal-group>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.revealMask}>
          <div data-reveal-rise={rowIndex}>
            <ul
              className={styles.marqueeTrack}
              data-marquee-track
              data-direction={rowIndex % 2 === 0 ? "right" : "left"}
            >
              {Array.from({ length: COPIES }, (_, copy) =>
                row.map((screen) => (
                  <li
                    key={`${copy}-${screen.name}`}
                    className={styles.marqueeItem}
                    aria-hidden={copy > 0 ? "true" : undefined}
                  >
                    <Image
                      className={styles.marqueeImage}
                      src={screen.src}
                      alt={copy > 0 ? "" : screen.name}
                      width={screen.width}
                      height={screen.height}
                      sizes="(max-width: 760px) 50vw, 25vw"
                      loading="eager"
                    />
                  </li>
                )),
              )}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
