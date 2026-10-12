"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import ScrambleText from "@/components/ScrambleText/ScrambleText";
import styles from "./WorksPanel.module.css";
import revealStyles from "./WorksReveal.module.css";
import useRevealGroups from "./useRevealGroups";
import { WORKS_NAVIGATE_EVENT, releasePointerFocus } from "./worksNavigation";
import AboutInterests, { SCROLL_FRAME_EVENT } from "./AboutInterests";
import ProjectHoverPreview from "./ProjectHoverPreview";
import { CASE_STUDIES } from "./caseStudies";
import Testimonials from "./Testimonials";

const WHEEL_EASE = 0.2;
const GLIDE_MIN_MS = 600;
const GLIDE_MAX_MS = 1400;
const GLIDE_MS_PER_PX = 0.3;

const TESTIMONIALS = [
  {
    name: "Dr. Harshavardhini",
    role: "Head of Physiotherapy Team",
    avatar: "/images/testimonials/harshavardhini.jpg",
    quote:
      "Aravind is a proactive and logical thinker with a passion for creating exceptional user experience. He always integrates thorough user research into his design process, ensuring that every solution in a deep understanding of user behaviour and preferences. As a problem solver, he consistently delivers innovative and effective solutions that address complex user needs, resulting in user centric designs.",
  },
  {
    name: "Jag Mohan",
    role: "Firmware Engineer",
    quote:
      "Aravind has a remarkable ability to transform complex data and requirements into visually appealing designs that elevate user experience. His talent ensures that our interfaces are engaging and intuitive, turning what could have been mundane spreadsheets into user-friendly experiences.",
  },
  {
    name: "Ashwin",
    role: "Back-end Developer",
    avatar: "/images/testimonials/ashwin.jpg",
    quote:
      "He's one of the best designers I know. His work always shows quality, consistency, and perfection. Aravind consistently delivers top-notch designs for web and mobile apps, always considering both the developer and user experience. His attention to detail and knack for balancing looks with functionality make him a great asset to any team.",
  },
  {
    name: "Vyankatesh",
    role: "Full Stack Developer",
    quote:
      "I am working with Aravind for a year on various projects. He consistently delivers top-notch designs for our web and Android apps, focusing on providing the best user experience. He does user research with patients and designs products based on their needs. His designs are easy to use and understand, making them very helpful for our users.",
  },
];

const LINKEDIN_URL = "https://www.linkedin.com/in/aravind-sriram-786b3a18a";
const WHATSAPP_URL = "https://wa.me/919629371457";

const externalLinkProps = (href) =>
  href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : undefined;

const CONTACT_LINKS = [
  { label: "Whatsapp", href: WHATSAPP_URL },
  { label: "Call", href: "#" },
  { label: "Gmail", href: "mailto:aravindsriram8@gmail.com" },
  { label: "LinkedIn", href: LINKEDIN_URL },
];

const CONTACT_TITLE = [
  { text: "So,", muted: true },
  { text: "Shall" },
  { text: "We?" },
];
const PULL_HOLD = 200;
const PULL_TITLE_HOLD = 200;
const PULL_TITLE_RISE = 200;
const PULL_FRAME_INSET = 32;
const PULL_WORD_STAGGER = 0.15;

const ARSENAL_TITLE = ["My", "Skills,", "and", "Their", "Sob", "Stories"];

const ABOUT_INTERESTS = [
  {
    title: "Mentoring",
    note: "Turns out explaining design teaches you more than doing it.",
    image: "/images/about/interests/mentoring-session.jpg",
  },
  {
    title: "Travel",
    note: "Professionally lost in new cities.",
    image: "/images/about/interests/travel.jpg",
  },
  {
    title: "Hiking",
    note: "Chases views my legs immediately regret.",
    image: "/images/about/interests/hiking-trek.jpg",
  },
  {
    title: "Cricket",
    note: "Has opinions on fielding placements nobody asked for.",
    video: "/videos/about/cricket.mp4",
  },
];

