"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const STACK_SCALE_MAX = 1.08;
const GRID_ROW_GAP = 20;
const GRID_COLUMN_GAP = 22;
const DEAL_DURATION = 0.08;
const DEAL_STAGGER = 0.025;
const META_FADE_DELAY = 0.28;
const META_FADE_DURATION = 0.3;
const DESKTOP_MIN_WIDTH = 961;
const GRID_OFFSET_X = -305;
const GRID_CELL_HEIGHT_EXTRA = 104;
const GRID_CELL_HEIGHT_TRIM = 41;
const GRID_META_WHITE_TRIM = 41;
const GRID_META_MIN_HEIGHT = 72;
const GRID_CELL_WIDTH_EXTRA = 10;
/** Widens dealt cards only; height, gaps and the left edge stay put. */
const GRID_CARD_WIDTH_EXTRA = 12;
/** Horizontal breathing room inside `.main` (shadows + overflow-x clip). */
const GRID_WIDTH_INSET = 64 - GRID_CELL_WIDTH_EXTRA * 2;
const SCRUB_MIN_PX = 960;
const SCRUB_VIEWPORT_MULT = 1.75;
const STAGE_DESCEND_Y_MAX = 800;
/** Fallback vertical travel vs horizontal shift when layout measure fails. */
const STAGE_DESCEND_DIAGONAL_RATIO = 0.34;
/** Stack reaches main viewport center (below sticky header) by this scroll fraction. */
const PHASE_OVERLAP_CENTER = 0.3;
/** Title gone, paragraph visible (position 4). */
const PHASE_POSITION_4 = 0.45;
const PHASE_BODY_EXIT_START = 0.48;
const PHASE_BODY_EXIT_END = 0.62;
/**
 * Deal starts at the timeline time that matches the stack reaching center.
 * Center is a scroll fraction; the timeline is shorter than 1, so time 0.3
 * used to land ~15% of the scroll later.
 */
const PHASE_DEAL_START = PHASE_OVERLAP_CENTER * PHASE_BODY_EXIT_END;
const DEAL_TIME_SPAN = PHASE_POSITION_4 - PHASE_OVERLAP_CENTER;
const PHASE_DEAL_END = PHASE_DEAL_START + DEAL_TIME_SPAN;
const MAIN_PADDING_BOTTOM_MIN = 24;
/** Space between the bottom project cards and the design-arsenal heading. */
const ARSENAL_AFTER_GRID_GAP = 272;
const FRAME_PHASE_MIN_PX = 180;
const FRAME_PHASE_VIEWPORT_MULT = 0.22;
const HERO_TITLE_RISE_Y = -72;
const HERO_BODY_RISE_Y = -36;
/** Slide body off-screen while fading (never shrink width — avoids clip on scrub reverse). */
const HERO_BODY_SLIDE_X = -420;
/** Compressed meta fade so grid meta reads by position 4. */
const META_FADE_DELAY_SCRUB = 0.06;
const META_FADE_DURATION_SCRUB = 0.12;
const STACK_STAGE_SCRUB_Z_INDEX = 4;
/** Resting stack offset (matches `.stackStage` margin-right in CSS). */
const REST_STACK_MARGIN_RIGHT = -10;

function getRotationDeg(el) {
  const transform = getComputedStyle(el).transform;
  if (!transform || transform === "none") {
    return 0;
  }
  const matrix = transform.match(/^matrix\((.+)\)$/);
  if (matrix) {
    const parts = matrix[1].split(",").map(Number.parseFloat);
    return (Math.atan2(parts[1], parts[0]) * 180) / Math.PI;
  }
  return 0;
}

function measureStackRects(cards) {
  return cards.map((card) => ({
    x: card.offsetLeft,
    y: card.offsetTop,
    width: card.offsetWidth,
    height: card.offsetHeight,
    rotation: getRotationDeg(card),
  }));
}

