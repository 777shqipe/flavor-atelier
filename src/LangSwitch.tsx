import { HTML_LANG, LANGS, LANG_NAMES, useLang, type Lang } from "./i18n";
import "./langswitch.css";

/** Short labels for the pill; the full native name goes in the accessible name and tooltip. */
const SHORT: Record<Lang, string> = { en: "EN", vi: "VI", zh: "中文" };

/** Language picker: each option is written in its own language so it can be found without reading English. */
export function LangSwitch({ className = "", tabIndex }: { className?: string; tabIndex?: number }) {
  const { lang, setLang } = useLang();
  return (
    <div className={`lang ${className}`} role="group" aria-label="Language · Ngôn ngữ · 语言">
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          lang={HTML_LANG[code]}
          tabIndex={tabIndex}
          aria-label={LANG_NAMES[code]}
          title={LANG_NAMES[code]}
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
        >
          {SHORT[code]}
        </button>
      ))}
    </div>
  );
}
