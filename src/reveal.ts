/** Fades elements marked `.rv` inside `scope` in as they scroll into view. Returns a cleanup. */
export function revealIn(scope: ParentNode) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const observed = new WeakSet<Element>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      }
    },
    // Tall cards can occupy more than eight viewports on small screens.
    // Reveal those too, as soon as they cross the inset viewport.
    { rootMargin: "0px 0px -8% 0px", threshold: 0 },
  );
  const observe = (target: HTMLElement) => {
    if (target.classList.contains("in") || observed.has(target)) return;
    if (reduce.matches) target.classList.add("in");
    else {
      observed.add(target);
      io.observe(target);
    }
  };
  const scan = (node: ParentNode) => {
    if (node instanceof HTMLElement && node.matches(".rv")) observe(node);
    node.querySelectorAll<HTMLElement>(".rv:not(.in)").forEach(observe);
  };
  scan(scope);
  // Lazy pages and tab panels can arrive after the page's first effect.
  const mutations = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof HTMLElement) scan(node);
      }
      for (const node of record.removedNodes) {
        if (!(node instanceof HTMLElement) || node.isConnected) continue;
        io.unobserve(node);
        observed.delete(node);
        node.querySelectorAll(".rv").forEach((target) => {
          io.unobserve(target);
          observed.delete(target);
        });
      }
    }
  });
  mutations.observe(scope, { childList: true, subtree: true });
  return () => {
    io.disconnect();
    mutations.disconnect();
  };
}
