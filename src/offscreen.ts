type Activity = { intersecting: boolean; active?: boolean; onChange?: (active: boolean) => void };
type Group = { observer: IntersectionObserver; elements: Map<HTMLElement, Activity> };

// Sections with the same margin share an observer and a single visibility listener.
const groups = new Map<string, Group>();

function update(el: HTMLElement, activity: Activity) {
  const active = activity.intersecting && !document.hidden;
  if (active === activity.active) return;
  activity.active = active;
  el.toggleAttribute("data-off", !active);
  activity.onChange?.(active);
}

function visibilityChanged() {
  for (const { elements } of groups.values()) {
    for (const [el, activity] of elements) update(el, activity);
  }
}

/** Pause invisible sections without resetting their animation phase. Returns the cleanup. */
export function pauseWhenOffscreen(el: HTMLElement, margin = "150px 0px", onChange?: (active: boolean) => void) {
  if (!groups.size) document.addEventListener("visibilitychange", visibilityChanged);
  let group = groups.get(margin);
  if (!group) {
    const elements = new Map<HTMLElement, Activity>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const node = entry.target as HTMLElement;
        const activity = elements.get(node);
        if (!activity) continue;
        activity.intersecting = entry.isIntersecting;
        update(node, activity);
      }
    }, { rootMargin: margin });
    group = { observer, elements };
    groups.set(margin, group);
  }
  const activity: Activity = { intersecting: false, onChange };
  group.elements.set(el, activity);
  update(el, activity);
  group.observer.observe(el);

  return () => {
    group.observer.unobserve(el);
    group.elements.delete(el);
    el.removeAttribute("data-off");
    if (!group.elements.size) {
      group.observer.disconnect();
      groups.delete(margin);
    }
    if (!groups.size) document.removeEventListener("visibilitychange", visibilityChanged);
  };
}
