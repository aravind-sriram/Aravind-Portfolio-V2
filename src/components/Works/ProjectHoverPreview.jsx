"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./WorksPanel.module.css";

export default function ProjectHoverPreview({ preview }) {
  const rootRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const card = rootRef.current?.parentElement;
    if (!video || !card) return undefined;

    const play = () => {
      video.play().catch(() => {});
    };
    const pause = () => video.pause();

    card.addEventListener("pointerenter", play);
    card.addEventListener("pointerleave", pause);
    return () => {
      card.removeEventListener("pointerenter", play);
      card.removeEventListener("pointerleave", pause);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.projectHover} aria-hidden="true">
      <div className={styles.projectHoverBand} />
      <div className={styles.projectHoverFrame}>
        <span className={styles.projectHoverCorners}>
          <span />
          <span />
          <span />
          <span />
        </span>
        <div className={styles.projectHoverScreen}>
          {preview.video ? (
            <video
              ref={videoRef}
              className={styles.projectHoverMedia}
              src={preview.video}
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <Image
              className={styles.projectHoverMedia}
              src={preview.image}
              alt=""
              fill
              sizes="30vw"
            />
          )}
        </div>
      </div>
    </div>
  );
}
