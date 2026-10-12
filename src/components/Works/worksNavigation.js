export const WORKS_NAVIGATE_EVENT = "works-navigate";

/** Asks the works panel to scroll to one of its sections: projects, arsenal, about, testimonials. */
export function navigateWorks(id) {
  window.dispatchEvent(new CustomEvent(WORKS_NAVIGATE_EVENT, { detail: id }));
}

/** Drops focus from a menu button clicked with a mouse or finger, so a later key press doesn't
    light its focus ring after the page has moved on. Keyboard presses (detail 0) keep focus. */
export function releasePointerFocus(event) {
  if (event.detail > 0) event.currentTarget.blur();
}
