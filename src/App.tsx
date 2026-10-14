import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import { AboutPage } from "./AboutPage";
import { BinPile } from "./BinPile";
import { ContactPanel, type Topic } from "./ContactPanel";
import { Flyer } from "./Flyer";
import { InstaShelf } from "./InstaShelf";
import { Header, type Page } from "./Header";
import { Hero } from "./Hero";
import { Odometer } from "./Odometer";
import { PageSwap, type Swap } from "./PageSwap";
import { Peel } from "./Peel";
import { Receipt } from "./Receipt";
import { Showcase } from "./Showcase";
import { StoreMap } from "./StoreMap";
import { StoresPage } from "./StoresPage";
import { SuppliersPage } from "./SuppliersPage";

/** Fades elements marked `.rv` in as they scroll into view. */
function useReveal(page: Page) {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(".rv:not(.in)");
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
  }, [page]);
}

const YEAR = new Date().getFullYear();

/** The weekly flyer stays in the project. Home shows the Instagram shelf in its place. */
const showWeeklyFlyer = false;
const TICKER = ["Once it’s gone, it’s gone", "New finds every week", "Big brands, small prices", "Less waste, more taste"];

function Home({
  onNavigate,
  onOpenStore,
  onContact,
}: {
  onNavigate: (page: Page) => void;
  onOpenStore: (index: number) => void;
  onContact: (topic?: Topic) => void;
}) {
  const [maniSeen, setManiSeen] = useState(false);
  const maniRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = maniRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setManiSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <main>
      <Hero onNavigate={onNavigate} />

      <section className="manifesto" ref={maniRef} data-surface="cream" aria-labelledby="manifesto-title">
        <div className="display-letters rv" tabIndex={0}>
          <span aria-hidden="true">C</span>
          <span aria-hidden="true">B</span>
          <span aria-hidden="true">M</span>
          <p className="display-name">Cheaper Buy Miles</p>
          <Peel
            className="mani-seal"
            from="tr"
            bleed={0.04}
            back={{ borderRadius: "10px" }}
            under={
              <span className="mani-seal-under">
                Zero
                <br />
                landfill
              </span>
            }
          >
            <span className="mani-seal-face">
              <small>RESCUED</small>
              <b>DAILY</b>
            </span>
          </Peel>
        </div>
        <div className="rv" style={{ "--rv": "100ms" } as CSSProperties}>
          <p className="eyebrow">Our purpose</p>
          <h2 id="manifesto-title">
            One <em>bargain</em> at a time.
          </h2>
          <p className="mani-tag">
            <span>Surplus in</span>
            <i>→</i>
            <span>Savings out</span>
          </p>
        </div>
        <div className="manifesto-copy rv" style={{ "--rv": "200ms" } as CSSProperties}>
          <p>
            We love food, and we hate waste. We’ve saved millions of kilograms of good food from being dumped—while
            giving you huge savings.
          </p>
          <ul className="manifesto-facts">
            <li style={{ "--fc": "#f6b531" } as CSSProperties}>
              <span className="mf-bar" aria-hidden="true" />
              <b>
                <Odometer value={maniSeen ? "1995" : "0000"} />
              </b>
              <span>Still the same fight</span>
            </li>
            <li style={{ "--fc": "#6fd3b0" } as CSSProperties}>
              <span className="mf-bar" aria-hidden="true" />
              <b>
                <Odometer value={maniSeen ? "04" : "00"} />
              </b>
              <span>Shops, one purpose</span>
            </li>
            <li style={{ "--fc": "#ff9a3d" } as CSSProperties}>
              <span className="mf-bar" aria-hidden="true" />
              <b>10M+</b>
              <span>Kilos kept from landfill</span>
            </li>
          </ul>
          <div className="mani-actions">
            <button className="button" type="button" onClick={() => onNavigate("about")}>
              Our story
            </button>
            <button className="button outline" type="button" onClick={() => onContact("stock")}>
              Got surplus stock?
            </button>
          </div>
        </div>
      </section>

      <section className="products" data-surface="green" aria-labelledby="in-store">
        <header className="section-head split rv">
          <div>
            <p className="eyebrow">Fresh finds every week</p>
            <h2 id="in-store">In store now</h2>
          </div>
          <p className="lead">Unexpected brands, unbelievable prices. Once it’s gone, it’s gone.</p>
        </header>
        <Showcase onNavigate={onNavigate} />
        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {[0, 1].map((copy) => (
              <div key={copy}>
                {TICKER.map((phrase) => (
                  <span key={phrase}>
                    {phrase}
                    <i>✦</i>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {showWeeklyFlyer ? <Flyer /> : <InstaShelf />}

      <Receipt />

      <section className="home-map" id="map" data-surface="cream" aria-labelledby="map-title">
        <header className="section-head centered rv">
          <p className="eyebrow">Inner Melbourne</p>
          <h2 id="map-title">Four shops, one map.</h2>
        </header>
        <div className="rv" style={{ "--rv": "100ms" } as CSSProperties}>
          <StoreMap
            variant="compact"
            active={null}
            onSelect={(index) => {
              onOpenStore(index);
              onNavigate("stores");
            }}
            onOpenFinder={() => onNavigate("stores")}
          />
        </div>
      </section>
    </main>
  );
}

function FootFilm() {
  const spot = useRef<HTMLDivElement>(null);
  const [reduce] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = spot.current?.closest("footer");
    if (!node || reduce) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setSeen(true);
      },
      { rootMargin: "280px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <div className="foot-film" ref={spot} aria-hidden="true">
      {seen && !reduce ? (
        <video src="/media/footer-meadow.mp4" poster="/media/footer-meadow.jpg" muted playsInline loop autoPlay preload="metadata" />
      ) : (
        <img src="/media/footer-meadow.jpg" alt="" />
      )}
    </div>
  );
}

function Footer({ onNavigate, onContact }: { onNavigate: (page: Page) => void; onContact: () => void }) {
  return (
    <footer data-surface="deep">
      <FootFilm />
      <BinPile />
      <div className="footer-main">
        <div className="footer-brand">
          <p className="eyebrow">Cheaper Buy Miles</p>
          <h2>
            More taste.
            <br />
            <em>Less waste.</em>
          </h2>
          <button className="footer-ticket" type="button" onClick={onContact}>
            <span className="ft-tag">OPEN DOCKET</span>
            <span className="ft-copy">
              <b>Have surplus stock or a question?</b>
              <small>Write to our buying or store team →</small>
            </span>
          </button>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <p className="footer-label">Explore</p>
          <button type="button" onClick={() => onNavigate("home")}>
            <small>01</small> Home
          </button>
          <button type="button" onClick={() => onNavigate("stores")}>
            <small>02</small> Our stores
          </button>
          <button type="button" onClick={() => onNavigate("about")}>
            <small>03</small> About us
          </button>
          <button type="button" onClick={() => onNavigate("suppliers")}>
            <small>04</small> Suppliers
          </button>
          <button type="button" onClick={onContact}>
            <small>05</small> Contact us
          </button>
        </nav>
        <div className="footer-social-col">
          <p className="footer-label">Follow the bargains</p>
          <p className="footer-sub">New arrivals land on our feed daily before they hit the shelves.</p>
          <div className="socials">
            <a href="https://www.instagram.com/cheaperbuymiles/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <span>ig</span>
            </a>
            <a href="https://www.facebook.com/cheaperbuymiles/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <span>fb</span>
            </a>
            <button type="button" onClick={() => onNavigate("stores")} aria-label="Our 4 Melbourne stores">
              <span>4×</span>
            </button>
            <button type="button" onClick={onContact} aria-label="Contact us">
              <span>✉</span>
            </button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Melbourne, Australia · Est. 1995</span>
        <span>Good food shouldn’t go to waste.</span>
        <span>© {YEAR} Cheaper Buy Miles</span>
      </div>
    </footer>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>(window.location.hash === "#contact" ? "suppliers" : "home");
  const [store, setStore] = useState(0);
  useReveal(page);

  const [swap, setSwap] = useState<Swap | null>(null);
  const [contact, setContact] = useState<{ open: boolean; topic: Topic }>(() => ({
    open: window.location.hash === "#contact",
    topic: window.location.hash === "#contact" ? "stock" : "shop",
  }));

  // Changing page goes through the sticker swap; same page (or reduced motion) just jumps.
  const go = (nextPage: Page, anchor?: string) => {
    if (swap) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (nextPage === page || reduce) {
      setPage(nextPage);
      window.setTimeout(() => {
        const target = anchor ? document.getElementById(anchor) : null;
        if (target) target.scrollIntoView({ behavior: "smooth" });
        else window.scrollTo({ top: 0, behavior: nextPage === page ? "smooth" : "instant" });
      }, 40);
      return;
    }
    setSwap({ to: nextPage, anchor, n: Date.now() });
  };
  const navigate = (nextPage: Page) => go(nextPage);
  // Contact is a side panel over whatever page you are on. From Suppliers it opens on surplus stock.
  const openContact = (topic?: Topic) =>
    setContact((c) => ({ open: true, topic: topic ?? (page === "suppliers" ? "stock" : c.topic) }));
  const closeContact = useCallback(() => setContact((c) => ({ ...c, open: false })), []);
  const cover = (next: Swap) => {
    flushSync(() => setPage(next.to));
    const target = next.anchor ? document.getElementById(next.anchor) : null;
    if (target) target.scrollIntoView({ behavior: "instant" });
    else window.scrollTo({ top: 0, behavior: "instant" });
  };

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "map" || hash === "in-store") {
      window.setTimeout(() => document.getElementById(hash)?.scrollIntoView(), 60);
    }
  }, []);

  return (
    <>
      <div className="app-shell" inert={contact.open}>
        <Header page={page} onNavigate={navigate} onContact={() => openContact()} />
        <div key={page} className="page-in">
          {page === "home" && <Home onNavigate={navigate} onOpenStore={setStore} onContact={openContact} />}
          {page === "stores" && <StoresPage active={store} onSelect={setStore} />}
          {page === "about" && <AboutPage />}
          {page === "suppliers" && <SuppliersPage onContact={() => openContact("stock")} />}
        </div>
        <Footer onNavigate={navigate} onContact={() => openContact()} />
        <PageSwap swap={swap} onCover={cover} onDone={() => setSwap(null)} />
      </div>
      <ContactPanel
        open={contact.open}
        topic={contact.topic}
        onTopic={(topic) => setContact((c) => ({ ...c, topic }))}
        onClose={closeContact}
      />
    </>
  );
}
