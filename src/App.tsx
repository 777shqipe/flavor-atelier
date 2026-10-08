import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import { AboutPage } from "./AboutPage";
import { BinPile } from "./BinPile";
import { ContactPanel, type Topic } from "./ContactPanel";
import { Flyer } from "./Flyer";
import { Header, type Page } from "./Header";
import { Hero } from "./Hero";
import { PageSwap, type Swap } from "./PageSwap";
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
const TICKER = ["Once it’s gone, it’s gone", "New finds every week", "Big brands, small prices", "Less waste, more taste"];

function Home({ onNavigate, onOpenStore }: { onNavigate: (page: Page) => void; onOpenStore: (index: number) => void }) {
  return (
    <main>
      <Hero onNavigate={onNavigate} />

      <section className="manifesto" data-surface="cream" aria-labelledby="manifesto-title">
        <div className="display-letters rv" aria-label="CBM">
          <span>C</span>
          <span>B</span>
          <span>M</span>
        </div>
        <div className="rv" style={{ "--rv": "100ms" } as CSSProperties}>
          <p className="eyebrow">Our purpose</p>
          <h2 id="manifesto-title">One bargain at a time.</h2>
        </div>
        <div className="manifesto-copy rv" style={{ "--rv": "200ms" } as CSSProperties}>
          <p>
            We love food, and we hate waste. We’ve saved millions of kilograms of good food from being dumped—while
            giving you huge savings.
          </p>
          <button className="button outline" type="button" onClick={() => onNavigate("about")}>
            About us
          </button>
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

      <Flyer />

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

function Footer({ onNavigate, onContact }: { onNavigate: (page: Page) => void; onContact: () => void }) {
  return (
    <footer data-surface="deep">
      <BinPile />
      <div className="footer-main">
        <div>
          <p className="eyebrow">Cheaper Buy Miles</p>
          <h2>
            More taste.
            <br />
            Less waste.
          </h2>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <button type="button" onClick={() => onNavigate("home")}>Home</button>
          <button type="button" onClick={() => onNavigate("stores")}>Our stores</button>
          <button type="button" onClick={() => onNavigate("about")}>About us</button>
          <button type="button" onClick={() => onNavigate("suppliers")}>Suppliers</button>
          <button type="button" onClick={onContact}>Contact us</button>
        </nav>
        <div>
          <p className="footer-label">Follow the bargains</p>
          <div className="socials">
            <span>ig</span>
            <span>f</span>
            <span>in</span>
            <span>♪</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Melbourne, Australia</span>
        <span>Good food shouldn’t go to waste.</span>
        <span>© {YEAR} CBM</span>
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
          {page === "home" && <Home onNavigate={navigate} onOpenStore={setStore} />}
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
