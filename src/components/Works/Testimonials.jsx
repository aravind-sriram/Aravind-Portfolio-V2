"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./WorksPanel.module.css";

// Enough slots that a hidden card is always waiting off each side, so the
// carousel never has to jump a card across the middle when it wraps.
const MIN_SLOTS = 5;
const AUTO_ADVANCE_MS = 7000;

function Corners({ className }) {
  return (
    <span className={className} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export default function Testimonials({ items }) {
  const [active, setActive] = useState(0);
  const repeats = Math.max(1, Math.ceil(MIN_SLOTS / items.length));
  const slots = Array.from(
    { length: items.length * repeats },
    (_, index) => items[index % items.length],
  );
  const count = slots.length;

  useEffect(() => {
    const timer = window.setTimeout(
      () => setActive((current) => (current + 1) % count),
      AUTO_ADVANCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [active, count]);

  const offsetOf = (index) => {
    let offset = (index - active) % count;
    if (offset > count / 2) offset -= count;
    if (offset < -count / 2) offset += count;
    return offset;
  };

  return (
    <div className={styles.testimonialStage} data-reveal-group data-reveal-trigger="self">
      {slots.map((item, index) => {
        const offset = offsetOf(index);
        const position = offset === 0 ? "center" : Math.abs(offset) === 1 ? "side" : "hidden";
        return (
          <div
            key={index}
            className={styles.testimonialSlot}
            data-position={position}
            style={{ "--offset": offset }}
            aria-hidden={position === "center" ? undefined : "true"}
            onClick={position === "side" ? () => setActive(index) : undefined}
          >
            <Corners className={styles.testimonialFrame} />
            <div className={styles.testimonialMask}>
              <article
                className={styles.testimonialCard}
                data-reveal-rise={offset === 0 ? "0" : "1"}
              >
                <div className={styles.testimonialPerson}>
                  <div className={styles.testimonialAvatar}>
                    <Corners className={styles.testimonialAvatarCorners} />
                    <div className={styles.testimonialAvatarFill}>
                      {item.avatar ? (
                        <Image src={item.avatar} alt="" fill sizes="40px" />
                      ) : null}
                    </div>
                  </div>
                  <p className={styles.testimonialName}>
                    {item.name}
                    <br />[{item.role}]
                  </p>
                </div>
                <p className={styles.testimonialQuote}>{item.quote}</p>
              </article>
            </div>
          </div>
        );
      })}
    </div>
  );
}
