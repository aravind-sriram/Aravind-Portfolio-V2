export function restoreSplitTextLines(element) {
  if (!element || element.dataset.linesSplit !== "true") {
    return;
  }

  element.textContent = element.dataset.linesOriginal ?? "";
  delete element.dataset.linesSplit;
  delete element.dataset.linesOriginal;
}

export function splitTextElementIntoLines(element, maskClass, innerClass) {
  if (!element) {
    return [];
  }

  if (element.dataset.linesSplit === "true") {
    return [...element.querySelectorAll("[data-mask-line]")];
  }

  const text = element.textContent?.trim() ?? "";
  if (!text) {
    return [];
  }

  if (element.dataset.revealSingleLine === "true") {
    element.dataset.linesOriginal = text;
    element.textContent = "";
    element.dataset.linesSplit = "true";

    const mask = document.createElement("span");
    mask.className = maskClass;

    const inner = document.createElement("span");
    inner.className = innerClass;
    inner.dataset.maskLine = "true";
    inner.textContent = text;

    mask.appendChild(inner);
    element.appendChild(mask);

    return [inner];
  }

  const words = text.split(/\s+/);
  const width = element.offsetWidth;
  const computed = window.getComputedStyle(element);
  const measure = document.createElement("span");
  measure.style.position = "absolute";
  measure.style.visibility = "hidden";
  measure.style.whiteSpace = "nowrap";
  measure.style.font = computed.font;
  measure.style.letterSpacing = computed.letterSpacing;
  document.body.appendChild(measure);

  const lines = [];
  let currentWords = [];

  const flushLine = () => {
    if (currentWords.length === 0) {
      return;
    }
    lines.push(currentWords.join(" "));
    currentWords = [];
  };

  words.forEach((word) => {
    const trial = [...currentWords, word].join(" ");
    measure.textContent = trial;
    if (measure.offsetWidth > width && currentWords.length > 0) {
      flushLine();
      currentWords.push(word);
    } else {
      currentWords.push(word);
    }
  });

  flushLine();
  document.body.removeChild(measure);

  element.dataset.linesOriginal = text;
  element.textContent = "";
  element.dataset.linesSplit = "true";

  const inners = [];

  lines.forEach((lineText) => {
    const mask = document.createElement("span");
    mask.className = maskClass;

    const inner = document.createElement("span");
    inner.className = innerClass;
    inner.dataset.maskLine = "true";
    inner.textContent = lineText;

    mask.appendChild(inner);
    element.appendChild(mask);
    inners.push(inner);
  });

  return inners;
}
