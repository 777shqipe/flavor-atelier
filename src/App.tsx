import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import type { Topic } from "./ContactPanel";
import { InstaShelf } from "./InstaShelf";
import { Header, type Page } from "./Header";
import { Hero } from "./Hero";
import { LoadBoundary } from "./LoadBoundary";
import { useLang, useT } from "./i18n";
import { appStrings } from "./i18n/strings/App";
import { Mix } from "./Mix";
import { PageSwap, type Swap } from "./PageSwap";
import { Peel } from "./Peel";
import { pageUrl, routeFromLocation } from "./navigation";
import { revealIn } from "./reveal";

const loadAbout = () => import("./AboutPage");
const loadStores = () => import("./StoresPage");
const loadContact = () => import("./ContactPanel");
const prepareContact = () => { void loadContact().catch(() => {}); };
const AboutPage = lazy(() => loadAbout().then((module) => ({ default: module.AboutPage })));
const StoresPage = lazy(() => loadStores().then((module) => ({ default: module.StoresPage })));
const ContactPanel = lazy(() => loadContact().then((module) => ({ default: module.ContactPanel })));
const BinPile = lazy(() => import("./BinPile").then((module) => ({ default: module.BinPile })));
const Flyer = lazy(() => import("./Flyer").then((module) => ({ default: module.Flyer })));
const Showcase = lazy(() => import("./Showcase").then((module) => ({ default: module.Showcase })));
const loadPage = (page: Page) => page === "about" ? loadAbout() : page === "stores" ? loadStores() : Promise.resolve();
const afterPaint = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

/** Effects inside Suspense commit only once all of that page's content is ready. */
function PageReady({ page, onReady }: { page: Page; onReady: (page: Page) => void }) {
  useLayoutEffect(() => onReady(page), [page, onReady]);
  return null;
}

const LOAD_COPY = {
  en: { loading: "Loading…", failed: "This content could not be loaded.", retry: "Try again", close: "Close" },
  vi: { loading: "Đang tải…", failed: "Không thể tải nội dung này.", retry: "Thử lại", close: "Đóng" },
  zh: { loading: "加载中…", failed: "无法加载此内容。", retry: "重试", close: "关闭" },
  it: { loading: "Caricamento…", failed: "Impossibile caricare questo contenuto.", retry: "Riprova", close: "Chiudi" },
  ja: { loading: "読み込み中…", failed: "コンテンツを読み込めませんでした。", retry: "再試行", close: "閉じる" },
};

function LoadingPage({ failed = false, compact = false }: { failed?: boolean; compact?: boolean }) {
  const { lang } = useLang();
  const copy = LOAD_COPY[lang];
  return <div className={compact ? "navigation-error" : "page-loading"} role={failed ? "alert" : "status"}>
    <span>{failed ? copy.failed : copy.loading}</span>
    {failed && <button type="button" onClick={() => window.location.reload()}>{copy.retry}</button>}
  </div>;
}

function ContactLoading({ onClose, failed = false }: { onClose: () => void; failed?: boolean }) {
  const { lang } = useLang();
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    document.documentElement.classList.add("ct-loading-lock");
    close.current?.focus({ preventScroll: true });
    return () => {
      document.documentElement.classList.remove("ct-loading-lock");
      previous?.focus({ preventScroll: true });
    };
  }, []);
  return <div className="contact-loading" role="dialog" aria-modal="true" aria-label={LOAD_COPY[lang][failed ? "failed" : "loading"]}
    onKeyDown={(event) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key === "Tab") {
        const buttons = [...event.currentTarget.querySelectorAll("button")];
        const next = buttons[(buttons.indexOf(document.activeElement as HTMLButtonElement) + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length];
        event.preventDefault();
        next?.focus();
      }
    }}>
    <LoadingPage failed={failed} />
    <button ref={close} type="button" onClick={onClose} aria-label={LOAD_COPY[lang].close}>×</button>
  </div>;
}

/** Fades elements marked `.rv` in as they scroll into view. */
function useReveal(page: Page) {
  useEffect(() => revealIn(document), [page]);
}

const YEAR = new Date().getFullYear();

