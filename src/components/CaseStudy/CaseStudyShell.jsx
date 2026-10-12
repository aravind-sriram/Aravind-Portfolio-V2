"use client";

import { useRef } from "react";
import useRevealGroups from "@/components/Works/useRevealGroups";
import styles from "./CaseStudy.module.css";

export default function CaseStudyShell({ children }) {
  const mainRef = useRef(null);
  useRevealGroups({ rootRef: mainRef });

  return (
    <main ref={mainRef} className={styles.page}>
      <div className={styles.panel}>{children}</div>
      <div className={styles.frame} aria-hidden="true" />
    </main>
  );
}