/** Hover stories, keyed by skill card title. `*word*` renders as emphasis. */
const SKILL_STORIES = {
  "User Interview": {
    heading: "Used thoughtfully in physio and fintech",
    sections: [
      {
        label: "Physio App",
        paragraphs: [
          "Neurosurgeons don't give you 30 minutes. So I stopped asking, and started tagging along instead.",
          "No clipboard, no formal interview — just me, quietly shadowing a physio between patients. Turns out people talk more freely when you're not \"the guy taking notes.\" Neuro patients one week, ortho the next — same app, entirely different humans each time.",
        ],
      },
      {
        label: "Fintech App",
        paragraphs: [
          "Slipped in a few sneaky questions between the obvious ones — decoys, really, to get past the rehearsed answers.",
          "\"What's the first thing that comes to mind when I say money?\" told me more about people's fears than any spending habit ever could. Asked about their history with money before I asked about their habits — had to understand what money *meant* to them before I could design around how they used it.",
        ],
      },
    ],
  },
  "White Paper Research": {
    heading: "Used thoughtfully in fintech",
    sections: [
      {
        paragraphs: [
          "Built a UPI app where you could manage money right after paying. Which meant reading actual RBI guidelines, for fun.",
          "I read the RBI and UPI rules before sketching a single screen, so the design stayed inside them.",
        ],
      },
    ],
  },
  "CX Research": {
    heading: "Used thoughtfully in physio and payment",
    sections: [
      {
        label: "Physio App",
        paragraphs: [
          "Couldn't interview anyone. So I just... watched. Suspiciously closely.",
          "Went in for an interview once, doctor never showed. While waiting, I noticed physios running from patient to patient with zero spare seconds — which killed any idea I had of a motion-heavy, pretty UI nobody would have time to look at. Best insight of the project, and I didn't even ask for it.",
        ],
      },
      {
        label: "Payment App",
        paragraphs: [
          "Did the same kind of quiet watching in shops, at checkout counters — wherever a real transaction was actually happening.",
          "Nobody narrates their own behavior accurately. So instead of asking people how they pay, I watched how they actually paid — the fumbling, the hesitation, the habits they didn't know they had.",
        ],
      },
    ],
  },
  "Competitive Analysis": {
    heading: "Non-negotiable, every project",
    sections: [
      {
        paragraphs: [
          "Know the neighborhood before designing the house.",
          "Even with zero overlap, it shows what \"normal\" looks like before I decide to break from it.",
        ],
      },
    ],
  },
  "Information Architecture": {
    heading: "Used across physio, payment, and wellness",
    sections: [
      {
        paragraphs: [
          "Coming out of ideation with a pile of insights and zero idea how to structure them — that's where this part earns its keep.",
          "After ideation, you've got lots of insights but no clear path through them, especially with limited steps or resources to work with. This is where that chaos actually gets untangled into something someone can navigate — organized into clear modules, not just dumped onto a page.",
        ],
      },
    ],
  },
  Wireframing: {
    heading: "Used in every project",
    sections: [
      {
        paragraphs: [
          "Usually sketch, then jump straight to design. Still figuring out if that's a flaw or a flex.",
          "Paper sketch, then straight into high-fidelity. Faster, but a habit worth questioning.",
        ],
      },
    ],
  },
  "Interaction Design": {
    heading: "On Pheezee",
    sections: [
      {
        paragraphs: [
          "Physios were running between patients with no time to watch a screen, so motion had to earn its place. Nothing animated for show. Every transition either saved a tap or told them where they were.",
          "The one place I did lean into motion was for the patient. A graph can't tell someone they're doing great mid-exercise, so I built a stack of arrows that lights up as they move, with the last arrow as the finish line. Nobody has to read anything. The patient just chases the light.",
          "Same discipline both ways: if an interaction doesn't help someone do the thing faster or feel sure about it, it goes.",
        ],
      },
    ],
  },
  Prototyping: {
    heading: "Used in every project",
    sections: [
      {
        paragraphs: [
          "The most fun step, hands down, and criminally underrated.",
          "This is where it stops being theory and starts being something you can click through. Most fancy and most underestimated part of the whole process, in my opinion.",
        ],
      },
    ],
  },
  "Design System": {
    heading: "Used thoughtfully in physio",
    sections: [
      {
        paragraphs: [
          "Built one for Physio Care, just didn't chase it all the way to tokens.",
          "Documented the patterns as the app grew so things stayed consistent. The token system is the honest gap.",
        ],
      },
    ],
  },
  "Responsive Design": {
    heading: "Used in every project",
    sections: [
      {
        paragraphs: [
          "Built once, bent to fit every screen it landed on.",
          "Every project had to hold up across devices, from a phone mid-session to a desktop during a review.",
        ],
      },
    ],
  },
  Accessibility: {
    heading: "Used thoughtfully in physio",
    sections: [
      {
        paragraphs: [
          "Bigger tap targets, better contrast, readable fonts. Built for older eyes and thumbs.",
          "Physio patients skew older, so this was a practical need, not a checklist item.",
        ],
      },
    ],
  },
};

function withEmphasis(text) {
  return text
    .split(/\*([^*]+)\*/)
    .map((part, index) => (index % 2 ? <em key={index}>{part}</em> : part));
}

const SKILL_ROW_CLASS = {
  large: styles.skillRowLarge,
  small: styles.skillRowSmall,
  compact: styles.skillRowCompact,
};

const SKILL_CARD_CLASS = {
  large: styles.skillCardLarge,
  small: styles.skillCardSmall,
  compact: styles.skillCardCompact,
};

const SKILL_ROWS = [
  {
    size: "large",
    cards: [
      {
        title: "User Interview",
        detail: "25+ Interviews",
        icon: "interview",
      },
      { title: "Interaction Design", detail: "Meaningful Interactions", icon: "screens" },
    ],
  },
  {
    size: "small",
    cards: [
      { title: "Prototyping", detail: "Interactive", icon: "prototype" },
      { title: "CX Research", detail: "End to End CX", icon: "cx" },
      { title: "Information Architecture", detail: "20+ modules", icon: "info" },
    ],
  },
  {
    size: "compact",
    cards: [
      { title: "Responsive Design", detail: "Mobile <-> Desktop", icon: "responsive" },
      { title: "Design System", detail: "From Scratch", icon: "system" },
      { title: "Accessibility", detail: "WCAG Aware", icon: "accessibility" },
      { title: "Wireframing", detail: "Rapid Exploration", icon: "wireframe" },
      { title: "Competitive Analysis", detail: "Gap Analysis", icon: "competitive" },
      { title: "White Paper Research", detail: "Domain Deep-Dives", icon: "whitepaper" },
    ],
  },
];

const INDUSTRY_TAGS = [
  "B2B",
  "B2C",
  "B2B2C",
  "Healthcare",
  "Mobility",
  "Fitness",
  "Hospitality",
  "SaaS",
  "Web",
  "Mobile",
  "Dashboards",
  "Design Systems",
];

const TOOL_ROWS = [
  {
    size: "small",
    cards: [
      { title: "Figma", detail: "my longest relationship", icon: "figma" },
      { title: "Framer", detail: "Fast, over-tinkered", icon: "framer" },
      { title: "Cursor", detail: "Building this, quietly", icon: "cursor" },
    ],
  },
  {
    size: "compact",
    cards: [
      { title: "Webflow", detail: "Takes it live", icon: "webflow" },
      { title: "Claude Design", detail: "Ideas, clickable", icon: "claude" },
      { title: "Adobe XD", detail: "Learned, standby", icon: "xd" },
      { title: "Sketch", detail: "Never called on", icon: "sketch" },
      { title: "CodeX", detail: "Second pair of hands", icon: "codex" },
      { title: "Notion", detail: "Graveyard, intentions", icon: "notion" },
    ],
  },
];

