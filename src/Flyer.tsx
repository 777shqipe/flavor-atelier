import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import { useLang, useT } from "./i18n";
import { flyerStrings } from "./i18n/strings/Flyer";
import { productStrings } from "./i18n/strings/Products";
import { Deal } from "./FlyerDeal";
import { pickLook } from "./flyerLooks";
import { RingBadge } from "./RingBadge";
import { CATEGORIES, ITEMS, type CatId, type Item } from "./products";
import "./flyer.css";

type Sort = "featured" | "price" | "saving";
type CatFilter = CatId | "all";

const SORTS: Sort[] = ["featured", "price", "saving"];

const saving = (item: Item) => (item.was ? 1 - item.price / item.was : 0);

/** Animates the grid between two states with the View Transitions API where it exists. */
function morph(update: () => void) {
  if (!("startViewTransition" in document) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    update();
    return;
  }
  const transition = document.startViewTransition(() => {
    flushSync(update);
  });
  // A newer click skips the running transition; that is expected, not an error.
  const ignore = () => {};
  transition.ready.catch(ignore);
  transition.finished.catch(ignore);
  transition.updateCallbackDone.catch(ignore);
}

function CatIcon({ id }: { id: CatFilter }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {id === "all" && (
        <>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </>
      )}
      {id === "drinks" && <path d="M10 3h4v4l2 3v10a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 8 20V10l2-3zM8 13h8" />}
      {id === "pantry" && <path d="M7 4h10v3H7zM6 7h12v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM6 12h12" />}
      {id === "noodles" && <path d="M3 12h18a9 9 0 0 1-18 0zM8 8c0-2 2-2 2-4M13 8c0-2 2-2 2-4" />}
      {id === "snacks" && <path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM5 9h14M5 15h14M12 3v18" />}
      {id === "breakfast" && <path d="M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0M12 6v3M5.5 9.5l2 2M18.5 9.5l-2 2" />}
      {id === "fridge" && <path d="M7 9l5-5 5 5v11H7zM7 9h10M10 14h4" />}
      {id === "frozen" && <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5" />}
      {id === "household" && <path d="M8 11h7v10H8zM9 8h5v3M14 6h4l1.5 2.5" />}
    </svg>
  );
}

/**
 * Coupon edge along the top of the flyer: a pair of scissors cuts along the
 * dotted line as the section scrolls up into view.
 */
export function CutLine() {
  const s = useT(flyerStrings);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--cut", "1");
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = el.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (window.innerHeight - top) / (window.innerHeight * 0.7)));
      el.style.setProperty("--cut", p.toFixed(4));
      // Blades open and close as they travel.
      el.style.setProperty("--snip", Math.abs(Math.sin(p * 46)).toFixed(3));
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, []);

  return (
    <div className="cut" ref={ref} aria-hidden="true">
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

export function Flyer() {
  const s = useT(flyerStrings);
  const p = useT(productStrings);
  const { locale } = useLang();
  const [cat, setCat] = useState<CatFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("featured");
  const [special, setSpecial] = useState(false);

  // Masthead: issue number is the week of the year, dated from this week's Monday.
  const [monday] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
  });
  const issue = Math.ceil(((+monday - +new Date(monday.getFullYear(), 0, 1)) / 86400000 + 1) / 7);
  const week = monday.toLocaleDateString(locale, { day: "numeric", month: "short" });

  const q = query.trim().toLowerCase();
  const base = useMemo(
    () =>
      ITEMS.filter(
        (item) =>
          (!special || item.was) &&
          (!q ||
            item.name.toLowerCase().includes(q) ||
            item.line.toLowerCase().includes(q) ||
            (p.lines[item.id] ?? item.line).toLowerCase().includes(q)),
      ),
    [special, q, p],
  );
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: base.length };
    for (const item of base) map[item.cat] = (map[item.cat] ?? 0) + 1;
    return map;
  }, [base]);
  const visible = useMemo(() => {
    const list = cat === "all" ? base : base.filter((item) => item.cat === cat);
    if (sort === "price") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "saving") return [...list].sort((a, b) => saving(b) - saving(a));
    return list;
  }, [base, cat, sort]);

  const filtered = cat !== "all" || q !== "" || special || sort !== "featured";
  const reset = () =>
    morph(() => {
      setCat("all");
      setQuery("");
      setSort("featured");
      setSpecial(false);
    });

  return (
    <section className="flyer" id="flyer" data-surface="cream" aria-labelledby="flyer-title">
      <CutLine />
      <header className="flyer-head rv">
        <p className="flyer-mast" aria-hidden="true">
          <span>{s.issue(issue)}</span>
          <span>{s.week(week)}</span>
          <span>{s.stores}</span>
        </p>
        <div className="flyer-headline">
          <h2 id="flyer-title" className="flyer-title">
            {s.title}
          </h2>
          <RingBadge className="flyer-ring" text={s.ring} center="$" label={s.ringLabel} />
        </div>
        <p className="flyer-dek">{s.dek}</p>
      </header>

      <div className="flyer-tools" role="search">
        <label className="search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l4.5 4.5" />
          </svg>
          <input
            type="search"
            placeholder={s.searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={s.searchLabel}
          />
        </label>
        <button
          type="button"
          className="toggle"
          aria-pressed={special}
          onClick={() => morph(() => setSpecial((value) => !value))}
        >
          {s.onSpecial}
        </button>
        <div className="sorts" role="group" aria-label={s.sortLabel}>
          {SORTS.map((id) => (
            <button key={id} type="button" aria-pressed={sort === id} onClick={() => morph(() => setSort(id))}>
              {s.sorts[id]}
            </button>
          ))}
        </div>
      </div>

      <div className="flyer-bar">
        <div className="chips" role="group" aria-label={s.filterLabel}>
          {[
            { id: "all" as const, label: s.allAisles, color: "#f6b531" },
            ...CATEGORIES.map((c) => ({ ...c, label: p.cats[c.id] })),
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              className="chip"
              aria-pressed={cat === c.id}
              style={{ "--c": c.color } as CSSProperties}
              onClick={() => morph(() => setCat(c.id))}
            >
              <CatIcon id={c.id} />
              {c.label}
              <b>{counts[c.id] ?? 0}</b>
            </button>
          ))}
        </div>
      </div>

      <p className="flyer-meta" aria-live="polite">
        <strong>{visible.length}</strong> {s.finds(visible.length)}
        {cat !== "all" && <>{s.inAisle(p.cats[cat])}</>}
        {filtered && (
          <button type="button" onClick={reset}>
            {s.clearAll}
          </button>
        )}
        <span className="flyer-foot">{s.preview}</span>
      </p>

      {visible.length > 0 ? (
        <ul className="flyer-grid">
          {visible.map((item, index) => (
            <li key={item.id} data-size={pickLook(item)[1]} style={{ viewTransitionName: `deal-${item.id}` }}>
              <Deal item={item} index={index} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flyer-empty">
          <strong>{s.emptyTitle}</strong>
          <p>{s.emptyBody}</p>
          <button className="button dark" type="button" onClick={reset}>
            {s.showAll}
          </button>
        </div>
      )}
    </section>
  );
}
