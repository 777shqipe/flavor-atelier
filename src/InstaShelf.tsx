import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLang, useT } from "./i18n";
import { instaShelfStrings } from "./i18n/strings/InstaShelf";
import { CutLine } from "./Flyer";
import { LogoMark } from "./Logo";
import { RingBadge } from "./RingBadge";
import "./insta.css";

/** Each print sits on the shelf a touch crooked; the pattern repeats so it never looks random-generated. */
const TILTS = [-1.1, 0.8, -0.6, 1.05, -0.85, 0.7];
const slotStyle = (i: number, scale = 1) => ({ "--i": i, "--tilt": `${(TILTS[i % TILTS.length] * scale).toFixed(2)}deg` }) as CSSProperties;

const PROFILE = "https://www.instagram.com/cheaperbuymiles/";

type HeroId = keyof typeof instaShelfStrings.en.heroes;
type TicketId = keyof typeof instaShelfStrings.en.tickets;

type Hero = {
  id: HeroId;
  href: string;
  img: string;
  /** Posting day as an ISO date, shown in the reader's own date style. */
  date: string;
  size: string;
};

type Ticket = {
  id: TicketId;
  href: string;
  img: string;
  /** Posting day as an ISO date, shown in the reader's own date style. */
  date: string;
  /** Pack size; units stay Latin in every language. */
  size: string;
};

const HEROES: Hero[] = [
  {
    id: "lasagne",
    href: "https://www.instagram.com/p/DeLjrMMmlVI",
    img: "/media/ig/lasagne.jpg",
    date: "2026-10-07",
    size: "2kg",
  },
  {
    id: "icecream",
    href: "https://www.instagram.com/p/DeQtNqlGlu6",
    img: "/media/ig/icecream.jpg",
    date: "2026-10-09",
    size: "5L",
  },
];

const TICKETS: Ticket[] = [
  {
    id: "tempeh",
    href: "https://www.instagram.com/p/DeJAYIEGtn8",
    img: "/media/ig/tempeh.jpg",
    date: "2026-10-06",
    size: "200g",
  },
  {
    id: "mikeike",
    href: "https://www.instagram.com/p/DeQsJFAGspS",
    img: "/media/ig/mikeike.jpg",
    date: "2026-10-09",
    size: "120g",
  },
  {
    id: "water",
    href: "https://www.instagram.com/p/DeNzpaOGk3Z",
    img: "/media/ig/water.jpg",
    date: "2026-10-08",
    size: "1L",
  },
  {
    id: "almond",
    href: "https://www.instagram.com/p/DeLrKMPmnE8",
    img: "/media/ig/almond.jpg",
    date: "2026-10-07",
    size: "1L",
  },
  {
    id: "nuttelex",
    href: "https://www.instagram.com/p/DeQTZ7sk0o_",
    img: "/media/ig/nuttelex.jpg",
    date: "2026-10-09",
    size: "500g",
  },
  {
    id: "bleach",
    href: "https://www.instagram.com/p/DeI2lwNGqJ0",
    img: "/media/ig/bleach.jpg",
    date: "2026-10-06",
    size: "1.25L",
  },
];

const HANDLE = "cheaperbuymiles";

/** Stable mix: each card is either a camera snap or a till pass. */
const FX: Record<string, "snap" | "till"> = {
  lasagne: "snap",
  icecream: "till",
  tempeh: "till",
  mikeike: "snap",
  water: "snap",
  almond: "till",
  nuttelex: "snap",
  bleach: "till",
};

function Fx({ id }: { id: string }) {
  return <span className="ig-fx" data-fx={FX[id] ?? "snap"} aria-hidden="true" />;
}

function StoryLink() {
  return (
    <a className="ig-story" href={PROFILE} target="_blank" rel="noopener noreferrer">
      <span className="ig-story-ring" aria-hidden="true">
        <span className="ig-story-face">
          <LogoMark />
        </span>
      </span>
      <span className="ig-story-name">{HANDLE}</span>
    </a>
  );
}

function CommentLink({ href }: { href: string }) {
  const s = useT(instaShelfStrings);
  return (
    <a className="ig-comment" href={href} target="_blank" rel="noopener noreferrer">
      <span>{s.comment}</span>
    </a>
  );
}

function Price({ value }: { value: string }) {
  const match = /^\$(\d+)$/.exec(value);
  if (!match) return <span className="ig-price ig-price-long">{value}</span>;
  return (
    <span className="ig-price">
      <sup>$</sup>
      {match[1]}
    </span>
  );
}