/* Brand marks are filled 24×24 paths (Simple Icons); XD and CodeX are drawn to match. */
const TOOL_ICONS = {
  figma: (
    <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z" />
  ),
  framer: <path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z" />,
  cursor: (
    <path d="M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23" />
  ),
  webflow: (
    <path d="m24 4.515-7.658 14.97H9.149l3.205-6.204h-.144C9.566 16.713 5.621 18.973 0 19.485v-6.118s3.596-.213 5.71-2.435H0V4.515h6.417v5.278l.144-.001 2.622-5.277h4.854v5.244h.144l2.72-5.244H24Z" />
  ),
  claude: (
    <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" />
  ),
  xd: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="4" />
      <path d="M7 8.5l4 7M11 8.5l-4 7" />
      <circle cx="14.9" cy="13.4" r="2.1" />
      <path d="M17 7.75v7.75" />
    </g>
  ),
  codex: (
    <path
      fillRule="evenodd"
      d="M12 3.6A4.6 4.6 0 0 1 19.27 7.8A4.6 4.6 0 0 1 19.27 16.2A4.6 4.6 0 0 1 12 20.4A4.6 4.6 0 0 1 4.73 16.2A4.6 4.6 0 0 1 4.73 7.8A4.6 4.6 0 0 1 12 3.6ZM7.3 9.9l1.1-1.1 3.2 3.2-3.2 3.2-1.1-1.1 2.1-2.1ZM12.4 14.3h4.4v1.5h-4.4Z"
    />
  ),
  sketch: (
    <path d="M12 1.25l6.75 6.637V2L12 1.25zm0 0l-6.05 7h12.1l-6.05-7zm0 0L5.25 2v5.887L12 1.25zM5.25 2L0 9l4.416-.68L5.25 2zM0 9l11.959 13.703.008-.014L4.443 9H0zm18.75-7l.834 6.32L24 9l-5.25-7zM24 9h-4.506l-7.523 13.69.029.06L24 9zM12 22.75l-.031-.057-.008.012.039.045zM5.436 9l6.533 13.686L18.564 9H5.436Z" />
  ),
  notion: (
    <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
  ),
};

function ToolIcon({ name }) {
  return (
    <svg
      className={styles.skillIcon}
      viewBox="-2 -2 28 28"
      fill="currentColor"
      aria-hidden="true"
    >
      {TOOL_ICONS[name]}
    </svg>
  );
}

const SKILL_ICONS = {
  interview: (
    <>
      <circle cx="12" cy="5.5" r="2.3" />
      <circle cx="5.5" cy="6.5" r="1.8" />
      <circle cx="18.5" cy="6.5" r="1.8" />
      <path d="M8.5 10.5h7a1 1 0 0 1 1 1V16a4.5 4.5 0 0 1-9 0v-4.5a1 1 0 0 1 1-1z" />
      <path d="M7.5 11H4a1 1 0 0 0-1 1v3a3.5 3.5 0 0 0 4.6 3.3" />
      <path d="M16.5 11H20a1 1 0 0 1 1 1v3a3.5 3.5 0 0 1-4.6 3.3" />
    </>
  ),
  screens: (
    <>
      <path d="M7.5 15h-3A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h4A1.5 1.5 0 0 1 10 4.5v1" />
      <path d="M12 18H9a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 9 5.5h4A1.5 1.5 0 0 1 14.5 7v1" />
      <rect x="12" y="8" width="8" height="13" rx="1.5" />
      <path d="M15 18.5h2" />
    </>
  ),
  prototype: (
    <>
      <rect x="9" y="3" width="11" height="18" rx="2" />
      <path d="M9 5.5H6.5A1.5 1.5 0 0 0 5 7v10a1.5 1.5 0 0 0 1.5 1.5H9" />
      <path d="M14.5 16V8M11.5 11l3-3 3 3" />
    </>
  ),
  cx: (
    <>
      <circle cx="15" cy="7.5" r="3" />
      <path d="M9.5 20v-1.5c0-2.2 2.5-3.8 5.5-3.8s5.5 1.6 5.5 3.8V20z" />
      <path
        d="M5.5 6.5l.76 1.95 2.09.12-1.61 1.33.52 2.03L5.5 10.8l-1.76 1.13.52-2.03-1.61-1.33 2.09-.12z"
        fill="currentColor"
      />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="6" r="1.1" fill="currentColor" stroke="none" />
      <path d="M10.5 10.5h2v8" />
    </>
  ),
  responsive: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="1.5" />
      <g fill="currentColor" stroke="none">
        <rect x="9" y="5" width="6" height="1.5" />
        <rect x="9" y="8" width="6" height="7" />
        <rect x="10.5" y="17.5" width="3" height="1.5" />
      </g>
    </>
  ),
  system: (
    <>
      <rect x="2.5" y="4" width="19" height="12" rx="0.5" />
      <path d="M12 16v4M8 20.5h8" />
      <circle cx="12" cy="10" r="2" />
      <circle cx="12" cy="10" r="3.1" strokeWidth="1.2" strokeDasharray="1.2 1.235" strokeLinecap="butt" />
    </>
  ),
  accessibility: (
    <>
      <circle cx="12" cy="12" r="6" />
      <path
        strokeWidth="1"
        d="M8.82 8.82l6.36 6.36M10.69 7.69l5.62 5.62M7.69 10.69l5.62 5.62M13.94 7.94l2.12 2.12M7.94 13.94l2.12 2.12"
      />
    </>
  ),
  wireframe: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2" />
      <path d="M11 18.5h2" />
    </>
  ),
  competitive: (
    <>
      <circle cx="12" cy="7" r="2.5" />
      <path d="M7 19v-1c0-2 2.2-3.5 5-3.5s5 1.5 5 3.5v1z" />
      <g fill="currentColor" stroke="none">
        <circle cx="5" cy="8.5" r="2" />
        <circle cx="19" cy="8.5" r="2" />
        <path d="M1.5 19v-1c0-1.9 1.5-3.2 4-3.4-.6.8-1 1.8-1 3V19z" />
        <path d="M22.5 19v-1c0-1.9-1.5-3.2-4-3.4.6.8 1 1.8 1 3V19z" />
      </g>
    </>
  ),
  whitepaper: (
    <>
      <rect x="3.5" y="3.5" width="3.5" height="17" />
      <rect x="9.5" y="13.5" width="3" height="7" />
      <rect x="15.5" y="15.5" width="4" height="5" />
      <circle cx="13.5" cy="7" r="3" />
      <path d="M15.7 9.2l2.8 2.8" />
    </>
  ),
};

function SkillIcon({ name }) {
  return (
    <svg
      className={styles.skillIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {SKILL_ICONS[name]}
    </svg>
  );
}

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "arsenal", label: "My Design Arsenal" },
  { id: "about", label: "About" },
  { id: "testimonials", label: "Testimonials" },
];

