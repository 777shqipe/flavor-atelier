import { useEffect, useState } from "react";
import { useLang } from "./i18n";
import { openStatus, type OpenStatus } from "./stores";

/** Opening status in Melbourne time, refreshed every minute. */
export function useOpenStatus(active = true): OpenStatus {
  const { lang } = useLang();
  const [status, setStatus] = useState(() => openStatus(new Date(), lang));
  useEffect(() => {
    const refresh = () => {
      if (document.hidden) return;
      const next = openStatus(new Date(), lang);
      // Nothing changed since last minute: keep the old object, so nothing renders again.
      setStatus((prev) => (prev.open === next.open && prev.label === next.label && prev.short === next.short ? prev : next));
    };
    if (!active) return;
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [lang, active]);
  return status;
}
