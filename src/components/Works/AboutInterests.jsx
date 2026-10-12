"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import styles from "./WorksPanel.module.css";

const FOLLOW_EASE = 0.18;
const SNAP_AFTER_HIDDEN_MS = 300;

// Fired on the scroller in the same frame a JS-driven scroll moves it; native
// scroll events only arrive a frame later.
export const SCROLL_FRAME_EVENT = "works-scroll-frame";

const hasMedia = (interest) => Boolean(interest?.image || interest?.video);

export default function AboutInterests({ interests }) {
  const cursorRef = useRef(null);
  const stripRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const frame = useRef(0);
  const visibleRef = useRef(false);
  const hiddenAt = useRef(0);
  const activeRef = useRef(null);
  const pointer = useRef(null);
  const videos = useRef(new Map());
  const [mounted, setMounted] = useState(false);
  const withMedia = interests.filter(hasMedia);

  // Browsers only allow sound once the visitor has clicked or typed on the
  // page; until then the clip plays muted rather than not at all.
  const playWithSound = (video, title) => {
    video.muted = false;
    video.play().catch((error) => {
      if (error.name !== "NotAllowedError" || activeRef.current?.title !== title) return;
      video.muted = true;
      video.play().catch(() => {});
    });
  };

  const syncVideos = (active) => {
    videos.current.forEach((video, title) => {
      if (title === active?.title) {
        playWithSound(video, title);
      } else {
        video.pause();
      }
    });
  };

  useEffect(() => {
    setMounted(true);
    return () => cancelAnimationFrame(frame.current);
  }, []);

  const place = () => {
    const el = cursorRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
  };

  const tick = () => {
    pos.current.x += (target.current.x - pos.current.x) * FOLLOW_EASE;
    pos.current.y += (target.current.y - pos.current.y) * FOLLOW_EASE;
    place();
    frame.current = visibleRef.current ? requestAnimationFrame(tick) : 0;
  };

  const slideTo = (index, instant) => {
    const strip = stripRef.current;
    if (!strip) return;
    if (instant) strip.style.transition = "none";
    strip.style.transform = `translate3d(0, calc(${-index} * var(--interest-h)), 0)`;
    if (instant) {
      void strip.offsetHeight;
      strip.style.transition = "";
    }
  };

  const show = (interest, x, y) => {
    activeRef.current = interest;
    target.current = { x, y };
    const fresh =
      !visibleRef.current && performance.now() - hiddenAt.current > SNAP_AFTER_HIDDEN_MS;
    if (fresh) {
      pos.current = { ...target.current };
      place();
    }
    slideTo(withMedia.indexOf(interest), fresh);
    syncVideos(interest);
    visibleRef.current = true;
    cursorRef.current?.setAttribute("data-visible", "true");
    if (!frame.current) frame.current = requestAnimationFrame(tick);
  };

  const handleEnter = (interest) => (event) => {
    if (event.pointerType !== "mouse" || !hasMedia(interest)) return;
    show(interest, event.clientX, event.clientY);
  };

  const handleMove = (event) => {
    target.current = { x: event.clientX, y: event.clientY };
  };

  const handleLeave = () => {
    activeRef.current = null;
    if (!visibleRef.current) return;
    syncVideos(null);
    visibleRef.current = false;
    hiddenAt.current = performance.now();
    cursorRef.current?.removeAttribute("data-visible");
  };

  // Content scrolling under a still pointer fires no pointer events, so every
  // scroll frame re-checks which note is really under it.
  useEffect(() => {
    const onPointerMove = (event) => {
      if (event.pointerType === "mouse") pointer.current = { x: event.clientX, y: event.clientY };
    };
    const onScroll = () => {
      if (!pointer.current) return;
      const { x, y } = pointer.current;
      const note = document.elementFromPoint(x, y)?.closest("[data-interest]");
      const interest = interests.find((item) => item.title === note?.dataset.interest);
      if (hasMedia(interest)) {
        if (activeRef.current !== interest) show(interest, x, y);
      } else {
        handleLeave();
      }
    };
    const onPointerOut = (event) => {
      if (event.relatedTarget) return;
      pointer.current = null;
      handleLeave();
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", onPointerOut);
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    document.addEventListener(SCROLL_FRAME_EVENT, onScroll, { capture: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("scroll", onScroll, { capture: true });
      document.removeEventListener(SCROLL_FRAME_EVENT, onScroll, { capture: true });
    };
  });

  return (
    <>
      {interests.map((interest) => (
        <div
          key={interest.title}
          className={styles.aboutNote}
          data-reveal-group
          data-reveal-chain="about-lower"
          data-reveal-delay="0.05"
          data-reveal-pace="0.5"
          data-interest={interest.title}
          data-has-media={hasMedia(interest) ? "true" : undefined}
          data-cursor-hidden={hasMedia(interest) ? "true" : undefined}
          onPointerEnter={handleEnter(interest)}
          onPointerMove={hasMedia(interest) ? handleMove : undefined}
          onPointerLeave={handleLeave}
        >
          <h4 data-reveal-text="body">{interest.title}</h4>
          <p data-reveal-text="body">{interest.note}</p>
        </div>
      ))}
      {mounted &&
        createPortal(
          <div ref={cursorRef} className={styles.interestCursor} aria-hidden="true">
            <div ref={stripRef} className={styles.interestStrip}>
              {withMedia.map((interest) => (
                <div key={interest.title} className={styles.interestSlide}>
                  {interest.video ? (
                    <video
                      ref={(video) => {
                        if (video) videos.current.set(interest.title, video);
                        else videos.current.delete(interest.title);
                      }}
                      src={interest.video}
                      muted
                      loop
                      playsInline
                      preload="auto"
                      className={styles.interestCursorImage}
                    />
                  ) : (
                    <Image
                      src={interest.image}
                      alt=""
                      fill
                      sizes="160px"
                      loading="eager"
                      className={styles.interestCursorImage}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
