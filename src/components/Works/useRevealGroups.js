"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import revealStyles from "./WorksReveal.module.css";

const LINE_DURATION = 0.6;
const LINE_STAGGER = 0.1;
const ENTER_DELAY = 0.5;
const CHAIN_GAP = 0.2;
/* Enter once the first line is on screen, not a sliver at the bottom edge. */
const ENTER_MARGIN = "0px 0px -24px 0px";

/*
 * Masked rise for every [data-reveal-group] inside the scroller. Each group
 * plays once when its first element enters. Inside a group:
 *   [data-reveal-text="title|body"]  text split into word masks, risen line by line
 *   [data-reveal-word]               an already-masked word, risen with the text lines
 *   [data-reveal-rise="n"]           a block in its own overflow mask, risen n staggers in
 * Elements belong to their nearest group, so groups can nest. A group at the
 * very end of the scroller sets data-reveal-margin, since it can never rise
 * past the default enter line. A group whose first element moves on its own
 * sets data-reveal-trigger="self" to be watched itself instead.
 * data-reveal-delay overrides the wait after entering, in seconds. Groups
 * with the same data-reveal-chain play one after another. data-reveal-pace
 * scales a group's rise, stagger and chain gap (0.5 plays it twice as fast).
 */

function splitIntoWordMasks(element) {
  const maskClass =
    element.dataset.revealText === "title"
      ? revealStyles.titleWordMask
      : revealStyles.bodyWordMask;
  const original = element.innerHTML;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  const inners = [];
  textNodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    node.data.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        fragment.appendChild(document.createTextNode(part));
        return;
      }
      const mask = document.createElement("span");
      mask.className = maskClass;
      const inner = document.createElement("span");
      inner.className = revealStyles.wordInner;
      inner.textContent = part;
      mask.appendChild(inner);
      fragment.appendChild(mask);
      inners.push(inner);
    });
    node.replaceWith(fragment);
  });

  return {
    inners,
    restore: () => {
      element.innerHTML = original;
    },
  };
}

function inDocumentOrder(a, b) {
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

function groupIntoLines(inners) {
  const lines = [];
  let lastTop = null;
  inners.forEach((inner) => {
    const top = inner.parentElement.getBoundingClientRect().top;
    if (lastTop === null || Math.abs(top - lastTop) > 2) {
      lines.push([]);
      lastTop = top;
    }
    lines[lines.length - 1].push(inner);
  });
  return lines;
}

function rise(timeline, targets, position, pace) {
  timeline.fromTo(
    targets,
    { y: "110%" },
    { y: "0%", duration: LINE_DURATION * pace, ease: "power3.out" },
    position,
  );
}

export default function useRevealGroups({ rootRef }) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return undefined;
    }

    const groups = [...root.querySelectorAll("[data-reveal-group]")];
    const own = (group, selector) =>
      [
        ...(group.matches(selector) ? [group] : []),
        ...group.querySelectorAll(selector),
      ].filter((el) => el.closest("[data-reveal-group]") === group);

    const entries = groups
      .map((group) => {
        const texts = own(group, "[data-reveal-text]");
        const words = own(group, "[data-reveal-word]");
        const risers = own(group, "[data-reveal-rise]");
        // Words and risers start clipped by their masks, so watch the mask.
        const first = [
          ...texts,
          ...[...words, ...risers].map((el) => el.parentElement),
        ].sort(inDocumentOrder)[0];
        const trigger = first && group.dataset.revealTrigger === "self" ? group : first;
        const splits = texts.map(splitIntoWordMasks);
        const inners = [...splits.flatMap((split) => split.inners), ...words].sort(
          inDocumentOrder,
        );
        const margin = group.dataset.revealMargin || ENTER_MARGIN;
        const chain = group.dataset.revealChain;
        const delay = Number(group.dataset.revealDelay ?? ENTER_DELAY);
        const pace = Number(group.dataset.revealPace ?? 1);
        return { trigger, margin, chain, delay, pace, ready: false, splits, inners, risers };
      })
      .filter((entry) => entry.trigger);

    const targets = entries.flatMap((entry) => [...entry.inners, ...entry.risers]);
    gsap.set(targets, { y: "110%" });

    const play = ({ inners, risers, pace }, delay) => {
      const tl = gsap.timeline({ delay });
      const stagger = LINE_STAGGER * pace;
      risers.forEach((riser) => {
        rise(tl, riser, Number(riser.dataset.revealRise || 0) * stagger, pace);
      });
      groupIntoLines(inners).forEach((line, index) => {
        rise(tl, line, index === 0 ? 0 : `<${stagger}`, pace);
      });
    };

    // Groups sharing a chain play in document order, each at least CHAIN_GAP
    // after the one before, however fast they scroll in.
    const chains = new Map();
    entries.forEach((entry) => {
      if (!entry.chain) return;
      if (!chains.has(entry.chain)) {
        chains.set(entry.chain, { members: [], next: 0, lastStart: -Infinity });
      }
      chains.get(entry.chain).members.push(entry);
    });

    const enter = (entry) => {
      if (!entry.chain) {
        play(entry, entry.delay);
        return;
      }
      entry.ready = true;
      const chain = chains.get(entry.chain);
      while (chain.members[chain.next]?.ready) {
        const member = chain.members[chain.next];
        const now = performance.now() / 1000;
        const start = Math.max(now + member.delay, chain.lastStart + CHAIN_GAP * member.pace);
        play(member, start - now);
        chain.lastStart = start;
        chain.next += 1;
      }
    };

    const byTrigger = new Map(entries.map((entry) => [entry.trigger, entry]));
    const observers = new Map();
    entries.forEach(({ trigger, margin }) => {
      if (!observers.has(margin)) {
        const observer = new IntersectionObserver(
          (observed) => {
            observed.forEach(({ isIntersecting, target }) => {
              if (!isIntersecting) return;
              observer.unobserve(target);
              enter(byTrigger.get(target));
            });
          },
          { root, rootMargin: margin, threshold: 0 },
        );
        observers.set(margin, observer);
      }
      observers.get(margin).observe(trigger);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
      gsap.killTweensOf(targets);
      gsap.set(targets, { clearProps: "transform" });
      entries.forEach((entry) => entry.splits.forEach((split) => split.restore()));
    };
  }, [rootRef]);
}
