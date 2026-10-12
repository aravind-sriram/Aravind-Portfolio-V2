"use client";

import { useRef } from "react";
import NavItemBrackets from "@/components/NavItemBrackets/NavItemBrackets";
import ScrambleText from "@/components/ScrambleText/ScrambleText";
import { navigateWorks, releasePointerFocus } from "@/components/Works/worksNavigation";
import styles from "./Hero.module.css";

export default function MyWorksNavItem() {
  const scrambleRef = useRef(null);

  return (
    <div className={styles.navCell} data-align="center">
      <div
        className={styles.myWorksHit}
        onMouseEnter={() => scrambleRef.current?.scramble()}
        onMouseLeave={() => scrambleRef.current?.reset()}
      >
        <div className={styles.navHoverCore}>
          <NavItemBrackets className={styles.navHoverBrackets} />
          <button
            type="button"
            className={`${styles.navHoverButton} ${styles.navHoverButtonCenter}`}
            onClick={(event) => {
              releasePointerFocus(event);
              navigateWorks("projects");
            }}
          >
            <ScrambleText ref={scrambleRef} text="Projects" externalTrigger />
          </button>
        </div>
      </div>
    </div>
  );
}
