import Image from "next/image";
import ProjectHoverPreview from "@/components/Works/ProjectHoverPreview";
import { CASE_STUDIES } from "@/components/Works/caseStudies";
import worksStyles from "@/components/Works/WorksPanel.module.css";
import styles from "./CaseStudy.module.css";

export default function OtherCaseStudies({ current }) {
  const others = Object.entries(CASE_STUDIES).filter(([id]) => id !== current);

  return (
    <nav className={styles.closingMedia} aria-label="Other case studies" data-reveal-group>
      {others.map(([id, project], index) => (
        <div key={id} className={`${styles.closingFrame} ${styles.revealMask}`}>
          <a
            className={`${worksStyles.projectCardInner} ${styles.closingSlot}`}
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={project.name}
            data-cursor-label="View"
            data-reveal-rise={index}
          >
            <Image
              className={worksStyles.stackImage}
              src={project.src}
              alt=""
              fill
              sizes="(max-width: 760px) 96vw, 48vw"
            />
            <ProjectHoverPreview preview={project.preview} />
          </a>
        </div>
      ))}
    </nav>
  );
}
