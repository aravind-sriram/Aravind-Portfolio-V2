import { Fragment } from "react";
import Image from "next/image";
import BreakdownStepper from "@/components/CaseStudy/BreakdownStepper";
import CaseStudyBrackets from "@/components/CaseStudy/CaseStudyBrackets";
import CaseStudyHero from "@/components/CaseStudy/CaseStudyHero";
import CaseStudyShell from "@/components/CaseStudy/CaseStudyShell";
import OtherCaseStudies from "@/components/CaseStudy/OtherCaseStudies";
import ProblemsReveal from "@/components/CaseStudy/ProblemsReveal";
import styles from "@/components/CaseStudy/CaseStudy.module.css";

const SKETCH_GOALS = [
  "minimalist",
  "easily understandable",
  "one template, for all the tests",
  "less pages",
  "more detail? no",
  "nav shouldn't make anyone think",
  "Versatile enough to accommodate other upcoming coming tests",
];

/* `span` is each screen's rendered width in the 4700-wide flow artboard. */
const FINAL_SCREENS = [
  {
    src: "/images/work/pheezee/final-home.png",
    alt: "Home screen listing patients, each with a Start Session button.",
    width: 508,
    height: 960,
    span: 508,
  },
  {
    src: "/images/work/pheezee/final-start-session.png",
    alt: "Start Session screen with Special tests grouped by condition, such as Geriatric Care.",
    width: 880,
    height: 1656,
    span: 892,
  },
  {
    src: "/images/work/pheezee/final-test.png",
    alt: "30s Partial Curl Up test setup asking for the dominant side.",
    width: 892,
    height: 1680,
    span: 892,
  },
  {
    src: "/images/work/pheezee/final-live-monitoring.png",
    alt: "Live Monitoring screen showing range of motion and repetitions during the test.",
    width: 876,
    height: 1680,
    span: 876,
  },
  {
    src: "/images/work/pheezee/final-result.png",
    alt: "Result dialog showing repetitions and endurance, with Retry and Next Test.",
    width: 508,
    height: 960,
    span: 508,
  },
];

const IMPACT_STATS = [
  { value: "+16%", label: "New user acquisition" },
  { value: "+23%", label: "Task Completion" },
];

const LEARNINGS = [
  {
    title: "Good design isn't always about adding something new.",
    body: "Sometimes, it's about helping people understand the value of what's already there.",
  },
  {
    title: "Even without the field, I could still get closer to users.",
    body: "I learned to find different ways to understand their needs, behaviours, and the problems they were facing.",
  },
  {
    title: "Not everything needs fancy UI.",
    body: "Sometimes, the best interface is the one that quietly gets the job done.",
  },
];

const PROBLEMS = [
  {
    title: "Physiotherapists weren't confused. They were rushed.",
    body: "They knew the right muscle, movement, and angle. They just didn't have fifteen seconds mid-session to build it from scratch — so the rush won, not the confusion.",
  },
  {
    title: "One App, Two Different Comfort Levels, No Splitting",
    body: "Veterans wanted speed, no hand-holding. Juniors needed guidance, even unspoken. Spoon-feed the senior, they'd tune out. Leave the junior unguided, they'd hesitate. It had to flex both ways.",
  },
  {
    title: "Everything on the page meant nothing stood out",
    body: "General tests showed every option, always — complete, but mostly beside the point. Physiotherapists didn't need more choices. They needed the screen to already know which ones mattered.",
  },
  {
    title: "A graph doesn't encourage anyone mid-exercise",
    body: "When a patient extends their knee, a flat line on a graph doesn't say \u201cyou're doing great.\u201d Progress needed to feel visible, not just measurable.",
  },
];

