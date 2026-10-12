import Image from "next/image";
import CaseStudyBrackets from "@/components/CaseStudy/CaseStudyBrackets";
import CaseStudyHero from "@/components/CaseStudy/CaseStudyHero";
import CaseStudyShell from "@/components/CaseStudy/CaseStudyShell";
import OtherCaseStudies from "@/components/CaseStudy/OtherCaseStudies";
import ScreenMarquee from "@/components/CaseStudy/ScreenMarquee";
import styles from "@/components/CaseStudy/CaseStudy.module.css";

const META = [
  { label: "Role", value: "UI Design - End to End" },
  { label: "Timeline", value: "15 days" },
];

const screen = (file, name, height = 1542) => ({
  src: `/images/work/reszone/screens/${file}.png`,
  name,
  width: 720,
  height,
});

const FINAL_SCREEN_ROWS = [
  [
    screen("login", "Log in screen"),
    screen("live-session", "Live session screen"),
    screen("live-session-collapsed", "Live session screen, collapsed"),
    screen("personal-info", "Personal info screen"),
    screen("recovery-test", "Recovery test screen"),
    screen("password", "Password screen"),
  ],
  [
    screen("calisthenics", "Calisthenics workout screen"),
    screen("home", "Home screen"),
    screen("membership", "Membership screen"),
    screen("connect-device", "Connect device screen"),
    screen("polar-device", "Polar device screen"),
    screen("my-profile", "My profile screen", 1720),
  ],
];

export const metadata = {
  title: "Reszone — Aravind Sriram",
  description: "Designing the Reszone fitness app.",
};

export default function ReszoneCaseStudy() {
  return (
    <CaseStudyShell>
      <CaseStudyHero title="Reszone" summary="Designing the Reszone fitness app." />
      <div className={styles.revealMask} data-reveal-group>
        <div className={`${styles.heroMedia} ${styles.heroShot}`} data-reveal-rise="0">
          <Image
            className={styles.heroShotCover}
            src="/images/work/reszone/hero.png"
            alt="Five Reszone app screens on floating phones."
            fill
            sizes="96vw"
            loading="eager"
          />
        </div>
      </div>

      <section className={styles.section} aria-labelledby="overview-title" data-reveal-group>
        <p className={styles.sectionLabel} data-reveal-text="body">
          [Overview]
        </p>
        <h2 id="overview-title" className={styles.sectionTitle} data-reveal-text="title">
          A device that tracks you. An app that tells you what to do with it.
        </h2>
        <p className={`${styles.sectionBody} ${styles.sectionBodyWide}`} data-reveal-text="body">
          Reszone is a fitness device paired with an app. It monitors workouts and health, then
          recommends exercises based on what it sees. My job was to design the app, so the data
          from the device turned into something people would actually use. Designed end to end,
          then handed off cleanly to developers.
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
        aria-labelledby="starting-title"
        data-reveal-group
      >
        <p className={styles.sectionLabel} data-reveal-text="body">
          [Starting Point]
        </p>
        <h2 id="starting-title" className={styles.sectionTitle} data-reveal-text="title">
          They had a UI. It just wasn&apos;t the one.
        </h2>
        <p className={`${styles.sectionBody} ${styles.sectionBodyWide}`} data-reveal-text="body">
          The team came with an older UI, and it wasn&apos;t working. I said so, explained why,
          and we agreed to start fresh. Better to say it on day one than to polish something I
          didn&apos;t believe in.
        </p>
      </section>

      <section
        className={`${styles.section} ${styles.light}`}
        aria-labelledby="final-ui-title"
        data-reveal-group
      >
        <p className={styles.sectionLabel} data-reveal-text="body">
          [Final UI]
        </p>
        <h2 id="final-ui-title" className={styles.sectionTitle} data-reveal-text="title">
          The screens that turn data into a next step
        </h2>
        <p className={`${styles.sectionBody} ${styles.sectionBodyPlain}`} data-reveal-text="body">
          A fitness device collects a lot about you, and numbers on their own don&apos;t make
          anyone want to work out. The job of these screens was to take what the device
          monitors, from workouts to health, and turn it into something clear, then point to
          what to do next: the exercises recommended for that person. I designed every screen
          end to end in 15 days, with no research phase and one sole designer, so each decision
          had to earn its place. What you see here is the version that went to the developers:
          clean, consistent, and built so the data stays easy to read and the next step stays
          obvious.
        </p>
        <ScreenMarquee rows={FINAL_SCREEN_ROWS} />
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
          What 15 Days and Zero Research Taught Me
        </h2>
        <div className={styles.lesson}>
          <CaseStudyBrackets />
          <h3 className={styles.lessonTitle} data-reveal-text="body">
            No research doesn&apos;t mean no thinking.
          </h3>
          <p className={styles.lessonBody} data-reveal-text="body">
            There was no time or budget for user research, so I leaned on what I could do:
            competitive analysis, and a clear sense of what a person wants from a fitness app,
            which is to see their progress and know what to do next. Two platforms in 15 days
            meant picking what deserved attention and letting the rest wait. What I&apos;d do
            with more time is talk to the people wearing the device. That is the honest gap.
          </p>
        </div>
        <OtherCaseStudies current="rezone" />
      </section>
    </CaseStudyShell>
  );
}
