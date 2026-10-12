import styles from "./CornerBrackets.module.css";

/** Viewport page frame only (`fixed`). Nav hovers use NavItemBrackets instead. */
export default function CornerBrackets({
  variant = "light",
  fixed = false,
  size = "default",
  className = "",
}) {
  const variantClass =
    variant === "dark" ? styles.wrapperDark : styles.wrapperLight;
  const sizeClass = size === "compact" ? styles.compact : "";

  const cornerClass = (position) =>
    `${styles.corner} ${styles[position]} ${fixed ? styles.cornerFixed : ""}`.trim();

  return (
    <div
      className={`${styles.wrapper} ${variantClass} ${sizeClass} ${fixed ? styles.fixedViewport : ""} ${className}`.trim()}
      aria-hidden="true"
    >
      <span className={cornerClass("topLeft")} />
      <span className={cornerClass("topRight")} />
      <span className={cornerClass("bottomLeft")} />
      <span className={cornerClass("bottomRight")} />
    </div>
  );
}
