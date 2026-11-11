import { useEffect, useRef } from "react";
import { useT } from "./i18n";
import { cutLineStrings } from "./i18n/strings/CutLine";
import "./cutline.css";

/**
 * Coupon edge along the top of the flyer: a pair of scissors cuts along the
 * dotted line as the section scrolls up into view.
 */
export function CutLine({ className }: { className?: string }) {
  const s = useT(cutLineStrings);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--cut", "1");
      return;
    }
    let frame = 0;
    let nearby = true;
    let progress = "";
    const update = () => {
      frame = 0;
      const top = el.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (window.innerHeight - top) / (window.innerHeight * 0.7)));
      const next = p.toFixed(4);
      if (next === progress) return;
      progress = next;
      el.style.setProperty("--cut", next);
      // Blades open and close as they travel.
      el.style.setProperty("--snip", Math.abs(Math.sin(p * 46)).toFixed(3));
    };
    const request = () => {
      if (nearby && !frame) frame = requestAnimationFrame(update);
    };
    update();
    const io = new IntersectionObserver(([entry]) => {
      nearby = entry.isIntersecting;
      // Keep the end state correct even after a large jump past the coupon edge.
      cancelAnimationFrame(frame);
      update();
    }, { rootMargin: "100px 0px" });
    io.observe(el);
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, []);

  return (
    <div className={className ? `cut ${className}` : "cut"} ref={ref} aria-hidden="true">
      <span className="cut-slit" />
      <span className="cut-label">{s.cut}</span>
      <svg className="scissors" viewBox="0 0 66 40">
        <g className="blade up">
          <path d="M28 15.5Q48 15 64 19.4L28 21.5Z" fill="#e4e8eb" stroke="#0f2a22" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M15 13L30 20" stroke="#0f2a22" strokeWidth="3" strokeLinecap="round" />
          <circle cx="10" cy="10" r="7" fill="none" stroke="#0f2a22" strokeWidth="7.4" />
          <circle cx="10" cy="10" r="7" fill="none" stroke="#e3261b" strokeWidth="4.4" />
        </g>
        <g className="blade down">
          <path d="M28 18.5L64 20.6Q48 25 28 24.5Z" fill="#c4cace" stroke="#0f2a22" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M15 27L30 20" stroke="#0f2a22" strokeWidth="3" strokeLinecap="round" />
          <circle cx="10" cy="30" r="7" fill="none" stroke="#0f2a22" strokeWidth="7.4" />
          <circle cx="10" cy="30" r="7" fill="none" stroke="#e3261b" strokeWidth="4.4" />
        </g>
        <circle cx="30" cy="20" r="2.4" fill="#0f2a22" />
      </svg>
    </div>
  );
}