const PROJECTS = [
  {
    id: "pheezee",
    number: "001",
    title: "PHEEZEE",
    href: CASE_STUDIES.pheezee.href,
    tags: ["RESEARCH", "UX", "FIELD STUDY"],
    src: CASE_STUDIES.pheezee.src,
    preview: CASE_STUDIES.pheezee.preview,
    stackClass: styles.stackCardFront,
    width: 340,
    height: 202,
  },
  {
    id: "rezone",
    number: "002",
    title: "REZONE",
    href: CASE_STUDIES.rezone.href,
    tags: ["INTERFACE"],
    src: CASE_STUDIES.rezone.src,
    preview: CASE_STUDIES.rezone.preview,
    stackClass: styles.stackCardBackLeft,
    width: 340,
    height: 202,
  },
  {
    id: "resort",
    number: "003",
    title: "RESORT",
    href: CASE_STUDIES.resort.href,
    tags: ["INTERFACE", "WEB DESIGN"],
    src: CASE_STUDIES.resort.src,
    preview: CASE_STUDIES.resort.preview,
    stackClass: styles.stackCardMidLeft,
    width: 340,
    height: 202,
  },
  {
    id: "payment-app",
    number: "004",
    title: "PAYMENT APP",
    tags: ["INTERFACE", "RESEARCH"],
    src: "/images/works/stack-ledger.jpg",
    stackClass: styles.stackCardMidRight,
    width: 313,
    height: 202,
  },
];

const EMAIL = "aravindsriram8@gmail.com";

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(EMAIL);
    return true;
  } catch {
    /* navigator.clipboard only exists on HTTPS/localhost */
    const field = document.createElement("textarea");
    field.value = EMAIL;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    field.remove();
    return ok;
  }
}

function SidebarBody({ activeNav, onNavigate, reveal = false, light = false }) {
  const mark = reveal ? { "data-reveal-nav": true } : undefined;
  const iconStyle = light ? "glyph" : "mono";
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(copiedTimerRef.current), []);

  const handleCopy = async () => {
    if (!(await copyEmail())) return;
    setCopied(true);
    clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <>
      <div className={styles.profileCard}>
        <p className={styles.profileName} {...mark}>
          Aravind Sriram
        </p>
        <div className={styles.profileSocial}>
          <a
            href={WHATSAPP_URL}
            {...externalLinkProps(WHATSAPP_URL)}
            className={styles.socialLink}
            aria-label="WhatsApp"
            {...mark}
          >
            <Image src={`/icons/whatsapp-${iconStyle}.svg`} alt="" width={16} height={16} />
          </a>
          <a
            href={LINKEDIN_URL}
            {...externalLinkProps(LINKEDIN_URL)}
            className={styles.socialLink}
            aria-label="LinkedIn"
            {...mark}
          >
            <Image src={`/icons/linkedin-${iconStyle}.svg`} alt="" width={16} height={16} />
          </a>
        </div>
      </div>

      <div className={styles.statsCard}>
        <div className={styles.statBlock} data-count-stat="3">
          <p className={styles.statValue}>
            <span className={styles.statNumber}>
              <span data-count-value>3</span>+
            </span>
          </p>
          <p className={styles.statLabel}>Years</p>
        </div>
        <div className={styles.statBlock} data-count-stat="9">
          <p className={styles.statValue}>
            <span className={styles.statNumber}>
              <span data-count-value>9</span>+
            </span>
          </p>
          <p className={styles.statLabel}>Projects</p>
        </div>
      </div>

      <nav className={styles.navCard} aria-label={reveal ? "Works navigation" : undefined}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={activeNav === item.id ? styles.navItemActive : styles.navItem}
            aria-current={reveal && activeNav === item.id ? "true" : undefined}
            tabIndex={reveal ? undefined : -1}
            onClick={
              reveal
                ? (event) => {
                    releasePointerFocus(event);
                    onNavigate?.(item.id);
                  }
                : undefined
            }
            {...mark}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className={styles.actionCard}>
        <div className={styles.actionRow} {...mark}>
          <div className={styles.actionCopy}>
            <div className={styles.actionTitleRow}>
              <Image src="/icons/gmail.svg" alt="" width={14} height={12} />
              <span>Gmail</span>
            </div>
            <p className={styles.actionSub}>{EMAIL}</p>
          </div>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={copied ? "Email copied" : "Copy email"}
            data-cursor-label={copied ? "Copied" : "Copy"}
            tabIndex={reveal ? undefined : -1}
            onClick={reveal ? handleCopy : undefined}
          >
            {copied ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M2.667 8.667 6 12l7.333-8"
                  stroke="#F5F5F5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <Image src="/images/works/7a213.svg" alt="" width={16} height={16} />
            )}
          </button>
        </div>
        <div className={styles.actionRow} {...mark}>
          <div className={styles.actionCopy}>
            <div className={styles.actionTitleRow}>
              <Image src="/images/works/4299e.svg" alt="" width={15} height={17} />
              <span>Resume</span>
            </div>
          </div>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Download resume"
            tabIndex={reveal ? undefined : -1}
          >
            <Image src="/images/works/928df.svg" alt="" width={16} height={16} />
          </button>
        </div>
      </div>

      <p className={styles.tagsCard} aria-label={INDUSTRY_TAGS.join(", ")}>
        <span className={styles.tagsTrack} aria-hidden="true">
          {[0, 1].map((copy) => (
            <span key={copy} className={styles.tagsLoop}>
              {INDUSTRY_TAGS.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </span>
          ))}
        </span>
      </p>
    </>
  );
}

function ContactPullLink({ link }) {
  const scrambleRef = useRef(null);

  return (
    <a
      href={link.href}
      {...externalLinkProps(link.href)}
      className={styles.contactPullLink}
      data-cursor-label="Let’s Talk"
      tabIndex={-1}
      onMouseEnter={(event) => {
        if (event.currentTarget.closest("[data-open]")) scrambleRef.current?.scramble();
      }}
      onMouseLeave={() => scrambleRef.current?.reset()}
    >
      <span className={styles.contactPullFrame} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      <span className={styles.contactLink} data-pull-label>
        <ScrambleText ref={scrambleRef} text={link.label} externalTrigger />
      </span>
    </a>
  );
}

