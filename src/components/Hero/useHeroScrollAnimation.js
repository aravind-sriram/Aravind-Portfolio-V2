"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const TITLE_LIFT_RATIO = 0.42;
/* The video ends as a small box sitting just above the title's "I". */
const FINAL_VIDEO_WIDTH = 26;
const FINAL_VIDEO_HEIGHT = 15;
const FINAL_VIDEO_GAP = 4;
/* Optical nudges so the box reads as sitting centred on the "I"'s stem. */
const FINAL_VIDEO_OFFSET_X = 7;
const FINAL_VIDEO_OFFSET_Y = 5;
/* The pointer-follow stays inside the Works curtain's box (Works.module.css):
   18px in from the sides and bottom, `--space-24` minus 5px from the top. */
const FRAME_INSET_X = 18;
const FRAME_INSET_BOTTOM = 18;
const FRAME_TOP_TRIM = 5;
/* Share of the remaining distance the video covers each frame as it trails the pointer. */
const FOLLOW_EASE = 0.15;
const NAV_FADE_OUT_END = 0.15;
const VIDEO_START_WIDTH = 1200;
const VIDEO_ASPECT = 16 / 9;
/* Taken off both sides of the fitted 16:9 starting box. */
const VIDEO_START_TRIM = 10;
const VIDEO_START_OFFSET_X = 19;
const VIDEO_ZONE_GAP = 12;

let reloadHandled = false;

/* A restored scroll position can land mid-intro before the pin has added its
   height, so a reload always starts from the top of the hero. Runs once per
   document, so client-side navigation back to the page keeps its own target. */
function startReloadAtTop() {
  if (reloadHandled) return;
  reloadHandled = true;
  const navigation = performance.getEntriesByType("navigation")[0];
  if (navigation?.type !== "reload") return;
  if (new URL(navigation.name).pathname !== window.location.pathname) return;
  ScrollTrigger.clearScrollMemory("manual");
  window.scrollTo(0, 0);
}

/* The curtain's horizontal extent in viewport coordinates. */
function getFrameBounds() {
  return {
    left: FRAME_INSET_X,
    right: document.documentElement.clientWidth - FRAME_INSET_X,
  };
}

function getBracketInsets() {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const insetX = parseFloat(styles.getPropertyValue("--bracket-inset-x")) || 12;
  const insetY = parseFloat(styles.getPropertyValue("--bracket-inset-y")) || 12;
  return { insetX, insetY };
}

function getVideoZone(navEl, titleEl) {
  const { insetX, insetY } = getBracketInsets();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const navRect = navEl.getBoundingClientRect();
  const titleRect = titleEl.getBoundingClientRect();

  const zoneLeft = insetX;
  const zoneRight = vw - insetX;
  const zoneTop = Math.max(insetY, navRect.bottom + VIDEO_ZONE_GAP);
  const zoneBottom = Math.min(vh - insetY, titleRect.top - VIDEO_ZONE_GAP);

  const zoneWidth = Math.max(0, zoneRight - zoneLeft);
  const zoneHeight = Math.max(0, zoneBottom - zoneTop);

  return {
    zoneLeft,
    zoneRight,
    zoneTop,
    zoneBottom,
    zoneWidth,
    zoneHeight,
    centerX: zoneLeft + zoneWidth / 2,
    centerY: zoneTop + zoneHeight / 2,
  };
}

/* 16:9 like the footage, as large as fits between the nav and the title's
   resting position (the title lifts as the intro plays, so its lift is added
   back to keep the starting box fixed). */
function getInitialVideoSize(zone, titleLift) {
  const width = Math.min(
    VIDEO_START_WIDTH,
    zone.zoneWidth,
    (zone.zoneHeight + titleLift) * VIDEO_ASPECT,
  );
  return {
    width: width - VIDEO_START_TRIM,
    height: width / VIDEO_ASPECT - VIDEO_START_TRIM,
  };
}

