import { useEffect, useState } from "react";
import { openStatus, type OpenStatus } from "./stores";

/** Opening status in Melbourne time, refreshed every minute. */
export function useOpenStatus(): OpenStatus {
  const [status, setStatus] = useState(() => openStatus());
  useEffect(() => {
    const timer = window.setInterval(() => setStatus(openStatus()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return status;
}