export default function WorksPanel() {
  const mainRef = useRef(null);
  const arsenalRef = useRef(null);
  const aboutRef = useRef(null);
  const aboutPhotoRef = useRef(null);
  const testimonialsRef = useRef(null);
  const headerRef = useRef(null);
  const layoutRef = useRef(null);
  const sidebarLightRef = useRef(null);
  const contactRunwayRef = useRef(null);
  const contactPullRef = useRef(null);
  const navigateRef = useRef(null);
  const [activeNav, setActiveNav] = useState("projects");

  useRevealGroups({ rootRef: mainRef });

  // CSS :hover only catches up once scrolling settles, so the photo's colour
  // follows the pointer through every scroll frame too.
  useEffect(() => {
    const photo = aboutPhotoRef.current;
    if (!photo) return undefined;
    let pointer = null;
    const sync = () => {
      const hit = pointer && document.elementFromPoint(pointer.x, pointer.y);
      photo.toggleAttribute("data-hover", Boolean(hit) && photo.contains(hit));
    };
    const onPointerMove = (event) => {
      if (event.pointerType !== "mouse") return;
      pointer = { x: event.clientX, y: event.clientY };
      sync();
    };
    const onPointerOut = (event) => {
      if (event.relatedTarget) return;
      pointer = null;
      sync();
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", onPointerOut);
    document.addEventListener("scroll", sync, { capture: true, passive: true });
    document.addEventListener(SCROLL_FRAME_EVENT, sync, { capture: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("scroll", sync, { capture: true });
      document.removeEventListener(SCROLL_FRAME_EVENT, sync, { capture: true });
    };
  }, []);

  useEffect(() => {
    const main = mainRef.current;
    const arsenal = arsenalRef.current;
    const about = aboutRef.current;
    const testimonials = testimonialsRef.current;
    const header = headerRef.current;
    const layout = layoutRef.current;
    const sidebarLight = sidebarLightRef.current;
    const runway = contactRunwayRef.current;
    const pullBox = contactPullRef.current;
    const wash = layout?.querySelector("[data-about-wash]");
    const headerLight = header?.querySelector("[data-about-header]");
    const contactBar = testimonials?.querySelector("nav");
    const pullTitle = pullBox?.querySelector("[data-pull-title]");
    const pullWords = pullBox ? [...pullBox.querySelectorAll("[data-pull-word]")] : [];
    const pullLinks = pullBox?.querySelector("[data-pull-links]");
    const pullLabels = pullBox ? [...pullBox.querySelectorAll("[data-pull-label]")] : [];
    const barLinks = contactBar ? [...contactBar.children] : [];
    if (
      !main ||
      !arsenal ||
      !about ||
      !testimonials ||
      !header ||
      !layout ||
      !sidebarLight ||
      !runway ||
      !pullBox ||
      !contactBar ||
      !pullTitle ||
      !pullLinks
    ) {
      return undefined;
    }

    // Past the testimonials, the section pins and, after a hold of about two
    // wheel notches, the contact bar grows up over the whole panel, its links
    // riding the middle and the title the top. Once open, the links' hover
    // frames switch on and, after another short hold, the title scrolls away.
    const updateContactPull = (mainRect) => {
      const mainHeight = main.clientHeight;
      const barHeight = contactBar.offsetHeight;
      const pullHeight = Math.max(0, mainHeight - barHeight);
      const titleBottom = pullTitle.offsetTop + pullTitle.offsetHeight;
      const runwayPx = `${PULL_HOLD + pullHeight + PULL_TITLE_HOLD + titleBottom}px`;
      if (runway.style.height !== runwayPx) runway.style.height = runwayPx;

      const pinTop = Math.min(0, mainHeight - testimonials.offsetHeight);
      testimonials.style.top = `${pinTop}px`;
      const trackTop = runway.parentElement.getBoundingClientRect().top - mainRect.top;
      const travel = pinTop - trackTop - PULL_HOLD;
      const pull = Math.min(Math.max(travel, 0), pullHeight);
      const exit = Math.min(
        Math.max(travel - pullHeight - PULL_TITLE_HOLD, 0),
        titleBottom,
      );

      pullBox.style.left = `${main.offsetLeft}px`;
      pullBox.style.top = `${main.offsetTop}px`;
      pullBox.style.width = `${main.clientWidth}px`;
      pullBox.style.height = `${mainHeight}px`;
      pullBox.style.visibility = pull >= 1 ? "visible" : "hidden";
      pullBox.toggleAttribute("data-open", pull >= pullHeight - 1);

      const edge = mainHeight - barHeight - pull;
      const visible = mainHeight - edge;
      pullBox.style.clipPath = `inset(${edge}px 0 0 0)`;
      pullLinks.style.transform = `translateY(${edge / 2}px)`;
      pullTitle.style.transform = `translateY(${edge - exit}px)`;

      // Hover frames start below the title while it is still on screen.
      const frameTop = Math.max(PULL_FRAME_INSET, titleBottom + edge - exit + PULL_FRAME_INSET);
      pullLinks.style.setProperty("--frame-top", `${frameTop - edge / 2}px`);

      // Labels start where the bar has them and settle into their columns.
      const spread = pullHeight ? 1 - pull / pullHeight : 0;
      pullLabels.forEach((label, index) => {
        const barLink = barLinks[index];
        if (!barLink) return;
        const from = barLink.offsetLeft + barLink.offsetWidth / 2;
        const to =
          label.parentElement.offsetLeft + label.offsetLeft + label.offsetWidth / 2;
        label.style.transform = `translateX(${(from - to) * spread}px)`;
      });

      // The title waits until the links have dropped clear of it.
      const riseStart = titleBottom * 2 + barHeight;
      pullWords.forEach((word, index) => {
        const linear = Math.min(
          1,
          Math.max(0, (visible - riseStart) / PULL_TITLE_RISE - index * PULL_WORD_STAGGER),
        );
        const eased = 1 - (1 - linear) ** 3;
        word.style.transform = `translateY(${(1 - eased) * 110}%)`;
      });
    };

    const updateActiveNav = () => {
      const mainRect = main.getBoundingClientRect();
      const title = arsenal.querySelector("[data-arsenal-title]");
      const titleHeight = title?.getBoundingClientRect().height ?? 0;
      const sweepStart = Math.max(0, (mainRect.height - titleHeight) / 2);
      const arsenalTop = arsenal.getBoundingClientRect().top - mainRect.top;
      const aboutRect = about.getBoundingClientRect();
      const aboutEntered = aboutRect.top <= mainRect.top + mainRect.height * 0.55;
      const testimonialsTop = testimonials.getBoundingClientRect().top;
      const testimonialsEntered =
        testimonialsTop <= mainRect.top + mainRect.height * 0.55;
      const next = testimonialsEntered
        ? "testimonials"
        : aboutEntered
          ? "about"
          : arsenalTop <= sweepStart
          ? "arsenal"
          : "projects";
      setActiveNav((current) => (current === next ? current : next));

      const distance = 140;
      const linear = Math.min(1, Math.max(0, (sweepStart - arsenalTop) / distance));
      const fade = linear * linear * (3 - 2 * linear);
      header.style.setProperty("--header-swap", fade.toFixed(3));

      about.style.minHeight = `${main.clientHeight}px`;
      testimonials.style.minHeight = `${main.clientHeight}px`;

      const layoutRect = layout.getBoundingClientRect();
      const arrived = aboutRect.top <= mainRect.top + 1;
      const washTop = arrived
        ? 0
        : Math.min(Math.max(aboutRect.top - layoutRect.top, 0), layoutRect.height);
      const washClip = `inset(${washTop}px 0 0 0)`;
      if (wash) wash.style.clipPath = washClip;

      const sidebarRect = sidebarLight.getBoundingClientRect();
      const sidebarTop = Math.min(
        Math.max(aboutRect.top - sidebarRect.top, 0),
        sidebarRect.height,
      );
      sidebarLight.style.clipPath = `inset(${sidebarTop}px 0 0 0)`;

      if (headerLight) {
        const headerRect = header.getBoundingClientRect();
        const headerTop = Math.min(
          Math.max(aboutRect.top - headerRect.top, 0),
          headerRect.height,
        );
        headerLight.style.clipPath = `inset(${headerTop}px 0 0 0)`;

        const swapAt = headerRect.bottom + mainRect.height * 0.2;
        const lightLinear = Math.min(1, Math.max(0, (swapAt - testimonialsTop) / distance));
        const lightFade = lightLinear * lightLinear * (3 - 2 * lightLinear);
        headerLight.style.setProperty("--header-swap", lightFade.toFixed(3));
      }

      updateContactPull(mainRect);
    };

    // Native wheel scrolling runs ahead of scroll events, so the light layers
    // trail the About edge. Driving the wheel here keeps both in one frame.
    const desktop = window.matchMedia("(min-width: 961px)");
    let target = main.scrollTop;
    let current = target;
    let wheelFrame = 0;

    const stepWheel = () => {
      const diff = target - current;
      current = Math.abs(diff) < 0.5 ? target : current + diff * WHEEL_EASE;
      main.scrollTop = current;
      updateActiveNav();
      main.dispatchEvent(new Event(SCROLL_FRAME_EVENT));
      wheelFrame = current === target ? 0 : requestAnimationFrame(stepWheel);
    };

    // Once the curtain starts rising, the wheel anywhere on the page drives the
    // main column. The page only moves while the curtain is still rising, or
    // when backing out past the top, and never past the point where the
    // curtain is fully open, so it can't be left half drawn.
    const section = layout.closest("#works");
    const onWheel = (event) => {
      if (!desktop.matches || event.ctrlKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (!section || section.getBoundingClientRect().top >= window.innerHeight - 1) return;
      const story = event.target.closest?.("[data-skill-story]");
      if (story && Number(getComputedStyle(story).opacity) > 0.5) {
        const canScroll =
          event.deltaY > 0
            ? story.scrollTop + story.clientHeight < story.scrollHeight - 1
            : story.scrollTop > 0;
        if (canScroll) return;
      }
      const unit =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? main.clientHeight : 1;
      const delta = event.deltaY * unit;
      const max = main.scrollHeight - main.clientHeight;
      if (!wheelFrame) {
        target = main.scrollTop;
        current = target;
      }
      event.preventDefault();

      const locked = main.style.overflowY === "hidden";
      if (locked || (delta < 0 && target <= 0)) {
        const toOpen = Math.max(section?.getBoundingClientRect().top ?? 0, 0);
        window.scrollBy(0, delta > 0 ? Math.min(delta, toOpen) : delta);
        return;
      }

      target = Math.min(Math.max(target + delta, 0), max);
      if (!wheelFrame) wheelFrame = requestAnimationFrame(stepWheel);
    };

    // Sidebar links glide the main column to where each section reads as
    // arrived: the arsenal once its title is fully white, the testimonials
    // once they reach the top, and About with its title at the same height as
    // the testimonials title. A wheel turn takes over mid-glide.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let glideFrame = 0;
    const offsetInMain = (element) =>
      main.scrollTop + element.getBoundingClientRect().top - main.getBoundingClientRect().top;
    const titleInset = (element) => {
      const title = element.querySelector("h2");
      return title ? title.getBoundingClientRect().top - element.getBoundingClientRect().top : 0;
    };
    const navTargets = {
      projects: () => 0,
      arsenal: () => {
        const pin = arsenal.querySelector("[data-arsenal-pin]");
        const hold = Number.parseFloat(pin?.style.top) || 0;
        const sweep = Math.max(0, arsenal.offsetHeight - (pin?.offsetHeight ?? 0));
        return offsetInMain(arsenal) - hold + sweep;
      },
      about: () =>
        offsetInMain(about) + Math.max(0, titleInset(about) - titleInset(testimonials)),
      testimonials: () => offsetInMain(testimonials.parentElement),
    };

    const glideMain = (to) => {
      cancelAnimationFrame(wheelFrame);
      wheelFrame = 0;
      cancelAnimationFrame(glideFrame);
      const from = main.scrollTop;
      const distance = to - from;
      if (Math.abs(distance) < 1) return;
      const duration = reducedMotion.matches
        ? 0
        : Math.min(GLIDE_MAX_MS, Math.max(GLIDE_MIN_MS, Math.abs(distance) * GLIDE_MS_PER_PX));
      const start = performance.now();
      const step = (now) => {
        const t = duration ? Math.min(1, (now - start) / duration) : 1;
        const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
        main.scrollTop = from + distance * eased;
        target = main.scrollTop;
        current = target;
        updateActiveNav();
        main.dispatchEvent(new Event(SCROLL_FRAME_EVENT));
        glideFrame = t < 1 ? requestAnimationFrame(step) : 0;
      };
      glideFrame = requestAnimationFrame(step);
    };

    navigateRef.current = (id) => {
      const behavior = reducedMotion.matches ? "auto" : "smooth";
      if (id === "home") {
        window.scrollTo({ top: 0, behavior });
        return;
      }
      const resolve = navTargets[id];
      if (!resolve) return;
      if (section) {
        const sectionTop = section.getBoundingClientRect().top;
        if (Math.abs(sectionTop) > 1) {
          window.scrollTo({ top: window.scrollY + sectionTop, behavior });
        }
      }
      const max = main.scrollHeight - main.clientHeight;
      glideMain(Math.min(Math.max(resolve(), 0), max));
    };

    const onNavigateRequest = (event) => navigateRef.current?.(event.detail);

    const onGlideInterrupt = () => {
      if (!glideFrame) return;
      cancelAnimationFrame(glideFrame);
      glideFrame = 0;
    };

    const onScroll = () => {
      if (!wheelFrame && !glideFrame) updateActiveNav();
    };

    updateActiveNav();
    window.addEventListener("wheel", onGlideInterrupt, { capture: true, passive: true });
    window.addEventListener("touchstart", onGlideInterrupt, { passive: true });
    window.addEventListener(WORKS_NAVIGATE_EVENT, onNavigateRequest);
    main.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", updateActiveNav);
    return () => {
      cancelAnimationFrame(wheelFrame);
      cancelAnimationFrame(glideFrame);
      navigateRef.current = null;
      window.removeEventListener("wheel", onGlideInterrupt, { capture: true });
      window.removeEventListener("touchstart", onGlideInterrupt);
      window.removeEventListener(WORKS_NAVIGATE_EVENT, onNavigateRequest);
      main.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", updateActiveNav);
    };
  }, []);

  return (
    <div className={styles.layout} ref={layoutRef}>
      <div className={styles.aboutWash} data-about-wash aria-hidden="true" />
      <aside className={styles.sidebar} aria-label="Works sidebar">
        <SidebarBody
          activeNav={activeNav}
          onNavigate={(id) => navigateRef.current?.(id)}
          reveal
        />
        <div className={styles.sidebarLight} ref={sidebarLightRef} aria-hidden="true" inert>
          <SidebarBody activeNav={activeNav} light />
        </div>
      </aside>

      <div className={styles.main} data-works-main ref={mainRef}>
        <header className={styles.mainHeader} ref={headerRef}>
          <div className={styles.headerSlot} data-mask-label="projects">
            <p className={styles.headerLine}>[Projects]</p>
            <p className={`${styles.headerLine} ${styles.headerLineNext}`}>
              [My design arsenal]
            </p>
          </div>
          <div className={`${styles.headerSlot} ${styles.headerSlotEnd}`}>
            <p className={styles.headerLine}>Careful, someone just cooked hard!</p>
            <p className={`${styles.headerLine} ${styles.headerLineNext}`}>
              Just a few ingredients worth flaunting
            </p>
          </div>
          <div className={styles.headerLight} data-about-header aria-hidden="true">
            <div className={styles.headerSlot}>
              <p className={styles.headerLine}>[About]</p>
              <p className={`${styles.headerLine} ${styles.headerLineNext}`}>[Testimonials]</p>
            </div>
            <div className={`${styles.headerSlot} ${styles.headerSlotEnd}`}>
              <p className={styles.headerLine}>Meet the Culprit</p>
              <p className={`${styles.headerLine} ${styles.headerLineNext}`}>
                I Didn&apos;t pay them
              </p>
            </div>
          </div>
        </header>

        <div className={styles.heroRow}>
          <div className={styles.heroCopy} data-hero-copy>
            <h2 className={styles.heroTitle} aria-label="Things I have Shipped">
              <span
                className={`${styles.heroTitleLine} ${styles.heroTitleLineMuted}`}
                data-line-reveal
                data-reveal-context="title"
                data-reveal-single-line="true"
              >
                Things I have
              </span>
              <span
                className={`${styles.heroTitleLine} ${styles.heroTitleLineAccent}`}
                data-line-reveal
                data-reveal-context="title"
                data-reveal-single-line="true"
              >
                Shipped
              </span>
            </h2>
            <p className={styles.heroBody} data-line-reveal data-reveal-context="body">
              Three-plus years of turning &ldquo;this is confusing&rdquo; into
              &ldquo;oh, that&apos;s obvious.&rdquo; Healthcare, hospitality,
              mobility, wellness — different worlds, same instinct: simplify
              first, decorate later.
            </p>
          </div>

          <div className={styles.stackStage} data-stack-stage>
            <div className={styles.stack} data-stack-root>
              {PROJECTS.map((project) => {
                const CardInner = project.href ? "a" : "div";
                const link = project.href
                  ? {
                      href: project.href,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    }
                  : {};
                return (
                  <article
                    key={project.id}
                    data-project-card
                    className={`${styles.projectCard} ${project.stackClass}`}
                  >
                    <CardInner
                      className={styles.projectCardInner}
                      data-cursor-label={project.href ? "View" : "Coming soon"}
                      data-cursor-marquee={project.href ? undefined : ""}
                      {...link}
                    >
                      <div className={styles.projectCardMedia}>
                        <Image
                          src={project.src}
                          alt=""
                          width={project.width}
                          height={project.height}
                          className={styles.stackImage}
                        />
                      </div>
                      {project.preview && <ProjectHoverPreview preview={project.preview} />}
                      <div className={styles.projectCardMeta} data-project-meta>
                        <p className={styles.projectNumber}>[{project.number}]</p>
                        <h3 className={styles.projectTitle}>{project.title}</h3>
                        <ul className={styles.projectTags} aria-label="Project tags">
                          {project.tags.map((tag) => (
                            <li key={tag} className={styles.projectTag}>
                              {tag}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardInner>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        <section
          ref={arsenalRef}
          className={styles.arsenal}
          data-design-arsenal
          aria-label="My Design Arsenal"
        >
          <div
            className={styles.arsenalPin}
            data-arsenal-pin
            data-reveal-group
            data-reveal-chain="arsenal-intro"
          >
            <h2 className={styles.arsenalTitle} data-arsenal-title>
              {ARSENAL_TITLE.map((word, index) => (
                <Fragment key={word}>
                  <span className={`${styles.arsenalWord} ${revealStyles.titleWordMask}`}>
                    <span className={revealStyles.wordInner} data-reveal-word>
                      {Array.from(word).map((char, charIndex) => (
                        <span key={`${word}-${charIndex}`} data-arsenal-char>
                          {char}
                        </span>
                      ))}
                    </span>
                  </span>
                  {index < ARSENAL_TITLE.length - 1 ? " " : null}
                </Fragment>
              ))}
            </h2>
            <p
              className={styles.arsenalBody}
              data-reveal-group
              data-reveal-chain="arsenal-intro"
              data-reveal-text="body"
            >
              The skills? The usual suspects. The tools? You&apos;ll see. The
              stories? huh! That&apos;s a whole thing — grab a seat for Part 1
              and Part 2. You&apos;ll need it for the plot.
            </p>
          </div>
        </section>

        <section
          className={styles.skillBoard}
          aria-label="Design and research"
          data-reveal-group
        >
          <h3 className={styles.skillBoardLabel} data-reveal-text="body">
            Design &amp; Research
          </h3>
          <div className={styles.skillRows}>
            {SKILL_ROWS.map((row) => (
              <div
                key={row.size}
                className={SKILL_ROW_CLASS[row.size]}
                data-reveal-group
              >
                {row.cards.map((card, index) => {
                  const story = SKILL_STORIES[card.title];
                  return (
                    <div
                      key={`${row.size}-${card.title}-${index}`}
                      className={styles.skillCardMask}
                    >
                      <article
                        data-reveal-rise={index}
                        className={[
                          styles.skillCard,
                          SKILL_CARD_CLASS[row.size],
                          story ? styles.skillCardStory : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <span className={styles.skillCorners} aria-hidden="true">
                          <span />
                          <span />
                          <span />
                          <span />
                        </span>
                        <div className={styles.skillFace}>
                          <SkillIcon name={card.icon} />
                          <h4 className={styles.skillCardTitle}>{card.title}</h4>
                          <p className={styles.skillCardDetail}>{card.detail}</p>
                        </div>
                        {story ? (
                          <div className={styles.skillStory} data-skill-story>
                            <p className={styles.skillStoryTitle}>{story.heading}</p>
                            {story.sections.map((section, sectionIndex) => (
                              <div key={sectionIndex} className={styles.skillStorySection}>
                                {section.label ? (
                                  <p className={styles.skillStoryLabel}>{section.label}</p>
                                ) : null}
                                {section.paragraphs.map((paragraph) => (
                                  <p key={paragraph} className={styles.skillStoryBody}>
                                    {withEmphasis(paragraph)}
                                  </p>
                                ))}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </article>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.toolBoard} aria-label="Tools" data-reveal-group>
          <h3 className={styles.skillBoardLabel} data-reveal-text="body">
            Tools
          </h3>
          <div className={styles.skillRows}>
            {TOOL_ROWS.map((row) => (
              <div key={row.size} className={SKILL_ROW_CLASS[row.size]} data-reveal-group>
                {row.cards.map((card, index) => (
                  <div key={`${row.size}-${card.title}-${index}`} className={styles.skillCardMask}>
                    <article
                      data-reveal-rise={index}
                      className={`${styles.skillCard} ${SKILL_CARD_CLASS[row.size]}`}
                    >
                      <ToolIcon name={card.icon} />
                      <h4 className={styles.skillCardTitle}>{card.title}</h4>
                      <p className={styles.skillCardDetail}>{card.detail}</p>
                    </article>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section
          className={styles.about}
          data-about-section
          data-reveal-group
          data-reveal-chain="about-intro"
          ref={aboutRef}
          aria-label="About"
        >
          <h2 className={styles.aboutTitle} data-reveal-text="title">
            <span className={styles.aboutInk}>Curiosity </span>
            <span className={styles.aboutFog}>got me in trouble growing up. Now it </span>
            <span className={styles.aboutInk}>pays my rent.</span>
          </h2>
          <p
            className={styles.aboutBody}
            data-reveal-group
            data-reveal-chain="about-intro"
            data-reveal-text="body"
          >
            Turns out asking &lsquo;why&rsquo; one question too many, and reading
            people a little too well, is basically design&apos;s entire job
            description. Got here the scenic route — biology, engineering, a
            developer detour — before UI/UX finally clicked and stuck. I also
            taught it, through a Tamil Nadu government initiative, watching
            students go from &lsquo;what&apos;s a wireframe&rsquo; to shipping
            real apps. Ten out of ten, would detour again.
          </p>
          <div className={styles.aboutLower} data-reveal-group data-reveal-chain="about-lower">
            <div className={styles.aboutPhoto} ref={aboutPhotoRef}>
              <div className={styles.aboutPhotoFill} data-reveal-rise="0">
                <Image
                  src="/images/about/aravind-paris-bw.jpg"
                  alt="Aravind Sriram smiling in front of the Eiffel Tower"
                  fill
                  sizes="(max-width: 960px) 100vw, 40vw"
                  className={styles.aboutPhotoImage}
                />
                <Image
                  src="/images/about/aravind-paris-color.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 960px) 100vw, 40vw"
                  className={`${styles.aboutPhotoImage} ${styles.aboutPhotoColor}`}
                />
              </div>
            </div>
            <div className={styles.aboutAside}>
              <h3 className={styles.aboutAsideTitle} data-reveal-text="body">
                When I&apos;m not asking why
              </h3>
              <AboutInterests interests={ABOUT_INTERESTS} />
            </div>
          </div>
        </section>

        <div className={styles.testimonialsTrack}>
          <section
            className={styles.testimonials}
            ref={testimonialsRef}
            aria-label="Testimonials"
            data-reveal-group
          >
            <h2 className={styles.testimonialsTitle} data-reveal-text="title">
              <span className={styles.aboutFog}>What It&apos;s Like to </span>
              <span className={styles.aboutInk}>Work Together</span>
            </h2>
            <Testimonials items={TESTIMONIALS} />
            <nav
              className={styles.contactBar}
              aria-label="Contact"
              data-reveal-group
              data-reveal-margin="0px"
            >
              {CONTACT_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  {...externalLinkProps(link.href)}
                  className={styles.contactLink}
                  data-cursor-label="Let’s Talk"
                  data-reveal-text="body"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </section>
          <div ref={contactRunwayRef} aria-hidden="true" />
        </div>
      </div>

      <div className={styles.contactPull} ref={contactPullRef} aria-hidden="true">
        <h2 className={styles.contactPullTitle} data-pull-title>
          {CONTACT_TITLE.map((word, index) => (
            <Fragment key={word.text}>
              <span className={revealStyles.titleWordMask}>
                <span
                  className={`${revealStyles.wordInner} ${word.muted ? styles.contactPullFog : ""}`}
                  data-pull-word
                >
                  {word.text}
                </span>
              </span>
              {index < CONTACT_TITLE.length - 1 ? " " : null}
            </Fragment>
          ))}
        </h2>
        <div className={styles.contactPullLinks} data-pull-links>
          {CONTACT_LINKS.map((link) => (
            <ContactPullLink key={link.label} link={link} />
          ))}
        </div>
      </div>
    </div>
  );
}