export function InstaShelf() {
  const s = useT(instaShelfStrings);
  const { locale } = useLang();
  const rootRef = useRef<HTMLElement>(null);
  const shortDay = (date: Date) => date.toLocaleDateString(locale, { day: "numeric", month: "short" });
  // Read at noon, so no time zone can slip a post onto the day before.
  const postDay = (iso: string) => shortDay(new Date(`${iso}T12:00`));

  // Issue number is the week of the year, dated from this week's Monday. Same count the flyer uses.
  const [today] = useState(() => new Date());
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
  const issue = Math.ceil(((+monday - +new Date(monday.getFullYear(), 0, 1)) / 86400000 + 1) / 7);

  // On coarse/touch screens where :hover doesn't fire as you browse, lift cards and fire their camera shutter / till laser as they cross the shelf focus zone.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (
      !window.matchMedia("(hover: none), (pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const timers = new Map<Element, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const card = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            card.dataset.active = "";
            card.dataset.fxGo = "";
            const prev = timers.get(card);
            if (prev) window.clearTimeout(prev);
            timers.set(
              card,
              window.setTimeout(() => {
                delete card.dataset.fxGo;
                timers.delete(card);
              }, 1050),
            );
          } else {
            delete card.dataset.active;
          }
        }
      },
      { rootMargin: "-16% 0px -16% 0px", threshold: 0.55 },
    );
    const cards = el.querySelectorAll<HTMLElement>(".ig-card");
    cards.forEach((c) => io.observe(c));
    return () => {
      io.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <section className="ig-shelf" id="instagram" ref={rootRef} data-surface="cream" aria-labelledby="ig-title">
      <CutLine />
      <header className="ig-head rv">
        <p className="ig-mast" aria-hidden="true">
          <span>{s.issue(issue)}</span>
          <span>{s.week(shortDay(monday))}</span>
          <span>@cheaperbuymiles</span>
        </p>
        <div className="ig-headline">
          <h2 id="ig-title" className="ig-title">
            {s.title}
          </h2>
          <RingBadge className="ig-ring" text={s.ringText} center="@" label={s.ringLabel} />
        </div>
        <div className="ig-dek-row">
          <p className="ig-dek">
            {s.dek}
          </p>
          <a className="button outline" href={PROFILE} target="_blank" rel="noopener noreferrer">
            {s.follow}
          </a>
        </div>
      </header>

      <div className="ig-feature">
        {HEROES.map((post, i) => {
          const copy = s.heroes[post.id];
          return (
          <div key={post.id} className="ig-slot rv" style={slotStyle(i, 0.45)}>
          <article className="ig-card ig-hero">
            <StoryLink />
            <a className="ig-post" href={post.href} target="_blank" rel="noopener noreferrer">
            <figure>
              <img src={post.img} alt={copy.alt} width={1080} height={1440} loading="lazy" decoding="async" />
              <span className="ig-sticker" aria-hidden="true">{post.size}</span>
              <p className="ig-quip">{copy.quip}</p>
              <Fx id={post.id} />
            </figure>
            <div className="ig-body">
              <p className="ig-kicker">
                <span>{postDay(post.date)}</span>
                <span>{copy.aisle}</span>
              </p>
              <h3>{copy.name}</h3>
              <dl className="ig-cells">
                <div>
                  <dt>{s.sizeLabel}</dt>
                  <dd>{post.size}</dd>
                </div>
                <div>
                  <dt>{s.whereLabel}</dt>
                  <dd>{copy.where}</dd>
                </div>
                <div>
                  <dt>{s.fromLabel}</dt>
                  <dd>Instagram</dd>
                </div>
              </dl>
              <div className="ig-bar">
                <span>{s.seePost}</span>
                <Price value={copy.price} />
              </div>
            </div>
            </a>
            <CommentLink href={post.href} />
          </article>
          </div>
          );
        })}
      </div>

      <ul className="ig-grid">
        {TICKETS.map((post, i) => {
          const copy = s.tickets[post.id];
          return (
          <li key={post.id} className="ig-slot rv" style={slotStyle(i + 2)}>
            <article className="ig-card ig-ticket">
              <StoryLink />
              <a className="ig-post" href={post.href} target="_blank" rel="noopener noreferrer">
                <figure>
                  <img src={post.img} alt={copy.alt} width={1080} height={1440} loading="lazy" decoding="async" />
                  <span className="ig-sticker" aria-hidden="true">{copy.tag}</span>
                  <p className="ig-quip">{copy.quip}</p>
                  <Fx id={post.id} />
                </figure>
                <div className="ig-label">
                  <Price value={copy.price} />
                  <span className="ig-label-meta">
                    <b>{copy.name}</b>
                    {`${postDay(post.date)} · ${post.size}`}
                  </span>
                  <span className="ig-code" aria-hidden="true" />
                </div>
                <span className="sr-only">{copy.spoken ? `${copy.spoken}. ` : ""}{s.opens}</span>
              </a>
              <CommentLink href={post.href} />
            </article>
          </li>
          );
        })}
      </ul>
    </section>
  );
}
