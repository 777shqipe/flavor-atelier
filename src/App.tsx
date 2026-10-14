import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import { AboutPage } from "./AboutPage";
import { BinPile } from "./BinPile";
import { ContactPanel, type Topic } from "./ContactPanel";
import { Flyer } from "./Flyer";
import { InstaShelf } from "./InstaShelf";
import { Header, type Page } from "./Header";
import { Hero } from "./Hero";
import { Mix } from "./Mix";
import { PageSwap, type Swap } from "./PageSwap";
import { Peel } from "./Peel";
import { revealIn } from "./reveal";
import { Showcase } from "./Showcase";
import { StoresPage } from "./StoresPage";
import { WhyFilm } from "./WhyFilm";

/** Fades elements marked `.rv` in as they scroll into view. */
function useReveal(page: Page) {
  useEffect(() => revealIn(document), [page]);
}

const YEAR = new Date().getFullYear();

/** The weekly flyer stays in the project. Home shows the Instagram shelf in its place. */
const showWeeklyFlyer = false;
/** The product posters (Showcase) stay in the project for later. Home shows only the feed for now. */
const showShowcase = false;
const TICKER = ["Once it’s gone, it’s gone", "New finds every week", "Big brands, small prices", "Less waste, more taste"];
const TICKER_ALT = ["Up to 70% off RRP", "Rescued, not wasted", "Four Melbourne stores", "Fighting food waste since 1995"];

function Products({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
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
        <div className="ticker-row">
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
        <div className="ticker-row alt">
          <div className="ticker-track reverse">
            {[0, 1].map((copy) => (
              <div key={copy}>
                {TICKER_ALT.map((phrase) => (
                  <span key={phrase}>
                    {phrase}
                    <i>$</i>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Feed() {
  return showWeeklyFlyer ? <Flyer /> : <InstaShelf />;
}

function Home({ onNavigate, onContact }: { onNavigate: (page: Page) => void; onContact: (topic?: Topic) => void }) {
  return (
    <main>
      <Hero onNavigate={onNavigate} />

      {/* What's on the shelves: the posters in store and the posts on Instagram, or just the posts. */}
      {showShowcase ? (
        <Mix
          id="finds"
          label="This week’s finds"
          tabs={[
            { id: "store", label: "In store now", render: () => <Products onNavigate={onNavigate} /> },
            { id: "feed", label: "On Instagram", render: () => <Feed /> },
          ]}
        />
      ) : (
        <div id="finds">
          <Feed />
        </div>
      )}

      <section className="manifesto" data-surface="cream" aria-labelledby="manifesto-title">
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
        <div className="rv blur" style={{ "--rv": "100ms" } as CSSProperties}>
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
          {/* Short dates make some people wary, so the promise sits right under the pitch. */}
          <p className="mani-promise">
            <span aria-hidden="true">✓</span>
            <b>100% money-back guarantee.</b> Not happy with something? Bring it back.
          </p>
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

      {/* Why it costs less: the numbers, the label and the receipt, told as one film that plays on its own. */}
      <WhyFilm />
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
        // WebM first (a quarter of the size); the MP4 is there for older iPhones.
        <video poster="/media/footer-dance.jpg" muted playsInline loop autoPlay preload="metadata">
          <source src="/media/footer-dance.webm" type="video/webm" />
          <source src="/media/footer-dance.mp4" type="video/mp4" />
        </video>
      ) : (
        <img src="/media/footer-dance.jpg" alt="" />
      )}
    </div>
  );
}

function Footer({ onNavigate, onContact }: { onNavigate: (page: Page, anchor?: string) => void; onContact: () => void }) {
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
          <button type="button" onClick={() => onNavigate("about", "suppliers")}>
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
            <a href="https://twitter.com/CheaperBuyMiles" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <span>tw</span>
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
        <span>
          © {YEAR} Cheaper Buy Miles ·{" "}
          {/* The policies live on the current site until they move here. */}
          <a href="https://www.cheaperbuymiles.com/privacy-policy" target="_blank" rel="noopener noreferrer">
            Privacy
          </a>{" "}
          ·{" "}
          <a href="https://www.cheaperbuymiles.com/cookie-policy" target="_blank" rel="noopener noreferrer">
            Cookies
          </a>
        </span>
      </div>
    </footer>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>(window.location.hash === "#contact" ? "about" : "home");
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
  // Contact is a side panel over whatever page you are on.
  const openContact = (topic?: Topic) => setContact((c) => ({ open: true, topic: topic ?? c.topic }));
  const closeContact = useCallback(() => setContact((c) => ({ ...c, open: false })), []);
  const cover = (next: Swap) => {
    flushSync(() => setPage(next.to));
    const target = next.anchor ? document.getElementById(next.anchor) : null;
    if (target) target.scrollIntoView({ behavior: "instant" });
    else window.scrollTo({ top: 0, behavior: "instant" });
  };

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "finds" || hash === "why") {
      window.setTimeout(() => document.getElementById(hash)?.scrollIntoView(), 60);
    }
  }, []);

  return (
    <>
      <div className="app-shell" inert={contact.open}>
        <Header page={page} onNavigate={navigate} onContact={() => openContact()} />
        <div key={page} className="page-in">
          {page === "home" && <Home onNavigate={navigate} onContact={openContact} />}
          {page === "stores" && <StoresPage active={store} onSelect={setStore} />}
          {page === "about" && <AboutPage onContact={() => openContact("stock")} />}
        </div>
        <Footer onNavigate={go} onContact={() => openContact()} />
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