/* Plain strings are placeholder labels for screens that haven't been added yet. */
const SOLUTIONS = [
  {
    problem: "Physiotherapists weren't confused. They were rushed.",
    problemDetail:
      "Every patient meant manually picking side, position, movement, reps, EMG range, and angle — all before starting.",
    before: [
      {
        src: "/images/work/pheezee/breakdown-1-before.png",
        alt: "The old general test screen, with side, position, movement, muscle, reps, EMG and angles all set by hand.",
      },
    ],
    solution: "Select the condition, and the right combination is already there.",
    solutionDetail: "One selection now does the work six used to.",
    after: [
      {
        src: "/images/work/pheezee/breakdown-1-after-1.png",
        alt: "Start Session screen with Special tests grouped by condition, such as Geriatric Care.",
      },
      {
        src: "/images/work/pheezee/breakdown-1-after-2.png",
        alt: "30s Partial Curl Up test setup asking only for the dominant side.",
      },
    ],
  },
  {
    problem: "One App, Two Comfort Levels, Somehow Both",
    problemDetail:
      "Same detail, same instructions, whether it was someone's first test or their hundredth.",
    before: [
      {
        src: "/images/work/pheezee/breakdown-2-before.png",
        alt: "The old general test screen, identical for a first test or a hundredth.",
      },
    ],
    solution: "Guidance stays hidden until asked for.",
    solutionDetail: "Veterans get a clean screen. Juniors get a teacher, one tap away.",
    after: [
      {
        src: "/images/work/pheezee/breakdown-2-after-1.png",
        alt: "30s Partial Curl Up test setup with the guidance collapsed, asking only for the dominant side.",
      },
      {
        src: "/images/work/pheezee/breakdown-2-after-2.png",
        alt: "The same test with guidance expanded: sensor placement picture, why the test matters, and step-by-step instructions.",
      },
    ],
  },
  {
    problem: "Encouragement, Not Just Data",
    problemDetail:
      "A number or a graph line, mid-exercise — accurate, but meaningless to a patient just trying to finish.",
    before: [
      {
        src: "/images/work/pheezee/breakdown-3-before.png",
        alt: "The old Live Monitoring screen, labelled Old Design: a range-of-motion dial, angle and rep fields, and an EMG graph.",
        ratio: 904 / 1040,
      },
    ],
    solution: "A stack of arrows that lights up as you move.",
    solutionDetail: "No numbers to read. Just proof the next rep counted.",
    after: [
      {
        src: "/images/work/pheezee/breakdown-3-after-1.png",
        alt: "Calf raise Live Monitoring with a stack of arrows beside the leg illustration, remaining time and reps.",
      },
      {
        src: "/images/work/pheezee/breakdown-3-after-2.png",
        alt: "Grip Strength Live Monitoring with a progress ring around the hand illustration, contractions and peak EMG.",
      },
    ],
  },
  {
    problem: "General Tests Showed Every Option, Always",
    problemDetail:
      "Every field, every setting, every time — regardless of what the case actually needed.",
    before: [
      {
        src: "/images/work/pheezee/breakdown-4-before.png",
        alt: "The old General tests screen: side, position, movement, muscle, reps, max EMG and angles all set by hand.",
        ratio: 946 / 1040,
      },
    ],
    solution: "Choose the condition, see only what applies.",
    solutionDetail: "Pick Ortho, Neuro, or Geriatric — the screen adjusts itself.",
    after: [
      {
        src: "/images/work/pheezee/breakdown-4-after-1.png",
        alt: "Start Session with Special tests grouped by condition, such as Geriatric Care and Kids & Adults wellness.",
      },
      {
        src: "/images/work/pheezee/breakdown-4-after-2.png",
        alt: "Push Up test setup asking only for the dominant side.",
      },
    ],
  },
];

export const metadata = {
  title: "Pheezee — Aravind Sriram",
  description:
    "Grew task completion by 23% and new users by 16%, within the constraints of an existing UI.",
};

