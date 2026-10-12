"use client";

import { useRef } from "react";
import Image from "next/image";
import CaseStudyBrackets from "./CaseStudyBrackets";
import styles from "./CaseStudy.module.css";
import createStepper from "./createStepper";
import usePinnedScroll from "./usePinnedScroll";

/* Slides the track one pair per wheel gesture by tweening `--step` (0 … pairs - 1). */
function breakdownScene(pin, context) {
  return createStepper(pin.querySelectorAll("[data-breakdown-row]").length, context, {
    render: (shown) => pin.style.setProperty("--step", shown.toFixed(4)),
    clear: () => pin.style.removeProperty("--step"),
  });
}

const SCREEN_RATIO = 115 / 214;

function screenSizes(ratio) {
  const scale = ratio ? ratio / SCREEN_RATIO : 1;
  return `(max-width: 760px) ${Math.ceil(30 * scale)}vw, ${Math.ceil(12 * scale)}vw`;
}

function BreakdownCard({ title, detail, screens }) {
  return (
    <article className={styles.breakdownCard}>
      <h3 className={styles.breakdownCardTitle} data-reveal-text="body">
        {title}
      </h3>
      <p className={styles.breakdownCardBody} data-reveal-text="body">
        {detail}
      </p>
      <div className={styles.breakdownMedia}>
        {screens.map((screen) =>
          typeof screen === "string" ? (
            <div key={screen} className={styles.breakdownScreen}>
              {screen}
            </div>
          ) : (
            <div
              key={screen.src}
              className={`${styles.breakdownScreen} ${styles.breakdownScreenShot}`}
              style={screen.ratio ? { "--ratio": screen.ratio } : undefined}
              data-wide={screen.ratio ? "" : undefined}
            >
              <Image
                className={styles.breakdownShot}
                src={screen.src}
                alt={screen.alt}
                fill
                sizes={screenSizes(screen.ratio)}
              />
            </div>
          ),
        )}
      </div>
    </article>
  );
}

export default function BreakdownStepper({ pairs }) {
  const runwayRef = useRef(null);
  const pinRef = useRef(null);
  usePinnedScroll(runwayRef, pinRef, breakdownScene);

  return (
    <div ref={runwayRef}>
      <div ref={pinRef} className={`${styles.breakdown} ${styles.breakdownPin}`}>
        <div className={styles.breakdownIntro}>
          <p className={styles.sectionLabel} data-reveal-text="body">
            [Okay, Let&apos;s Break This Down]
          </p>
          <h2 id="breakdown-title" className={styles.breakdownTitle} data-reveal-text="title">
            From Problems to Solutions
          </h2>
          <p className={styles.breakdownBody} data-reveal-text="body">
            Here’s where each problem meets its solution — a quick look at the decisions behind
            the screens and how they came together.
          </p>
          <span className={styles.breakdownStep}>
            <CaseStudyBrackets />
            <span className={styles.breakdownStepMask}>
              <span className={styles.breakdownStepReel}>
                {pairs.map((pair, index) => (
                  <span key={pair.problem}>{index + 1}</span>
                ))}
              </span>
            </span>
          </span>
        </div>
        <div className={styles.breakdownFrame}>
          <CaseStudyBrackets />
          <div className={styles.breakdownViewport}>
            <div className={styles.breakdownTrack}>
              {pairs.map((pair) => (
                <div key={pair.problem} className={styles.breakdownRow} data-breakdown-row>
                  <BreakdownCard
                    title={pair.problem}
                    detail={pair.problemDetail}
                    screens={pair.before}
                  />
                  <span className={styles.breakdownDivider} aria-hidden="true" />
                  <BreakdownCard
                    title={pair.solution}
                    detail={pair.solutionDetail}
                    screens={pair.after}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
