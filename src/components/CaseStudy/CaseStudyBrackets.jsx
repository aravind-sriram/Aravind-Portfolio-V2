import styles from "./CaseStudy.module.css";

export default function CaseStudyBrackets() {
  return (
    <span className={styles.brackets} aria-hidden="true">
      <span className={styles.bracketTopLeft} />
      <span className={styles.bracketTopRight} />
      <span className={styles.bracketBottomLeft} />
      <span className={styles.bracketBottomRight} />
    </span>
  );
}