function getGridRects(containerWidth, maxGridHeight) {
  const availableWidth = Math.max(240, containerWidth - GRID_WIDTH_INSET);
  let cellW = (availableWidth - GRID_COLUMN_GAP) / 2 + GRID_CELL_WIDTH_EXTRA;
  let cellH = cellW * 0.72 + GRID_CELL_HEIGHT_EXTRA;
  let totalHeight = cellH * 2 + GRID_ROW_GAP;

  if (maxGridHeight > 0 && totalHeight > maxGridHeight) {
    const scale = maxGridHeight / totalHeight;
    cellW *= scale;
    cellH *= scale;
    totalHeight = cellH * 2 + GRID_ROW_GAP;
  }

  cellW += GRID_CARD_WIDTH_EXTRA;
  const offsetX = 0;

  return [
    { x: offsetX, y: 0, width: cellW, height: cellH },
    {
      x: offsetX + cellW + GRID_COLUMN_GAP,
      y: 0,
      width: cellW,
      height: cellH,
    },
    { x: offsetX, y: cellH + GRID_ROW_GAP, width: cellW, height: cellH },
    {
      x: offsetX + cellW + GRID_COLUMN_GAP,
      y: cellH + GRID_ROW_GAP,
      width: cellW,
      height: cellH,
    },
  ];
}

function getGridHeight(gridRects) {
  const bottomRow = gridRects[2];
  return bottomRow.y + bottomRow.height;
}

function getGridWidth(gridRects) {
  const topRight = gridRects[1];
  return topRight.x + topRight.width;
}

function gridMetaHeight(cellHeight) {
  return Math.max(
    GRID_META_MIN_HEIGHT,
    cellHeight * 0.3 +
      GRID_CELL_HEIGHT_TRIM * 0.3 -
      GRID_META_WHITE_TRIM,
  );
}

function getMainHeader(main) {
  return main.querySelector("header");
}

function getFramePhaseScrollDistance(main) {
  return Math.round(
    Math.max(main.clientHeight * FRAME_PHASE_VIEWPORT_MULT, FRAME_PHASE_MIN_PX),
  );
}

function getTotalScrollSpan(main) {
  return getAnimationScrubDistance(main) + getFramePhaseScrollDistance(main);
}

/** Scroll distance that reaches the body-exit time at the same rate as the full span. */
function getAnimationEndScrollDistance(main, timelineDuration) {
  const fullSpan = getTotalScrollSpan(main);
  if (timelineDuration <= 0) {
    return fullSpan;
  }
  const endTime = Math.min(PHASE_BODY_EXIT_END, timelineDuration);
  return Math.round((endTime / timelineDuration) * fullSpan);
}

function getAnimationScrubDistance(main) {
  return Math.round(
    Math.max(main.clientHeight * SCRUB_VIEWPORT_MULT, SCRUB_MIN_PX),
  );
}

function getHeroRowStartScroll(main, heroRow) {
  const mainTop = main.getBoundingClientRect().top;
  const heroTop = heroRow.getBoundingClientRect().top;
  return Math.max(0, Math.round(main.scrollTop + (heroTop - mainTop)));
}

function getScrollTriggerStart(main) {
  const header = getMainHeader(main);
  const headerHeight = header?.getBoundingClientRect().height ?? 0;
  return `top top+=${Math.round(headerHeight)}`;
}

function ensureScrubSpacer(main, heroRow, scrollSpan) {
  let spacer = main.querySelector("[data-grid-scroll-spacer]");
  if (!spacer) {
    spacer = document.createElement("div");
    spacer.setAttribute("data-grid-scroll-spacer", "");
    spacer.setAttribute("aria-hidden", "true");
    spacer.style.flexShrink = "0";
    spacer.style.width = "100%";
    spacer.style.pointerEvents = "none";
    main.appendChild(spacer);
  }
  spacer.style.display = "none";
  const needed = getHeroRowStartScroll(main, heroRow) + scrollSpan;
  const available = main.scrollHeight - main.clientHeight;
  const shortfall = Math.max(0, Math.ceil(needed - available));
  if (shortfall > 0) {
    spacer.style.display = "";
    spacer.style.height = `${shortfall}px`;
  }
}

function removeScrubSpacer(main) {
  main.querySelector("[data-grid-scroll-spacer]")?.remove();
}

/**
 * Pull the arsenal section up so it sits just under the formed grid.
 * The hero row is stretched so the cards can stick; without this the
 * heading would land in that empty stretch instead of after cards 3 and 4.
 * After the deal, both the grid and this section scroll 1:1.
 */