export default function useHeroScrollAnimation({
  scrollRef,
  stageRef,
  videoRef,
  titleRef,
  navRef,
}) {
  useLayoutEffect(() => {
    if (
      !scrollRef.current ||
      !stageRef.current ||
      !videoRef.current ||
      !titleRef.current ||
      !navRef.current
    ) {
      return undefined;
    }

    gsap.registerPlugin(ScrollTrigger);
    startReloadAtTop();

    const scrollEl = scrollRef.current;
    const stageEl = stageRef.current;
    const videoEl = videoRef.current;
    const titleEl = titleRef.current;
    const navEl = navRef.current;
    const letterEl = titleEl.querySelector("[data-hero-letter-i]");
    if (!letterEl) return undefined;

    /* The video slides toward the pointer's side, as far as the room between it
       and the curtain's edges allows, so it never leaves the bracket frame. The
       room fades out as it shrinks, so it lands on the "I" regardless. */
    const follow = { pointer: 0, current: 0, leftRoom: 0, rightRoom: 0, frame: 0 };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const stepFollow = () => {
      const room = follow.pointer < 0 ? follow.leftRoom : follow.rightRoom;
      const target = follow.pointer * room;
      follow.current += (target - follow.current) * FOLLOW_EASE;
      if (Math.abs(target - follow.current) < 0.1) follow.current = target;
      gsap.set(videoEl, { x: follow.current });
      follow.frame = follow.current === target ? 0 : requestAnimationFrame(stepFollow);
    };

    const startFollow = () => {
      if (!follow.frame) follow.frame = requestAnimationFrame(stepFollow);
    };

    const onPointerMove = (event) => {
      if (event.pointerType !== "mouse" || reducedMotion.matches) return;
      follow.pointer = gsap.utils.clamp(-1, 1, (event.clientX / window.innerWidth - 0.5) * 2);
      startFollow();
    };

    const applyFrame = (progress) => {
      const titleLift = window.innerHeight * TITLE_LIFT_RATIO;
      const appliedLift = titleLift * progress;
      gsap.set(titleEl, { y: -appliedLift });

      const navOpacity = gsap.utils.clamp(
        0,
        1,
        gsap.utils.mapRange(0, NAV_FADE_OUT_END, 1, 0, progress),
      );
      gsap.set(navEl, {
        opacity: navOpacity,
        pointerEvents: navOpacity > 0 ? "auto" : "none",
      });

      const zone = getVideoZone(navEl, titleEl);
      const initial = getInitialVideoSize(zone, appliedLift);
      const frame = getFrameBounds();

      // The pinned stage is the video's containing block, so its offset comes off.
      const stageRect = stageEl.getBoundingClientRect();
      const letterRect = letterEl.getBoundingClientRect();

      const startCenterX = zone.centerX - VIDEO_START_OFFSET_X;
      const startCenterY =
        zone.zoneTop + (zone.zoneHeight + appliedLift) / 2 - stageRect.top;
      const endCenterX =
        letterRect.left + letterRect.width / 2 - FINAL_VIDEO_OFFSET_X - stageRect.left;
      // Aim at where the "I" ends up once the title has finished lifting. Chasing
      // its current spot makes the video sag into the title mid-way.
      const finalLetterTop = letterRect.top - (titleLift - appliedLift);
      const endCenterY =
        finalLetterTop -
        FINAL_VIDEO_GAP -
        FINAL_VIDEO_HEIGHT / 2 +
        FINAL_VIDEO_OFFSET_Y -
        stageRect.top;

      const left = gsap.utils.interpolate(startCenterX, endCenterX, progress);
      const width = gsap.utils.interpolate(initial.width, FINAL_VIDEO_WIDTH, progress);

      gsap.set(videoEl, {
        left,
        top: gsap.utils.interpolate(startCenterY, endCenterY, progress),
        width,
        height: gsap.utils.interpolate(initial.height, FINAL_VIDEO_HEIGHT, progress),
        xPercent: -50,
        yPercent: -50,
      });

      const centerX = left + stageRect.left;
      const followShare = (1 - progress) ** 2;
      follow.leftRoom = Math.max(0, centerX - width / 2 - frame.left) * followShare;
      follow.rightRoom = Math.max(0, frame.right - (centerX + width / 2)) * followShare;
      startFollow();
    };

    const ctx = gsap.context(() => {
      gsap.set(navEl, { opacity: 1, pointerEvents: "auto" });

      gsap.set(videoEl, {
        position: "fixed",
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        zIndex: 20,
      });

      ScrollTrigger.create({
        trigger: scrollEl,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.85,
        pin: stageEl,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyFrame(self.progress),
        onRefresh: (self) => applyFrame(self.progress),
      });

      applyFrame(0);
    }, scrollEl);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(follow.frame);
      ctx.revert();
    };
  }, [scrollRef, stageRef, videoRef, titleRef, navRef]);
}
