/** Fades elements marked `.rv` inside `scope` in as they scroll into view. Returns a cleanup. */
export function revealIn(scope: ParentNode) {
  const targets = scope.querySelectorAll<HTMLElement>(".rv:not(.in)");
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  targets.forEach((target) => io.observe(target));
  return () => io.disconnect();
}