function placeDesignArsenal({
  main,
  stage,
  topRowCenterY,
  gridHeight,
  animationPx,
  restTop,
}) {
  const arsenal = main.querySelector("[data-design-arsenal]");
  if (!arsenal) {
    return;
  }

  arsenal.style.marginTop = "0px";

  const header = getMainHeader(main);
  const headerHeight = header?.getBoundingClientRect().height ?? 0;
  const mainTop = main.getBoundingClientRect().top;
  const heroTop = stage.parentElement?.getBoundingClientRect().top ?? mainTop;
  const startScroll = heroTop - mainTop - headerHeight;
  const delta = startScroll + animationPx;
  const arsenalTop = arsenal.getBoundingClientRect().top;
  const gridBottomAtEnd = restTop + topRowCenterY + gridHeight;
  const marginTop = Math.round(
    gridBottomAtEnd + ARSENAL_AFTER_GRID_GAP + delta - arsenalTop,
  );
  arsenal.style.marginTop = `${marginTop}px`;
}

function clearDesignArsenalPlacement(main) {
  const arsenal = main.querySelector("[data-design-arsenal]");
  if (arsenal) {
    arsenal.style.marginTop = "";
  }
}

function clampOverlapY(y, main) {
  const maxY = Math.min(
    STAGE_DESCEND_Y_MAX,
    Math.max(120, Math.round(main.clientHeight * 0.85)),
  );
  return Math.round(Math.max(0, Math.min(maxY, y)));
}

function visibleMainCenterY(main) {
  const mainRect = main.getBoundingClientRect();
  const header = getMainHeader(main);
  const headerHeight = header?.getBoundingClientRect().height ?? 0;
  return mainRect.top + headerHeight + (main.clientHeight - headerHeight) / 2;
}

function poseYForScroll(scrollFraction, overlapY, topRowCenterY, endScrollFraction) {
  const settleSpan = Math.max(0.001, endScrollFraction - PHASE_OVERLAP_CENTER);
  const t = Math.min(
    1,
    Math.max(0, (scrollFraction - PHASE_OVERLAP_CENTER) / settleSpan),
  );
  return overlapY + (topRowCenterY - overlapY) * t;
}

/**
 * Descend with a transform until the stack is centered. After that the stage
 * sticks inside the scroller, so scroll and a late transform can't tug it
 * in opposite directions.
 */
function applyScrollCompensatedOverlap(
  stage,
  main,
  scrollFraction,
  overlapX,
  overlapY,
  overlapScrollStart,
  topRowCenterY,
  endScrollFraction,
  restTop,
  holdState,
) {
  if (scrollFraction < PHASE_OVERLAP_CENTER) {
    if (holdState.on) {
      gsap.set(stage, {
        position: "relative",
        clearProps: "top,marginTop",
      });
      holdState.on = false;
    }
    const scrollDs = main.scrollTop - overlapScrollStart;
    const p = Math.min(1, scrollFraction / PHASE_OVERLAP_CENTER);
    gsap.set(stage, {
      x: overlapX * p,
      y: overlapY * p + scrollDs,
    });
    return;
  }

  const poseY = poseYForScroll(
    scrollFraction,
    overlapY,
    topRowCenterY,
    endScrollFraction,
  );
  const top = restTop + poseY - main.getBoundingClientRect().top;
  if (!holdState.on) {
    gsap.set(stage, { position: "sticky", marginTop: 0, y: 0 });
    holdState.on = true;
  }
  gsap.set(stage, { position: "sticky", marginTop: 0, top });
}

function releaseStickyHold(stage, holdState) {
  if (!holdState.on) {
    return;
  }
  const before = stage.getBoundingClientRect();
  gsap.set(stage, { position: "relative", clearProps: "top,marginTop" });
  const after = stage.getBoundingClientRect();
  gsap.set(stage, {
    x: (Number(gsap.getProperty(stage, "x")) || 0) + (before.left - after.left),
    y: (Number(gsap.getProperty(stage, "y")) || 0) + (before.top - after.top),
  });
  const root = stage.querySelector("[data-stack-root]");
  if (root) {
    gsap.set(stage, { height: root.offsetHeight, minHeight: 0, overflow: "visible" });
  }
  holdState.on = false;
}

