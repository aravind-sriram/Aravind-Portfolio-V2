"use client";

import { useRef } from "react";
import CornerBrackets from "@/components/CornerBrackets/CornerBrackets";
import ScrambleText from "@/components/ScrambleText/ScrambleText";
import styles from "./Hero.module.css";

export default function HeroNavItem({
  label,
  align = "start",
  avatar = false,
  social = false,
  socialIcons = null,
}) {
  const scrambleRef = useRef(null);

  return (
    <div className={styles.navCell} data-align={align}>
      <div
        className={styles.navItemHit}
        onMouseEnter={() => scrambleRef.current?.scramble()}
        onMouseLeave={() => scrambleRef.current?.reset()}
      >
        {social && <div className={styles.socialIcons}>{socialIcons}</div>}
        <div className={styles.navItemCore}>
          <CornerBrackets
            variant="light"
            className={styles.navItemBrackets}
          />
          <button type="button" className={styles.navButton}>
            <ScrambleText ref={scrambleRef} text={label} externalTrigger />
          </button>
        </div>
        {avatar && (
          <div className={styles.aboutAvatar}>
            <img
              src="https://placehold.co/48x48/f0f0ec/111111/png?text=AS"
              alt=""
              width={48}
              height={48}
            />
          </div>
        )}
      </div>
    </div>
  );
}
