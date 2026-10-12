"use client";

import { useRef } from "react";
import useArsenalTitleScroll from "./useArsenalTitleScroll";
import useWorksContentReveal from "./useWorksContentReveal";
import useWorksCurtainReveal from "./useWorksCurtainReveal";
import useWorksProjectGridScroll from "./useWorksProjectGridScroll";
import WorksPanel from "./WorksPanel";
import styles from "./Works.module.css";

export default function Works() {
  const sectionRef = useRef(null);
  const curtainRef = useRef(null);

  useWorksCurtainReveal({ sectionRef, curtainRef });
  useWorksContentReveal({ sectionRef });
  useWorksProjectGridScroll({ sectionRef });
  useArsenalTitleScroll({ sectionRef });

  return (
    <section
      ref={sectionRef}
      className={styles.worksSection}
      id="works"
      aria-label="Works"
    >
      <div ref={curtainRef} className={styles.curtain}>
        <div className={styles.inner}>
          <WorksPanel />
        </div>
      </div>
    </section>
  );
}