/** Stage x/y so [data-stack-root] sits at main viewport center below sticky header. */
function measureStageOverlapShift({ root, main }) {
  const mainRect = main.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  if (rootRect.width < 20 || mainRect.width < 20) {
    return { x: 0, y: 0 };
  }

  const mainCenterX = mainRect.left + main.clientWidth / 2;
  const rootCenterX = rootRect.left + rootRect.width / 2;
  const x = Math.round(mainCenterX - rootCenterX);

  const header = getMainHeader(main);
  const headerHeight = header?.getBoundingClientRect().height ?? 0;
  const visibleMidY =
    mainRect.top + headerHeight + (main.clientHeight - headerHeight) / 2;
  const rootCenterY = rootRect.top + rootRect.height / 2;
  let y = clampOverlapY(visibleMidY - rootCenterY, main);

  if (y === 0 && x !== 0) {
    y = clampOverlapY(Math.abs(x) * STAGE_DESCEND_DIAGONAL_RATIO, main);
  }

  return { x, y };
}

/** Stage x after grid deal so the grid's left edge aligns with `.main` inset (not centered/right). */
function measureGridDealEndStageX({
  stage,
  root,
  main,
  gridWidth,
  gridHeight,
  stackWidth,
  stackHeight,
}) {
  gsap.set(stage, {
    x: 0,
    flex: "0 1 auto",
    maxWidth: gridWidth,
    width: gridWidth,
    height: gridHeight,
    marginLeft: 0,
    marginRight: "auto",
  });
  gsap.set(root, { width: gridWidth, height: gridHeight, scale: 1 });

  const mainRect = main.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  const targetRootLeft = mainRect.left + GRID_WIDTH_INSET / 2;
  const x = Math.round(targetRootLeft - rootRect.left);

  resetStageRestLayout(stage);
  gsap.set(stage, {
    clearProps: "flex,width,maxWidth,height,marginLeft,marginRight",
  });
  gsap.set(root, { width: stackWidth, height: stackHeight, scale: 1 });

  return x + GRID_OFFSET_X;
}

/** Stage y that centers cards 1–2, plus the extra scroll that brings cards 3–4 into view. */
function measureTopRowSettle({
  stage,
  root,
  main,
  cards,
  gridRects,
  gridWidth,
  gridHeight,
  stackWidth,
  stackHeight,
  fallbackY,
}) {
  gsap.set(stage, {
    x: 0,
    y: 0,
    flex: "0 1 auto",
    maxWidth: gridWidth,
    width: gridWidth,
    height: gridHeight,
    marginLeft: 0,
    marginRight: "auto",
  });
  gsap.set(root, { width: gridWidth, height: gridHeight, scale: 1 });
  cards.forEach((card, index) => {
    const to = gridRects[index];
    gsap.set(card, {
      position: "absolute",
      left: to.x,
      top: to.y,
      width: to.width,
      height: to.height,
      rotation: 0,
      scale: 1,
    });
  });

  const topRow = cards.slice(0, 2).map((card) => card.getBoundingClientRect());
  const topRowReady = topRow.every((rect) => rect.height > 20);
  let topRowCenterY = fallbackY;
  let tailPx = Math.round(main.clientHeight * 0.45);

  if (topRowReady) {
    const rowCenter =
      topRow.reduce((sum, rect) => sum + rect.top + rect.height / 2, 0) /
      topRow.length;
    topRowCenterY = Math.round(visibleMainCenterY(main) - rowCenter);

    gsap.set(stage, { y: topRowCenterY });
    const bottom = Math.max(
      ...cards.slice(2).map((card) => card.getBoundingClientRect().bottom),
    );
    const mainRect = main.getBoundingClientRect();
    const visibleBottom =
      mainRect.top + main.clientHeight - MAIN_PADDING_BOTTOM_MIN;
    tailPx = Math.max(0, Math.round(bottom - visibleBottom));
  }

  cards.forEach((card) => {
    gsap.set(card, {
      clearProps:
        "left,top,width,height,rotation,scale,transform,zIndex,position",
    });
  });
  resetStageRestLayout(stage);
  gsap.set(stage, {
    clearProps: "flex,width,maxWidth,height,marginLeft,marginRight",
  });
  gsap.set(root, { width: stackWidth, height: stackHeight, scale: 1 });
  resetStageAtRest(stage);

  return { topRowCenterY, tailPx };
}

