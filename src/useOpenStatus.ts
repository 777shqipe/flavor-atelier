import { useEffect, useState } from "react";
import { useLang } from "./i18n";
import { openStatus, type OpenStatus } from "./stores";

/** Opening status in Melbourne time, refreshed every minute. */
export function useOpenStatus(): OpenStatus {
  const { lang } = useLang();
  const [status, setStatus] = useState(() => openStatus(new Date(), lang));
  useEffect(() => {
    const refresh = () => {
      const next = openStatus(new Date(), lang);
      // Nothing changed since last minute: keep the old object, so nothing renders again.
      setStatus((prev) => (prev.open === next.open && prev.label === next.label ? prev : next));
    };
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(timer);
  }, [lang]);
  return status;
}