/** The weekly flyer stays in the project. Home shows the Instagram shelf in its place. */
const showWeeklyFlyer = false;
/** The product posters (Showcase) stay in the project for later. Home shows only the feed for now. */
const showShowcase = false;
function Products({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const s = useT(appStrings);
  return (
    <section className="products" data-surface="green" aria-labelledby="in-store">
      <header className="section-head split rv">
        <div>
          <p className="eyebrow">{s.products.eyebrow}</p>
          <h2 id="in-store">{s.products.heading}</h2>
        </div>
        <p className="lead">{s.products.lead}</p>
      </header>
      <Showcase onNavigate={onNavigate} />
      <div className="ticker" aria-hidden="true">
        <div className="ticker-row">
          <div className="ticker-track">
            {[0, 1].map((copy) => (
              <div key={copy}>
                {s.ticker.map((phrase) => (
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
                {s.tickerAlt.map((phrase) => (
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
  const s = useT(appStrings);
  return (
    <main>
      <Hero onNavigate={onNavigate} />

      {/* What's on the shelves: the posters in store and the posts on Instagram, or just the posts. */}
      {showShowcase ? (
        <Mix
          id="finds"
          label={s.mix.label}
          tabs={[
            { id: "store", label: s.mix.store, render: () => <Products onNavigate={onNavigate} /> },
            { id: "feed", label: s.mix.feed, render: () => <Feed /> },
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
            under={<span className="mani-seal-under">{s.home.sealUnder}</span>}
          >
            <span className="mani-seal-face">
              <small>{s.home.sealSmall}</small>
              <b>{s.home.sealBig}</b>
            </span>
          </Peel>
        </div>
        <div className="rv blur" style={{ "--rv": "100ms" } as CSSProperties}>
          <p className="eyebrow">{s.home.purposeEyebrow}</p>
          <h2 id="manifesto-title">{s.home.purposeTitle}</h2>
          <p className="mani-tag">
            <span>{s.home.tagIn}</span>
            <i>→</i>
            <span>{s.home.tagOut}</span>
          </p>
        </div>
        <div className="manifesto-copy rv" style={{ "--rv": "200ms" } as CSSProperties}>
          <p>{s.home.copy}</p>
          {/* Short dates make some people wary, so the promise sits right under the pitch. */}
          <p className="mani-promise">
            <span aria-hidden="true">✓</span>
            {s.home.promise}
          </p>
          <div className="mani-actions">
            <button className="button" type="button" onClick={() => onNavigate("about")}>
              {s.home.story}
            </button>
            <button className="button outline" type="button" onClick={() => onContact("stock")}>
              {s.home.stock}
            </button>
          </div>
        </div>
      </section>

    </main>
  );
}

/** Reserve the toy's exact height, and fetch its physics and artwork before the footer arrives. */
function FooterPile() {
  const spot = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const node = spot.current;
    if (!node || seen) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        setSeen(true);
      }
    }, { rootMargin: "1000px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [seen]);
  const placeholder = <div className="pile-placeholder" ref={spot} aria-hidden="true" />;
  return seen ? <LoadBoundary fallback={<div className="pile-placeholder"><LoadingPage failed /></div>}>
    <Suspense fallback={placeholder}><BinPile /></Suspense>
  </LoadBoundary> : placeholder;
}

function Footer({ onNavigate, onContact }: { onNavigate: (page: Page, anchor?: string) => void; onContact: () => void }) {
  const s = useT(appStrings);
  return (
    <footer data-surface="deep">
      <FooterPile />
      <div className="footer-main">
        <div className="footer-brand">
          <p className="eyebrow">Cheaper Buy Miles</p>
          <h2>{s.footer.title}</h2>
          <button className="footer-ticket" type="button" onClick={onContact}>
            <span className="ft-tag">{s.footer.ticketTag}</span>
            <span className="ft-copy">
              <b>{s.footer.ticketTitle}</b>
              <small>{s.footer.ticketSub}</small>
            </span>
          </button>
        </div>
        <nav className="footer-links" aria-label={s.footer.navLabel}>
          <p className="footer-label">{s.footer.explore}</p>
          <button type="button" onClick={() => onNavigate("home")}>
            <small>01</small> {s.footer.links.home}
          </button>
          <button type="button" onClick={() => onNavigate("stores")}>
            <small>02</small> {s.footer.links.stores}
          </button>
          <button type="button" onClick={() => onNavigate("about")}>
            <small>03</small> {s.footer.links.about}
          </button>
          <button type="button" onClick={() => onNavigate("about", "suppliers")}>
            <small>04</small> {s.footer.links.suppliers}
          </button>
          <button type="button" onClick={onContact}>
            <small>05</small> {s.footer.links.contact}
          </button>
        </nav>
        <div className="footer-social-col">
          <p className="footer-label">{s.footer.followLabel}</p>
          <p className="footer-sub">{s.footer.followSub}</p>
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
            <button type="button" onClick={() => onNavigate("stores")} aria-label={s.footer.socialStores}>
              <span>4×</span>
            </button>
            <button type="button" onClick={onContact} aria-label={s.footer.links.contact}>
              <span>✉</span>
            </button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{s.footer.place}</span>
        <span>{s.footer.tagline}</span>
        <span>
          © {YEAR} Cheaper Buy Miles ·{" "}
          {/* The policies live on the current site until they move here. */}
          <a href="https://www.cheaperbuymiles.com/privacy-policy" target="_blank" rel="noopener noreferrer">
            {s.footer.privacy}
          </a>{" "}
          ·{" "}
          <a href="https://www.cheaperbuymiles.com/cookie-policy" target="_blank" rel="noopener noreferrer">
            {s.footer.cookies}
          </a>
        </span>
      </div>
    </footer>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>(() => routeFromLocation(window.location).page);
  const renderedPage = useRef(page);
  useLayoutEffect(() => { renderedPage.current = page; }, [page]);
  const [store, setStore] = useState(0);
  useReveal(page);

  const [swap, setSwap] = useState<Swap | null>(null);
  const sequence = useRef(0);
  const readyPage = useRef<Page | null>(null);
  const readyWaiters = useRef(new Set<() => void>());
  const swapping = useRef(false);
  const committedRoute = useRef(routeFromLocation(window.location));
  const contactReturnFocus = useRef<HTMLElement | null>(null);
  const [navigationError, setNavigationError] = useState(false);
  const [contactMounted, setContactMounted] = useState(window.location.hash === "#contact");
  const [contact, setContact] = useState<{ open: boolean; topic: Topic }>(() => ({
    open: window.location.hash === "#contact",
    topic: window.location.hash === "#contact" ? "stock" : "shop",
  }));

  const onPageReady = useCallback((arrived: Page) => {
    readyPage.current = arrived;
    for (const check of readyWaiters.current) check();
  }, []);
  const nextSequence = () => {
    const id = ++sequence.current;
    for (const check of readyWaiters.current) check();
    return id;
  };
  const waitForPage = (destination: Page, id: number) => new Promise<void>((resolve) => {
    const check = () => {
      if (readyPage.current !== destination && sequence.current === id) return;
      readyWaiters.current.delete(check);
      resolve();
    };
    readyWaiters.current.add(check);
    check();
  });
  useEffect(() => () => {
    sequence.current += 1;
    for (const check of readyWaiters.current) check();
  }, []);

  const scrollPage = (anchor?: string, smooth = false) => {
    const target = anchor ? document.getElementById(anchor) : null;
    // Layout offsets ignore the entry animation's temporary translate, which would otherwise
    // leave a direct link above its heading once that animation finishes.
    let top = 0;
    for (let node: HTMLElement | null = target; node; node = node.offsetParent as HTMLElement | null) {
      top += node.offsetTop;
      if (node !== target) top += node.clientTop;
    }
    window.scrollTo({ top, behavior: smooth ? "smooth" : "instant" });
  };
  const cover = async (next: Swap, smooth = false) => {
    await loadPage(next.to);
    if (next.n !== sequence.current) return;
    if (readyPage.current !== next.to) readyPage.current = null;
    flushSync(() => setPage(next.to));
    await waitForPage(next.to, next.n);
    await afterPaint();
    if (next.n !== sequence.current) return;
    scrollPage(next.anchor, smooth);
    if (next.history !== false) {
      const url = pageUrl(next.to, next.anchor, window.location);
      if (url !== window.location.pathname + window.location.search + window.location.hash) window.history.pushState(null, "", url);
    }
    committedRoute.current = { page: next.to, anchor: next.anchor };
    const heading = document.querySelector<HTMLElement>("main h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  };

  // Fetch the destination while the sticker lands, and peel only after it has rendered.
  const go = (nextPage: Page, anchor?: string, history = true) => {
    if (swapping.current) return;
    setNavigationError(false);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const samePage = nextPage === page;
    const next: Swap = { to: nextPage, anchor, n: nextSequence(), history };
    void loadPage(nextPage).catch(() => {});
    if (samePage || reduce) {
      void cover(next, samePage && !reduce).catch(() => { if (next.n === sequence.current) setNavigationError(true); });
    } else {
      swapping.current = true;
      setSwap(next);
    }
  };
  const navigate = (nextPage: Page) => go(nextPage);
  // Contact is a side panel over whatever page you are on.
  const openContact = (topic?: Topic) => {
    if (!contact.open) contactReturnFocus.current = document.activeElement as HTMLElement | null;
    setContactMounted(true);
    setContact((c) => ({ open: true, topic: topic ?? c.topic }));
  };
  const closeContact = useCallback(() => {
    setContact((c) => ({ ...c, open: false }));
    if (window.location.hash === "#contact") {
      window.history.replaceState(null, "", pageUrl(committedRoute.current.page, undefined, window.location));
      committedRoute.current = { page: committedRoute.current.page };
    }
  }, []);

  useEffect(() => {
    if (!contact.open) contactReturnFocus.current?.focus({ preventScroll: true });
  }, [contact.open]);
  useEffect(() => {
    const { anchor } = routeFromLocation(window.location);
    const initialSequence = sequence.current;
    let active = true;
    const initialPage = routeFromLocation(window.location).page;
    if (anchor && anchor !== "contact") void loadPage(initialPage).then(() => waitForPage(initialPage, initialSequence)).then(afterPaint).then(() => {
      if (active && initialSequence === sequence.current) scrollPage(anchor);
    }).catch(() => { if (active && initialSequence === sequence.current) setNavigationError(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const onPop = () => {
      const route = routeFromLocation(window.location);
      const next: Swap = { to: route.page, anchor: route.anchor, n: nextSequence(), history: false };
      swapping.current = false;
      setSwap(null);
      const isContact = route.anchor === "contact";
      if (isContact) setContactMounted(true);
      setContact((c) => ({ ...c, open: isContact }));
      // Language-only history changes leave the reader at the same place.
      if (route.page === renderedPage.current && route.page === committedRoute.current.page && route.anchor === committedRoute.current.anchor) return;
      void cover(next).catch(() => { if (next.n === sequence.current) setNavigationError(true); });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  });

  return (
    <>
      <div className="app-shell" inert={contact.open}>
        <Header page={page} onNavigate={navigate} onContact={() => openContact()} onPrepareContact={prepareContact} />
        <div key={page} className="page-in">
          <LoadBoundary fallback={<><LoadingPage failed /><PageReady page={page} onReady={onPageReady} /></>}>
          <Suspense fallback={<LoadingPage />}>
          {page === "home" && <Home onNavigate={navigate} onContact={openContact} />}
          {page === "stores" && <StoresPage active={store} onSelect={setStore} />}
          {page === "about" && <AboutPage onContact={() => openContact("stock")} />}
          <PageReady page={page} onReady={onPageReady} />
          </Suspense>
          </LoadBoundary>
        </div>
        <Footer onNavigate={go} onContact={() => openContact()} />
        <PageSwap swap={swap} onCover={async (next) => {
          try { await cover(next); }
          catch (error) { if (next.n === sequence.current) setNavigationError(true); throw error; }
        }} onDone={() => { swapping.current = false; setSwap(null); }} onCancel={() => {
          nextSequence();
          swapping.current = false;
          setPage(committedRoute.current.page);
          setSwap(null);
          setNavigationError(true);
        }} />
        {navigationError && <LoadingPage failed compact />}
      </div>
      {contactMounted && <LoadBoundary fallback={contact.open ? <ContactLoading failed onClose={closeContact} /> : null}>
      <Suspense fallback={contact.open ? <ContactLoading onClose={closeContact} /> : null}>
      <ContactPanel
        open={contact.open}
        topic={contact.topic}
        onTopic={(topic) => setContact((c) => ({ ...c, topic }))}
        onClose={closeContact}
      />
      </Suspense>
      </LoadBoundary>}
    </>
  );
}