/** Pixel shift of the stage's left edge when the deal locks left-aligned margins. */
function measureDealAnchorShift(stage) {
  const before = stage.getBoundingClientRect().left;
  gsap.set(stage, {
    marginLeft: 0,
    marginRight: "auto",
    flex: "0 1 auto",
  });
  const after = stage.getBoundingClientRect().left;
  resetStageAtRest(stage);
  return Math.round(before - after);
}

function resetStageRestLayout(stage) {
  gsap.set(stage, {
    x: 0,
    y: 0,
    zIndex: "auto",
    clearProps: "x,y,zIndex,transform",
  });
}

function resetStageAtRest(stage) {
  gsap.set(stage, {
    x: 0,
    y: 0,
    position: "relative",
    flex: "0 0 auto",
    marginLeft: "auto",
    marginRight: REST_STACK_MARGIN_RIGHT,
    zIndex: STACK_STAGE_SCRUB_Z_INDEX,
    clearProps: "transform,x,y,width,maxWidth,height,minHeight,top,marginTop",
  });
}

function resetHeroCopyLayout(heroCopy, heroRow, heroTitle, heroBody) {
  gsap.set(heroCopy, {
    opacity: 1,
    marginLeft: 0,
    flex: "1 1 280px",
    maxWidth: 360,
    width: "auto",
    minWidth: 0,
    overflow: "visible",
    pointerEvents: "auto",
    clearProps: "transform,x,y,flexShrink",
  });
  if (heroTitle) {
    gsap.set(heroTitle, {
      opacity: 1,
      y: 0,
      clearProps: "transform,opacity",
    });
  }
  if (heroBody) {
    gsap.set(heroBody, {
      opacity: 1,
      y: 0,
      marginLeft: 0,
      overflow: "visible",
      pointerEvents: "auto",
      clearProps: "transform,opacity,marginLeft",
    });
  }
  gsap.set(heroRow, {
    justifyContent: "space-between",
    y: 0,
    clearProps: "transform",
  });
}

