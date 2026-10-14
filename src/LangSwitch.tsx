import { useEffect, useRef, useState } from "react";
import { LANGS, LANG_NAMES, HTML_LANG, useLang, type Lang } from "./i18n";
import "./langswitch.css";

/** Short labels for the closed button; the full native name goes in the list. */
const SHORT: Record<Lang, string> = { en: "EN", vi: "VI", zh: "中文", it: "IT", ja: "日本語" };

/**
 * Language picker. Each option is written in its own language so it can be found without reading English.
 * `menu` is a button that opens a small list (header bar); `list` shows every language at once (mobile menu).
 */
export function LangSwitch({ variant, className = "", tabIndex }: { variant: "menu" | "list"; className?: string; tabIndex?: number }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const options = LANGS.map((code) => (
    <button
      key={code}
      type="button"
      lang={HTML_LANG[code]}
      tabIndex={variant === "list" ? tabIndex : undefined}
      aria-pressed={lang === code}
      onClick={() => {
        setLang(code);
        setOpen(false);
      }}
    >
      {LANG_NAMES[code]}
    </button>
  ));

  if (variant === "list") {
    return (
      <div className={`lang lang-list ${className}`} role="group" aria-label="Language · Ngôn ngữ · 语言 · Lingua · 言語">
        {options}
      </div>
    );
  }

  return (
    <div className={`lang lang-menu ${className}`} ref={root}>
      <button
        className="lang-btn"
        type="button"
        lang={HTML_LANG[lang]}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Language: ${LANG_NAMES[lang]}`}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{SHORT[lang]}</span>
        <svg className="caret" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2 3.5l3 3 3-3" />
        </svg>
      </button>
      {open && (
        <div className="lang-pop" role="group" aria-label="Language · Ngôn ngữ · 语言 · Lingua · 言語">
          {options}
        </div>
      )}
    </div>
  );
}
