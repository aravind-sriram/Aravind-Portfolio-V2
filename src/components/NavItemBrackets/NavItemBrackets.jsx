import styles from "./NavItemBrackets.module.css";

/** Hover-only brackets around a single nav label. Independent from page CornerBrackets. */
export default function NavItemBrackets({ className = "" }) {
  return (
    <div
      className={`${styles.frame} ${className}`.trim()}
      aria-hidden="true"
    >
      <span className={`${styles.corner} ${styles.topLeft}`} />
      <span className={`${styles.corner} ${styles.topRight}`} />
      <span className={`${styles.corner} ${styles.bottomLeft}`} />
      <span className={`${styles.corner} ${styles.bottomRight}`} />
    </div>
  );
}
