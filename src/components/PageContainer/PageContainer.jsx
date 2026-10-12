import styles from "./PageContainer.module.css";

export default function PageContainer({ children, className = "", as: Tag = "div" }) {
  return (
    <Tag className={`${styles.container} ${className}`.trim()}>{children}</Tag>
  );
}