export default function PheezeeCaseStudy() {
  return (
    <CaseStudyShell>
      <CaseStudyHero
        title="Pheezee"
        summary="Grew task completion by 23% and new users by 16%, within the constraints of an existing UI."
      />
      <div className={styles.revealMask} data-reveal-group>
        <div className={`${styles.heroMedia} ${styles.heroShot}`} data-reveal-rise="0">
          <Image
            className={styles.heroShotCover}
            src="/images/work/pheezee/hero-physio-ui-2400.jpg"
            alt="Five Pheezee app screens: live monitoring, a session summary, and body-part selection."
            fill
            sizes="96vw"
            loading="eager"
            unoptimized
          />
        </div>
      </div>

      <section className={styles.section} aria-labelledby="overview-title" data-reveal-group>
        <p className={styles.sectionLabel} data-reveal-text="body">
          [Overview]
        </p>
        <h2 id="overview-title" className={styles.sectionTitle} data-reveal-text="title">
          Pheezee had the tools. Physiotherapists just weren&apos;t using all of them.
        </h2>
        <p className={styles.sectionBody} data-reveal-text="body">
          Pheezee — a biofeedback device and app for physiotherapists — already had plenty
          under the hood. The challenge was connecting those capabilities to the specific
          needs of Ortho, Neuro, Geriatrics, and beyond. The leadership team introduced
          Special Tests to bridge that gap, and my job was to turn that direction into an
          experience that actually worked. Was the gap closed? Was the design helpful? Could
          more specialized physiotherapists get the most out of Pheezee? Hmm... 🤔
        </p>
        <div className={styles.revealMask}>
          <Image
            className={styles.sectionMedia}
            data-reveal-rise="0"
            src="/images/work/pheezee/overview-v3.png"
            alt="A confused physiotherapist plus Special Tests equals one still asking “did it work?”."
            width={1024}
            height={395}
            sizes="96vw"
          />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="role-title" data-reveal-group>
        <p className={styles.sectionLabel} data-reveal-text="body">
          [My Role]
        </p>
        <h2 id="role-title" className={styles.sectionTitle} data-reveal-text="title">
          The direction was set. Turning it into something real was mine.
        </h2>
        <p className={styles.sectionBody} data-reveal-text="body">
          Leadership had the idea and the name. Everything after that — figuring out what
          physiotherapists and patients actually needed, researching, sketching, testing, and
          shipping the final design — was on me, start to finish.
        </p>
      </section>

      <div className={styles.split}>
        <div className={styles.splitText}>
          <section aria-labelledby="constraint-title" data-reveal-group>
            <p className={styles.sectionLabel} data-reveal-text="body">
              [Constrain Opportunity]
            </p>
            <h2 id="constraint-title" className={styles.sectionTitle} data-reveal-text="title">
              The UI was already live. I had to make Special Tests belong.
            </h2>
            <p className={styles.sectionBody} data-reveal-text="body">
              No blank canvas — just a working app, and a job to make Special Tests happen
              inside it, without touching what was already live. No new navigation, no new
              visual language. Just the existing pieces, made to work harder. A far more honest
              test of whether the thinking actually holds up than starting from scratch ever
              would be.
            </p>
          </section>

          <section aria-labelledby="research-title" data-reveal-group>
            <p className={styles.sectionLabel} data-reveal-text="body">
              [Research]
            </p>
            <h2 id="research-title" className={styles.sectionTitle} data-reveal-text="title">
              How I actually figured this out - Interviews kept falling through, so I stopped
              relying on them alone
            </h2>
            <ul className={styles.tags} aria-label="Methods">
              {["CUX", "USER INTERVIEW"].map((method, index) => (
                <li key={method} className={styles.tagMask}>
                  <span className={styles.tag} data-reveal-rise={index}>
                    {method}
                  </span>
                </li>
              ))}
            </ul>
            <p className={styles.sectionBody} data-reveal-text="body">
              Scheduled conversations got cancelled more often than they happened. So I
              started observing alongside physiotherapists too, filling the gaps conversations
              left behind. One afternoon waiting on a doctor who never showed taught me more
              than the interview would have — physios move between patients with almost no
              spare seconds.
            </p>
          </section>
        </div>
        <div className={`${styles.splitMedia} ${styles.revealMask}`} data-reveal-group>
          <Image
            className={styles.revealFill}
            data-reveal-rise="0"
            src="/images/work/pheezee/existing-ui.png"
            alt="The existing Pheezee Select Body Part screen, annotated where physiotherapists select movements and muscles."
            width={1580}
            height={2304}
            sizes="(max-width: 760px) 360px, 32vw"
          />
        </div>
      </div>

      <section className={styles.section} aria-labelledby="problems-title" data-reveal-group>
        <ProblemsReveal>
          <p className={styles.sectionLabel} data-reveal-text="body">
            [Problems at Hand]
          </p>
          <h2 id="problems-title" className={styles.sectionTitle} data-reveal-text="title">
            What the research actually surfaced
          </h2>
          <ol className={styles.problems}>
            {PROBLEMS.map((problem, index) => (
              <li key={problem.title} className={styles.problem} data-reveal-card>
                <CaseStudyBrackets />
                <div className={styles.problemCard}>
                  <span className={styles.problemNumber}>{index + 1}</span>
                  <h3 className={styles.problemTitle}>{problem.title}</h3>
                  <p className={styles.problemBody}>{problem.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </ProblemsReveal>
      </section>

      <section className={styles.section} aria-labelledby="finding-title" data-reveal-group>
        <p className={styles.sectionLabel} data-reveal-text="body">
          [The Unplanned Finding]
        </p>
        <h2 id="finding-title" className={styles.sectionTitle} data-reveal-text="title">
          Research Didn&apos;t Just Find a Problem. It Found a Gap Nobody Named.
        </h2>
        <p className={`${styles.sectionBody} ${styles.sectionBodyPlain}`} data-reveal-text="body">
          I went into the field to understand what was getting in the way of the existing
          general tests — so we wouldn&apos;t carry the same problems into Special Tests. But
          somewhere along the way, physiotherapists started asking for something else:
          condition-specific tests. Which, funnily enough, was exactly what we were there to
          build.
        </p>
        <p className={`${styles.sectionBody} ${styles.sectionBodyPlain}`} data-reveal-text="body">
          Yeah, small world!!
        </p>
        <p className={`${styles.sectionBody} ${styles.sectionBodyPlain}`} data-reveal-text="body">
          I took the finding back to the team. Turns out, the demand was real — and it opened
          up a much bigger opportunity than we expected.
        </p>
        <div className={styles.callout}>
          <CaseStudyBrackets />
          <p data-reveal-text="body">Special Tests became a premium feature on its own.</p>
        </div>
      </section>

      <div className={`${styles.split} ${styles.splitSketches}`}>
        <section aria-labelledby="sketching-title" data-reveal-group>
          <p className={styles.sectionLabel} data-reveal-text="body">
            [Ideating &amp; Sketching]
          </p>
          <h2 id="sketching-title" className={styles.sectionTitle} data-reveal-text="title">
            Before pixels came scribbles.
          </h2>
          <ul className={styles.tags} aria-label="Sketching goals">
            {SKETCH_GOALS.map((goal, index) => (
              <li key={goal} className={styles.tagMask}>
                <span className={styles.tag} data-reveal-rise={index}>
                  {goal}
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.sectionBody} data-reveal-text="body">
            These weren&apos;t meant to look pretty. They were made to help me visualize the UI —
            exploring layouts, screens, and flows quickly before turning the ideas into the
            actual interface.
          </p>
        </section>
        <div className={`${styles.sketchMedia} ${styles.revealMask}`} data-reveal-group>
          <Image
            className={styles.revealFill}
            data-reveal-rise="0"
            src="/images/work/pheezee/sketches.png"
            alt="Five hand-drawn paper sketches of Pheezee screens, including live monitoring and body part selection, annotated “These made sense in my head”."
            width={1024}
            height={639}
            sizes="(max-width: 760px) 100vw, 36vw"
          />
        </div>
      </div>

      <section
        className={`${styles.section} ${styles.sectionNear} ${styles.darkEnd}`}
        aria-labelledby="testing-title"
        data-reveal-group
      >
        <p className={styles.sectionLabel} data-reveal-text="body">
          [Usability Testing]
        </p>
        <h2 id="testing-title" className={styles.sectionTitle} data-reveal-text="title">
          Think-aloud testing, with the team I got.
        </h2>
        <p className={`${styles.sectionBody} ${styles.sectionBodyPlain}`} data-reveal-text="body">
          Real user testing wasn&apos;t on the cards, so I tested with hardware engineers,
          production folks, and people with zero physiotherapy background. If they could
          navigate it without getting stuck, I knew I was onto something. A few rounds. A few
          fixes. A very different final design.
        </p>
      </section>

      <section
        className={`${styles.section} ${styles.light}`}
        aria-labelledby="pixels-title"
        data-reveal-group
      >
        <p className={styles.sectionLabel} data-reveal-text="body">
          [And Then, Pixels]
        </p>
        <h2 id="pixels-title" className={styles.sectionTitle} data-reveal-text="title">
          Lots of iterations. A few wrong turns. Eventually, the final UI.
        </h2>
        <p className={`${styles.sectionBody} ${styles.sectionBodyPlain}`} data-reveal-text="body">
          From the first rough screens to the polished experience, the design went through
          plenty of rounds — refining the flows, hierarchy, and details until everything started
          making sense.
        </p>
        <div data-reveal-group>
          <div className={styles.flow}>
            {FINAL_SCREENS.map((screen, index) => (
              <Fragment key={screen.src}>
                {index > 0 && (
                  <span className={styles.flowArrow}>
                    <Image
                      className={styles.revealFill}
                      data-reveal-rise={index * 2 - 1}
                      src="/images/work/pheezee/flow-arrow.png"
                      alt=""
                      width={92}
                      height={23}
                      unoptimized
                    />
                  </span>
                )}
                <span className={styles.flowScreen} style={{ "--span": screen.span }}>
                  <Image
                    className={styles.revealFill}
                    data-reveal-rise={index * 2}
                    src={screen.src}
                    alt={screen.alt}
                    width={screen.width}
                    height={screen.height}
                    unoptimized
                  />
                </span>
              </Fragment>
            ))}
          </div>
          <p className={styles.note} data-reveal-text="body">
            A quick note before you scroll:{" "}
            <span className={styles.noteMuted}>
              none of this was designed to show off. It was designed to
            </span>{" "}
            disappear into a physiotherapist&apos;s workflow{" "}
            <span className={styles.noteMuted}>
              and quietly make sense to the patient on the other side.
            </span>{" "}
            If it looks simple, that&apos;s the point. Not an accident.
          </p>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.light}`}
        aria-labelledby="breakdown-title"
        data-reveal-group
      >
        <BreakdownStepper pairs={SOLUTIONS} />
      </section>

      <section
        className={`${styles.section} ${styles.light}`}
        aria-labelledby="impact-title"
        data-reveal-group
      >
        <p className={styles.sectionLabel} data-reveal-text="body">
          [Impact]
        </p>
        <h2 id="impact-title" className={styles.sectionTitle} data-reveal-text="title">
          Did it actually work?
        </h2>
        <p className={`${styles.sectionBody} ${styles.sectionBodyPlain}`} data-reveal-text="body">
          Special Tests brought in new users who came for this feature, and physios ran more
          tests because of it. It launched as a premium feature, and revenue grew once it went
          live. Here&apos;s how it played out in numbers.
        </p>
        <ul className={styles.stats} aria-label="Results">
          {IMPACT_STATS.map((stat, index) => (
            <li key={index} className={styles.statMask}>
              <div className={styles.stat} data-reveal-rise={index}>
                <CaseStudyBrackets />
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className={`${styles.impactMedia} ${styles.revealMask}`} data-reveal-group>
          <Image
            className={styles.revealFill}
            data-reveal-rise="0"
            src="/images/work/pheezee/impact.svg"
            alt="A confused physiotherapist plus Special Tests equals a happy one: “it worked”."
            width={2346}
            height={1016}
            unoptimized
          />
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.light} ${styles.closingSection}`}
        aria-labelledby="learnings-title"
        data-reveal-group
      >
        <ProblemsReveal stepped>
          <p className={styles.sectionLabel} data-reveal-text="body">
            [Learnings]
          </p>
          <h2 id="learnings-title" className={styles.learningsTitle} data-reveal-text="title">
            A few things I&apos;d carry into the next project.
          </h2>
          <ul className={styles.learnings}>
            {LEARNINGS.map((learning) => (
              <li key={learning.title} className={styles.learning} data-reveal-card>
                <CaseStudyBrackets />
                <h3 className={styles.learningTitle} data-reveal-text="body">
                  {learning.title}
                </h3>
                <p className={styles.learningBody} data-reveal-text="body">
                  {learning.body}
                </p>
              </li>
            ))}
          </ul>
        </ProblemsReveal>
        <OtherCaseStudies current="pheezee" />
      </section>
    </CaseStudyShell>
  );
}
