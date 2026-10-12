import Image from "next/image";
import CaseStudyBrackets from "@/components/CaseStudy/CaseStudyBrackets";
import CaseStudyHero from "@/components/CaseStudy/CaseStudyHero";
import CaseStudyShell from "@/components/CaseStudy/CaseStudyShell";
import OtherCaseStudies from "@/components/CaseStudy/OtherCaseStudies";
import styles from "@/components/CaseStudy/CaseStudy.module.css";

const META = [
  { label: "Role", value: "Design - End to End" },
  { label: "Timeline", value: "10 days" },
];

/* Rows follow the design's line breaks; each row still wraps on narrow screens. */
const NOTICED_ROWS = [
  [
    "Hero videos looked stunning - until they didn't load.",
    "Activities, buried at the bottom.",
    "No FAQ, anywhere.",
  ],
  [
    "Too few photos, doing too much work",
    "Rooms shown - Vibe, missing.",
    "Vibes shown - Rooms, missing.",
    "Booking, too many clicks deep.",
  ],
  ["Stock-photo warmth, instead of the real place."],
];

export const metadata = {
  title: "Zeno Hills — Aravind Sriram",
  description: "A resort website, designed end to end.",
};

export default function ZenoHillsCaseStudy() {
  return (
    <CaseStudyShell>
      <CaseStudyHero title="Zeno Hills" summary="A resort website, designed end to end." />
      <div className={styles.siteCollage} data-reveal-group>
        <div className={styles.revealMask}>
          <Image
            className={styles.revealFill}
            data-reveal-rise="0"
            src="/images/work/zeno-hills/site-home.jpg"
            alt="The Zeno Hills home page: the hero, four photos of the resort, and the commitment section."
            width={2512}
            height={3008}
            sizes="(max-width: 760px) 92vw, 52vw"
            loading="eager"
          />
        </div>
        <div className={styles.siteCollageSide}>
          <div className={styles.revealMask}>
            <Image
              className={styles.revealFill}
              data-reveal-rise="1"
              src="/images/work/zeno-hills/site-amenities.jpg"
              alt="The amenities section: Free Wifi, Hot Water, Fully Furnished, AC, Dedicated Workspace, Courtyard and Private Waterfall."
              width={1835}
              height={1396}
              sizes="(max-width: 760px) 92vw, 41vw"
              loading="eager"
            />
          </div>
          <div className={styles.revealMask}>
            <Image
              className={styles.revealFill}
              data-reveal-rise="2"
              src="/images/work/zeno-hills/site-about.jpg"
              alt="The Know About Zeno Hills banner and the story section, with an aerial photo of the resort."
              width={1835}
              height={1396}
              sizes="(max-width: 760px) 92vw, 41vw"
            />
          </div>
        </div>
      </div>

      <section className={styles.section} aria-labelledby="overview-title" data-reveal-group>
        <p className={styles.sectionLabel} data-reveal-text="body">
          [Overview]
        </p>
        <h2 id="overview-title" className={styles.sectionTitle} data-reveal-text="title">
          The resort sells itself. The website just had to let it.
        </h2>
        <p className={`${styles.sectionBody} ${styles.sectionBodyWide}`} data-reveal-text="body">
          Zeno Hills is genuinely beautiful — the kind of place that convinces people once they
          actually see it. My job was making sure the website did that seeing for them: showing
          enough, feeling enough, that booking becomes the obvious next step. Design wrapped,
          then handed off clean to developers to bring it to life.
        </p>
        <dl className={styles.meta}>
          {META.map((item, index) => (
            <div key={item.label} className={styles.metaMask}>
              <div className={styles.metaItem} data-reveal-rise={index}>
                <dt>{item.label}:</dt>
                <dd>{item.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <section
        className={`${styles.section} ${styles.sectionNear} ${styles.darkEnd}`}
        aria-labelledby="competitors-title"
        data-reveal-group
      >
        <p className={styles.sectionLabel} data-reveal-text="body">
          [Competitor Analysis]
        </p>
        <h2 id="competitors-title" className={styles.sectionTitle} data-reveal-text="title">
          How I made the resort saleable
        </h2>
        <p className={`${styles.sectionBody} ${styles.sectionBodyWide}`} data-reveal-text="body">
          Went through a range of resort websites and asked one question of each: would this
          actually get me to book? Noted what worked, what fell flat, and what felt missing —
          then used that to shape the direction for Zeno Hills.
        </p>
        <div className={styles.noticed}>
          <CaseStudyBrackets />
          <div className={styles.noticedCard}>
            <h3 className={styles.noticedTitle} data-reveal-text="body">
              What I Noticed
            </h3>
            <div className={styles.noticedRows}>
              {NOTICED_ROWS.map((row, rowIndex) => (
                <ul key={row[0]} className={`${styles.tags} ${styles.noticedTags}`}>
                  {row.map((note, index) => (
                    <li key={note} className={styles.tagMask}>
                      <span className={styles.tag} data-reveal-rise={rowIndex * 2 + index}>
                        {note}
                      </span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionFar} ${styles.light} ${styles.lightFlush}`}
        aria-labelledby="website-title"
        data-reveal-group
      >
        <p className={styles.sectionLabel} data-reveal-text="body">
          [The Website, In Full]
        </p>
        <h2 id="website-title" className={styles.sectionTitle} data-reveal-text="title">
          The screens that had to do the convincing
        </h2>
        <p className={`${styles.sectionBody} ${styles.sectionBodyPlain}`} data-reveal-text="body">
          Ten days, four competing moods, and one single website, all pulled together to look
          like exactly the kind of place worth dropping everything, packing a bag, and booking a
          stay at right now.
        </p>
        <div className={`${styles.collageMedia} ${styles.revealMask}`} data-reveal-group>
          <video
            className={styles.collageVideo}
            data-reveal-rise="0"
            src="/videos/zeno-hills/resort-ui.mp4"
            width={1440}
            height={1080}
            autoPlay
            muted
            loop
            playsInline
            aria-label="The Zeno Hills website screens scrolling past."
          />
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.light} ${styles.closingSection}`}
        aria-labelledby="learnings-title"
        data-reveal-group
      >
        <p className={styles.sectionLabel} data-reveal-text="body">
          [Learnings]
        </p>
        <h2 id="learnings-title" className={styles.sectionTitle} data-reveal-text="title">
          What Ten Days Actually Taught Me
        </h2>
        <div className={styles.lesson}>
          <CaseStudyBrackets />
          <h3 className={styles.lessonTitle} data-reveal-text="body">
            Timelines don&apos;t just limit a project. They shape it.
          </h3>
          <p className={styles.lessonBody} data-reveal-text="body">
            The same brief, given a month instead of ten days, would&apos;ve turned into a
            completely different website — not better or worse, just different, because the
            timeline itself dictates the decisions. UI-wise, I could still land something
            aesthetic under pressure. The real challenge was UX — making the look and the logic
            work together without the luxury of time to test every assumption. Short timelines
            don&apos;t lower the bar, they just force you to choose, fast, what actually deserves
            your attention and what has to wait.
          </p>
        </div>
        <OtherCaseStudies current="resort" />
      </section>
    </CaseStudyShell>
  );
}
