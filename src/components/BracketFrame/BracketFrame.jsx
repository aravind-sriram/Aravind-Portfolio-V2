import styles from "./BracketFrame.module.css";

/** Every section and element must render inside the viewport corner brackets. */
export default function BracketFrame({ children }) {
  return <div className={styles.frame}>{children}</div>;
}
