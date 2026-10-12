"use client";

import { useRef } from "react";
import Image from "next/image";
import NavItemBrackets from "@/components/NavItemBrackets/NavItemBrackets";
import ScrambleText from "@/components/ScrambleText/ScrambleText";
import { navigateWorks, releasePointerFocus } from "@/components/Works/worksNavigation";
import styles from "./Hero.module.css";

export default function AboutNavItem() {
  const scrambleRef = useRef(null);

  return (
    <div className={styles.navCell} data-align="start">
      <div
        className={styles.aboutHit}
        onMouseEnter={() => scrambleRef.current?.scramble()}
        onMouseLeave={() => scrambleRef.current?.reset()}
      >
        <div className={`${styles.navHoverCore} ${styles.aboutHoverCore}`}>
          <NavItemBrackets className={styles.navHoverBrackets} />
          <button
            type="button"
            className={`${styles.navHoverButton} ${styles.navHoverButtonStart}`}
            onClick={(event) => {
              releasePointerFocus(event);
              navigateWorks("about");
            }}
          >
            <ScrambleText ref={scrambleRef} text="About" externalTrigger />
          </button>
        </div>
        <div className={styles.aboutAvatar}>
          <Image
            src="/images/about-wave.webp"
            alt=""
            width={28}
            height={25}
            unoptimized
            className={styles.aboutAvatarImg}
          />
        </div>
      </div>
    </div>
  );
}
