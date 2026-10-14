"use client";

import { useRef } from "react";
import Image from "next/image";
import NavItemBrackets from "@/components/NavItemBrackets/NavItemBrackets";
import ScrambleText from "@/components/ScrambleText/ScrambleText";
import styles from "./Hero.module.css";

const SOCIAL_LINKS = [
  {
    href: "mailto:aravindsriram8@gmail.com",
    label: "Gmail",
    src: "/icons/gmail.svg",
    width: 18,
    height: 16,
  },
  {
    href: "https://wa.me/919629371457",
    label: "WhatsApp",
    src: "/icons/whatsapp.svg",
    width: 16,
    height: 16,
  },
  {
    href: "https://www.linkedin.com/in/aravind-sriram-786b3a18a",
    label: "LinkedIn",
    src: "/icons/linkedin.svg",
    width: 16,
    height: 16,
  },
];

export default function GetInTouchNavItem() {
  const scrambleRef = useRef(null);

  return (
    <div className={styles.navCell} data-align="end">
      <div
        className={styles.getInTouchHit}
        onMouseEnter={() => scrambleRef.current?.scramble()}
        onMouseLeave={() => scrambleRef.current?.reset()}
      >
        <div className={styles.getInTouchAnchor}>
          <div className={styles.getInTouchSocialTrack}>
            {SOCIAL_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                {...(item.href.startsWith("http") && {
                  target: "_blank",
                  rel: "noopener noreferrer",
                })}
                className={styles.getInTouchIconLink}
                aria-label={item.label}
              >
                <Image
                  src={item.src}
                  alt=""
                  width={item.width}
                  height={item.height}
                  className={styles.getInTouchIconImg}
                />
              </a>
            ))}
          </div>
          <div className={`${styles.navHoverCore} ${styles.getInTouchHoverCore}`}>
            <NavItemBrackets className={styles.navHoverBrackets} />
            <button
              type="button"
              className={`${styles.navHoverButton} ${styles.navHoverButtonCenter}`}
            >
              <ScrambleText
                ref={scrambleRef}
                text="Get In Touch"
                externalTrigger
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
