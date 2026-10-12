export function restoreSplitTextWords(element) {
  if (!element || element.dataset.wordsSplit !== "true") {
    return;
  }

  element.textContent = element.dataset.wordsOriginal ?? "";
  delete element.dataset.wordsSplit;
  delete element.dataset.wordsOriginal;
}

export function splitTextElementIntoWords(
  element,
  maskClass,
  innerClass,
  { mutedClass = "", mutedWordCount = 0 } = {},
) {
  if (!element) {
    return [];
  }

  if (element.dataset.wordsSplit === "true") {
    return [...element.querySelectorAll("[data-reveal-word]")];
  }

  const words = (element.textContent ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [];
  }

  element.dataset.wordsOriginal = words.join(" ");
  element.textContent = "";
  element.dataset.wordsSplit = "true";

  const inners = [];

  words.forEach((text, index) => {
    const mask = document.createElement("span");
    mask.className = maskClass;

    const inner = document.createElement("span");
    inner.className = innerClass;
    inner.dataset.revealWord = "true";
    inner.textContent = text;

    if (mutedClass && index < mutedWordCount) {
      inner.classList.add(mutedClass);
    }

    mask.appendChild(inner);
    element.appendChild(mask);

    if (index < words.length - 1) {
      element.appendChild(document.createTextNode(" "));
    }

    inners.push(inner);
  });

  return inners;
}
