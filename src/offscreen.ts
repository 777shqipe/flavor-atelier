/**
 * Puts data-off on `el` while it is further than `margin` from the screen, so its stylesheet can pause the
 * section's endless loops (animation-play-state: paused). A loop nobody can see should not keep the page busy.
 * Returns the cleanup.
 */
export function pauseWhenOffscreen(el: HTMLElement, margin = "150px 0px") {
  const io = new IntersectionObserver(([entry]) => el.toggleAttribute("data-off", !entry.isIntersecting), { rootMargin: margin });
  io.observe(el);
  return () => io.disconnect();
}
