import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { HTML_LANG, LANGS, LOCALE, LangCtx, type Lang } from ".";

const isLang = (value: unknown): value is Lang => LANGS.includes(value as Lang);

/** The language prefix of a path, if there is one: `/vi/stores` gives `vi`. */
function pathLang(pathname: string): Lang | undefined {
  const first = pathname.split("/")[1];
  return isLang(first) && first !== "en" ? first : undefined;
}

const stripPrefix = (pathname: string) => {
  const lang = pathLang(pathname);
  return lang ? pathname.slice(lang.length + 1) || "/" : pathname;
};

const urlFor = (lang: Lang) => {
  const { pathname, search, hash } = window.location;
  const base = stripPrefix(pathname);
  return (lang === "en" ? base : `/${lang}${base === "/" ? "/" : base}`) + search + hash;
};

/** The URL decides: a language prefix, or English. Nothing is guessed from the browser, nothing remembered. */
const initialLang = (): Lang => pathLang(window.location.pathname) ?? "en";

const FONT_HREF: Partial<Record<Lang, string>> = {
  vi: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@400..800&family=Be+Vietnam+Pro:wght@400;500;600;700&family=Patrick+Hand&family=Playfair+Display:wght@400;700&display=swap",
  zh: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&family=Noto+Serif+SC:wght@500;700&display=swap",
  ja: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Noto+Serif+JP:wght@500;700&display=swap",
};

/** The Latin display fonts already cover Italian and most of Vietnamese; the extra families load only on the pages that need them. */
function loadFonts(lang: Lang) {
  const href = FONT_HREF[lang];
  if (!href || document.querySelector(`link[data-lang-font="${lang}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.langFont = lang;
  document.head.appendChild(link);
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  // Before paint, so the right font stacks apply from the first frame.
  useLayoutEffect(() => {
    document.documentElement.lang = HTML_LANG[lang];
  }, [lang]);

  useEffect(() => {
    loadFonts(lang);
  }, [lang]);

  useEffect(() => {
    // Back and forward between /vi/ and / switch the language too.
    const onPop = () => setLangState(pathLang(window.location.pathname) ?? "en");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const setLang = useCallback((next: Lang) => {
    window.history.pushState(null, "", urlFor(next));
    setLangState(next);
  }, []);

  const value = useMemo(() => ({ lang, locale: LOCALE[lang], setLang }), [lang, setLang]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

