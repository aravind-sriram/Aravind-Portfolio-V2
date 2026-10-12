import Link from "next/link";
import NavItemBrackets from "@/components/NavItemBrackets/NavItemBrackets";
import ScrambleText from "@/components/ScrambleText/ScrambleText";
import styles from "./CaseStudy.module.css";

export default function CaseStudyHero({ title, summary }) {
  return (
    <header className={styles.hero} data-reveal-group>
      <nav className={styles.topBar} aria-label="Case study">
        <Link href="/" className={styles.topLink}>
          Aravind Sriram
        </Link>
        <div className={styles.topLinks}>
          <a
            href="mailto:aravindsriram8@gmail.com"
            className={`${styles.topLink} ${styles.topLinkFramed}`}
          >
            <NavItemBrackets className={styles.topLinkBrackets} />
            <ScrambleText text="Contact" fixedWidth />
          </a>
          <Link href="/#works" className={`${styles.topLink} ${styles.topLinkFramed}`}>
            <NavItemBrackets className={styles.topLinkBrackets} />
            <ScrambleText text="Back to Projects" fixedWidth />
          </Link>
        </div>
      </nav>
      <h1 className={styles.title} data-reveal-text="title">
        {title}
      </h1>
      <p className={styles.summary} data-reveal-text="body">
        {summary}
      </p>
    </header>
  );
}