function buildTimeline({
  stage,
  root,
  main,
  heroCopy,
  heroTitle,
  heroBody,
  heroRow,
  cards,
  metas,
  stackRects,
}) {
  const mainWidth = main.clientWidth;
  const gridRects = getGridRects(mainWidth, 0);
  const gridWidth = getGridWidth(gridRects);
  const gridHeight = getGridHeight(gridRects);
  const stackHeight = root.getBoundingClientRect().height;
  const stackWidth = root.getBoundingClientRect().width;
  const bodyExitDuration = PHASE_BODY_EXIT_END - PHASE_BODY_EXIT_START;

  gsap.set(heroRow, { flexWrap: "nowrap", y: 0 });
  gsap.set(metas, { opacity: 0 });
  resetStageRestLayout(stage);
  resetHeroCopyLayout(heroCopy, heroRow, heroTitle, heroBody);

  const { x: overlapX, y: overlapY } = measureStageOverlapShift({ root, main });
  const gridDealEndX = measureGridDealEndStageX({
    stage,
    root,
    main,
    gridWidth,
    gridHeight,
    stackWidth,
    stackHeight,
  });
  resetStageAtRest(stage);
  const { topRowCenterY, tailPx } = measureTopRowSettle({
    stage,
    root,
    main,
    cards,
    gridRects,
    gridWidth,
    gridHeight,
    stackWidth,
    stackHeight,
    fallbackY: overlapY,
  });

  const tl = gsap.timeline({ defaults: { ease: "none" }, paused: true });

  const scalePeak = PHASE_DEAL_START * 0.65;
  tl.fromTo(
    root,
    { scale: 1 },
    {
      scale: STACK_SCALE_MAX,
      duration: scalePeak,
      immediateRender: false,
    },
    0,
  );
  tl.fromTo(
    root,
    { scale: STACK_SCALE_MAX },
    {
      scale: 1,
      duration: PHASE_DEAL_START - scalePeak,
      immediateRender: false,
    },
    scalePeak,
  );

  if (heroTitle) {
    tl.fromTo(
      heroTitle,
      { y: 0, opacity: 1 },
      {
        y: HERO_TITLE_RISE_Y,
        opacity: 0,
        duration: PHASE_POSITION_4,
        ease: "power1.in",
        immediateRender: false,
      },
      0,
    );
  }

  if (heroBody) {
    tl.fromTo(
      heroBody,
      { y: 0, opacity: 1, marginLeft: 0 },
      {
        y: HERO_BODY_RISE_Y,
        opacity: 1,
        duration: PHASE_POSITION_4,
        immediateRender: false,
      },
      0,
    );

    tl.fromTo(
      heroBody,
      {
        y: HERO_BODY_RISE_Y,
        opacity: 1,
        marginLeft: 0,
        pointerEvents: "auto",
      },
      {
        y: HERO_BODY_RISE_Y,
        opacity: 0,
        marginLeft: HERO_BODY_SLIDE_X,
        pointerEvents: "none",
        duration: bodyExitDuration,
        ease: "power1.in",
        immediateRender: false,
      },
      PHASE_BODY_EXIT_START,
    );
  }

  const dealSpan = PHASE_DEAL_END - PHASE_DEAL_START;
  const xAtDealStart = overlapX + measureDealAnchorShift(stage);

  tl.set(
    heroCopy,
    {
      flexShrink: 0,
      minWidth: 280,
    },
    PHASE_DEAL_START,
  );

  tl.set(
    stage,
    {
      marginLeft: 0,
      marginRight: "auto",
      flex: "0 1 auto",
    },
    PHASE_DEAL_START,
  );

  tl.fromTo(
    stage,
    { x: xAtDealStart, y: 0 },
    {
      x: gridDealEndX,
      y: 0,
      duration: dealSpan,
      immediateRender: false,
    },
    PHASE_DEAL_START,
  );

  tl.set(
    stage,
    {
      maxWidth: gridWidth,
      width: gridWidth,
      height: stackHeight,
      minHeight: 0,
      overflow: "visible",
    },
    PHASE_DEAL_START,
  );

  tl.set(
    stage,
    {
      height: gridHeight,
    },
    PHASE_BODY_EXIT_END,
  );

  tl.fromTo(
    root,
    {
      width: stackWidth,
      height: stackHeight,
      aspectRatio: "auto",
    },
    {
      width: gridWidth,
      height: gridHeight,
      aspectRatio: "auto",
      duration: 0.001,
      immediateRender: false,
    },
    PHASE_DEAL_START,
  );

  cards.forEach((card, index) => {
    const start = PHASE_DEAL_START + index * DEAL_STAGGER;
    const from = stackRects[index];
    const to = gridRects[index];
    const meta = metas[index];
    const fromScaleX = from.width / to.width;
    const fromScaleY = from.height / to.height;
    const fromCenterX = from.x + from.width / 2;
    const fromCenterY = from.y + from.height / 2;

    if (start > PHASE_DEAL_START) {
      tl.set(
        card,
        {
          position: "absolute",
          left: from.x,
          top: from.y,
          width: from.width,
          height: from.height,
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          rotation: from.rotation,
          transformOrigin: "50% 50%",
          zIndex: index + 1,
        },
        PHASE_DEAL_START,
      );
    }

    tl.set(
      card,
      {
        position: "absolute",
        left: to.x,
        top: to.y,
        width: to.width,
        height: to.height,
        transformOrigin: "50% 50%",
        zIndex: index + 1,
      },
      start,
    );

    tl.fromTo(
      card,
      {
        x: fromCenterX - (to.x + to.width / 2),
        y: fromCenterY - (to.y + to.height / 2),
        scaleX: fromScaleX,
        scaleY: fromScaleY,
        rotation: from.rotation,
      },
      {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        duration: DEAL_DURATION,
        immediateRender: false,
      },
      start,
    );

    if (meta) {
      const metaHeight = gridMetaHeight(to.height);
      tl.set(meta, { height: metaHeight }, start);
      tl.set(card, { "--meta-height": `${metaHeight}px` }, start);

      tl.fromTo(
        meta,
        { opacity: 0 },
        {
          opacity: 1,
          duration: META_FADE_DURATION_SCRUB,
          ease: "power2.out",
          immediateRender: false,
        },
        start + DEAL_DURATION + META_FADE_DELAY_SCRUB,
      );
    }
  });

  const landedAt = cards.map(
    (_, index) => PHASE_DEAL_START + index * DEAL_STAGGER + DEAL_DURATION,
  );

  return { tl, gridHeight, overlapX, overlapY, topRowCenterY, tailPx, landedAt };
}

