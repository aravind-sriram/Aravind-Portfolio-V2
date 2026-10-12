"use client";

import { useRef } from "react";
import PageContainer from "@/components/PageContainer/PageContainer";
import AboutNavItem from "./AboutNavItem";
import GetInTouchNavItem from "./GetInTouchNavItem";
import MyWorksNavItem from "./MyWorksNavItem";
import useHeroScrollAnimation from "./useHeroScrollAnimation";
import styles from "./Hero.module.css";

export default function Hero() {
  const scrollRef = useRef(null);
  const stageRef = useRef(null);
  const videoRef = useRef(null);
  const titleRef = useRef(null);
  const navRef = useRef(null);

  useHeroScrollAnimation({ scrollRef, stageRef, videoRef, titleRef, navRef });

  return (
    <section ref={scrollRef} className={styles.heroScroll} aria-label="Hero">
      <div ref={stageRef} className={styles.heroStage}>
        <header ref={navRef} className={styles.nav}>
          <PageContainer className={styles.navContainer}>
            <nav className={styles.navGrid} aria-label="Primary">
              <AboutNavItem />
              <MyWorksNavItem />
              <GetInTouchNavItem />
            </nav>
          </PageContainer>
        </header>

        <div ref={videoRef} className={styles.heroVideo}>
          <video
            className={styles.heroVideoMedia}
            src="/videos/hero/hero.mp4"
            poster="/videos/hero/hero-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          />
        </div>

        <div ref={titleRef} className={styles.titleWrap}>
          <h1 className={styles.displayTitle}>
            ARAV<span className={styles.letterI} data-hero-letter-i>I</span>ND SRIRAM
          </h1>
        </div>
      </div>
    </section>
  );
}
