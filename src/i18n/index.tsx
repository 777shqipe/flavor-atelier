import { createContext, useContext, type ReactElement, type ReactNode } from "react";
import "./i18n.css";

/**
 * Languages: English is the source and lives at `/`; the others live under a path prefix
 * (`/vi/`, `/zh/`, `/it/`, `/ja/`) so every language has its own shareable URL.
 */
export const LANGS = ["en", "vi", "zh", "it", "ja"] as const;
export type Lang = (typeof LANGS)[number];

/** Each language written in itself, for the switcher. */
export const LANG_NAMES: Record<Lang, string> = { en: "English", vi: "Tiếng Việt", zh: "中文", it: "Italiano", ja: "日本語" };
/** Value of `<html lang>`; it also drives the per-language font stacks in i18n.css. */
export const HTML_LANG: Record<Lang, string> = { en: "en", vi: "vi", zh: "zh-Hans", it: "it", ja: "ja" };
/** Locale for dates and numbers. */
export const LOCALE: Record<Lang, string> = { en: "en-AU", vi: "vi-VN", zh: "zh-CN", it: "it-IT", ja: "ja-JP" };

/* ---------- strings ---------------------------------------------------- */
// One `defineStrings` per component, in `src/i18n/strings/<Component>.tsx`. English is the
// source of truth; every other language must carry exactly the same keys with the same shapes, which
// TypeScript enforces. A value is a string, JSX, a function (for placeholders and plurals),
// or an array / object of those.

type Shape<T> = T extends string
  ? string
  : T extends (...args: infer A) => infer R
    ? (...args: A) => R
    : T extends ReactElement
      ? ReactNode
      : T extends readonly unknown[]
        ? { [K in keyof T]: Shape<T[K]> }
        : T extends object
          ? { [K in keyof T]: Shape<T[K]> }
          : T;

export type Strings<T> = { en: T; vi: Shape<NoInfer<T>>; zh: Shape<NoInfer<T>>; it: Shape<NoInfer<T>>; ja: Shape<NoInfer<T>> };

/** Declares one component's text in all languages. */
export function defineStrings<T extends object>(strings: Strings<T>): Strings<T> {
  return strings;
}

/* ---------- language state --------------------------------------------- */
// The provider that owns it lives in LangProvider.tsx.

export type LangContext = {
  lang: Lang;
  /** BCP 47 locale for `toLocaleDateString` and friends. */
  locale: string;
  setLang: (lang: Lang) => void;
};

export const LangCtx = createContext<LangContext>({ lang: "en", locale: LOCALE.en, setLang: () => {} });

export const useLang = () => useContext(LangCtx);

const cache = new WeakMap<object, Partial<Record<Lang, unknown>>>();

/** Picks a component's strings for the current language; the object is stable between renders. */
export function useT<T extends object>(strings: Strings<T>): T {
  const { lang } = useLang();
  return pick(strings, lang);
}

/** Same as `useT`, for code that already knows the language (hooks, helpers outside React). */
export function pick<T extends object>(strings: Strings<T>, lang: Lang): T {
  if (lang === "en") return strings.en;
  const slot = cache.get(strings) ?? {};
  cache.set(strings, slot);
  return (slot[lang] ??= { ...strings.en, ...(strings[lang] as object) }) as T;
}

/** The gap between a number or a Latin word and the text next to it: Japanese typesetting uses none. */
export const gap = (lang: Lang) => (lang === "ja" ? "" : " ");