export default function useWorksProjectGridScroll({ sectionRef }) {
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return undefined;
    }

    const media = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`);
    if (!media.matches) {
      return undefined;
    }

    gsap.registerPlugin(ScrollTrigger);

    const stage = section.querySelector("[data-stack-stage]");
    const root = section.querySelector("[data-stack-root]");
    const main = section.querySelector("[data-works-main]");
    const heroCopy = section.querySelector("[data-hero-copy]");
    const heroTitle = heroCopy?.querySelector("h2");
    const heroBody = heroCopy?.querySelector('[data-reveal-context="body"]');
    const heroRow = heroCopy?.closest("[class*='heroRow']");
    const cards = [...section.querySelectorAll("[data-project-card]")];

    if (
      !stage ||
      !root ||
      !main ||
      !heroCopy ||
      !heroTitle ||
      !heroBody ||
      !heroRow ||
      cards.length !== 4
    ) {
      return undefined;
    }

    const metas = cards.map((card) => card.querySelector("[data-project-meta]"));
    /* Cards only link to their case studies once they've been dealt into the grid. */
    const cardLinks = cards.map((card) => card.firstElementChild);
    const setCardLinksLive = (live) => {
      cardLinks.forEach((link) => link?.toggleAttribute("inert", !live));
    };
    const syncCardLinks = (time, landedAt) => {
      cardLinks.forEach((link, index) =>
        link?.toggleAttribute("inert", time < landedAt[index]),
      );
    };
    setCardLinksLive(false);

    const ctx = gsap.context(() => {
      let timeline = null;
      let scrollTrigger = null;

      const clearAnimationInlineStyles = () => {
        gsap.set(metas, { opacity: 0, clearProps: "height" });
        resetHeroCopyLayout(heroCopy, heroRow, heroTitle, heroBody);
        gsap.set(heroRow, { clearProps: "flexWrap,minHeight" });
        gsap.set(stage, {
          clearProps:
            "flex,width,maxWidth,marginLeft,marginRight,height,minHeight,overflow,x,y,zIndex,transform,position,top,marginTop",
        });
        gsap.set(root, {
          clearProps: "width,height,scale,aspectRatio,transform",
        });
        cards.forEach((card) => {
          gsap.set(card, {
            clearProps:
              "left,top,width,height,rotation,scale,transform,zIndex,position",
          });
          card.style.removeProperty("--meta-height");
        });
        resetStageAtRest(stage);
      };

      const clearCardInlineStyles = () => {
        gsap.set(metas, { opacity: 0, clearProps: "height" });
        cards.forEach((card) => {
          gsap.set(card, {
            clearProps:
              "left,top,width,height,rotation,scale,transform,zIndex,position",
          });
          card.style.removeProperty("--meta-height");
        });
      };

      const restorePreDealSizing = () => {
        gsap.set(root, { clearProps: "width,height,maxWidth,aspectRatio" });
        gsap.set(stage, {
          clearProps: "width,maxWidth,height,minHeight,overflow",
        });
        clearCardInlineStyles();
      };

      const reserveMainScrollRoom = (scrollSpan) => {
        ensureScrubSpacer(main, heroRow, scrollSpan);
      };

      const holdState = { on: false };

      const destroyScrub = () => {
        scrollTrigger?.kill();
        scrollTrigger = null;
        timeline?.kill();
        timeline = null;
        clearAnimationInlineStyles();
        removeScrubSpacer(main);
        clearDesignArsenalPlacement(main);
        gsap.set(main, { clearProps: "paddingBottom" });
      };

      const tryBuildScrub = () => {
        if (scrollTrigger) {
          return true;
        }

        const stackRects = measureStackRects(cards);
        const ready = stackRects.every(
          (rect) => rect.width > 20 && rect.height > 20,
        );
        if (!ready) {
          return false;
        }

        const overlapScrollStart = main.scrollTop;
        const built = buildTimeline({
          stage,
          root,
          main,
          heroCopy,
          heroTitle,
          heroBody,
          heroRow,
          cards,
          metas,
          stackRects,
        });
        timeline = built.tl;
        timeline.pause(0);
        const overlapX = built.overlapX;
        const overlapY = built.overlapY;
        const topRowCenterY = built.topRowCenterY;
        const fullSpan = getTotalScrollSpan(main);
        const timelineDuration = timeline.duration();
        const endTime = Math.min(PHASE_BODY_EXIT_END, timelineDuration);
        const animationPx = getAnimationEndScrollDistance(main, timelineDuration);
        const endScrollFraction = fullSpan > 0 ? animationPx / fullSpan : 1;
        const rowBefore = heroRow.offsetHeight;
        const holdMinHeight = rowBefore + animationPx + main.clientHeight;
        reserveMainScrollRoom(animationPx + built.tailPx);
        resetStageAtRest(stage);
        const restTop = stage.getBoundingClientRect().top;
        const applyHoldRoom = () => {
          heroRow.style.minHeight = `${holdMinHeight}px`;
        };

        scrollTrigger = ScrollTrigger.create({
          trigger: heroRow,
          scroller: main,
          start: () => getScrollTriggerStart(main),
          end: () => `+=${animationPx}`,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            syncCardLinks(self.progress * endTime, built.landedAt);
            if (self.progress <= 0.001) {
              holdState.on = false;
              timeline.time(0).pause();
              restorePreDealSizing();
              resetHeroCopyLayout(heroCopy, heroRow, heroTitle, heroBody);
              resetStageAtRest(stage);
              return;
            }
            timeline.time(self.progress * endTime);
            applyHoldRoom();
            if (self.progress >= 0.999) {
              releaseStickyHold(stage, holdState);
              return;
            }
            const scrollFraction =
              fullSpan > 0 ? (self.progress * animationPx) / fullSpan : 0;
            if (scrollFraction < PHASE_OVERLAP_CENTER) {
              restorePreDealSizing();
            }
            applyScrollCompensatedOverlap(
              stage,
              main,
              scrollFraction,
              overlapX,
              overlapY,
              overlapScrollStart,
              topRowCenterY,
              endScrollFraction,
              restTop,
              holdState,
            );
          },
          onLeaveBack: () => {
            setCardLinksLive(false);
            holdState.on = false;
            timeline?.progress(0).pause();
            resetHeroCopyLayout(heroCopy, heroRow, heroTitle, heroBody);
            resetStageAtRest(stage);
            clearCardInlineStyles();
          },
        });

        resetStageAtRest(stage);
        applyHoldRoom();
        syncCardLinks(scrollTrigger.progress * endTime, built.landedAt);
        placeDesignArsenal({
          main,
          stage,
          topRowCenterY,
          gridHeight: built.gridHeight,
          animationPx,
          restTop,
        });

        return true;
      };

      const rebuildScrub = () => {
        destroyScrub();
        tryBuildScrub();
        ScrollTrigger.refresh();
      };

      const scheduleTryBuild = () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            tryBuildScrub();
            ScrollTrigger.refresh();
          });
        });
      };

      const onRefresh = () => {
        if (!scrollTrigger) {
          tryBuildScrub();
        }
      };

      const onLoad = () => {
        tryBuildScrub();
        ScrollTrigger.refresh();
      };

      let resizeTimer = null;
      const resizeObserver = new ResizeObserver(() => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          rebuildScrub();
        }, 150);
      });
      resizeObserver.observe(main);

      ScrollTrigger.addEventListener("refresh", onRefresh);
      window.addEventListener("load", onLoad);
      window.addEventListener("resize", rebuildScrub);

      tryBuildScrub();
      scheduleTryBuild();

      return () => {
        window.clearTimeout(resizeTimer);
        resizeObserver.disconnect();
        ScrollTrigger.removeEventListener("refresh", onRefresh);
        window.removeEventListener("load", onLoad);
        window.removeEventListener("resize", rebuildScrub);
        destroyScrub();
      };
    }, section);

    const onMediaChange = () => {
      if (!media.matches) {
        ctx.revert();
        setCardLinksLive(true);
      }
    };
    media.addEventListener("change", onMediaChange);

    return () => {
      media.removeEventListener("change", onMediaChange);
      ctx.revert();
      setCardLinksLive(true);
      removeScrubSpacer(main);
      gsap.set(main, { clearProps: "paddingBottom" });
    };
  }, [sectionRef]);
}
