"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type MetaWindow = Window & {
  fbq?: (...args: unknown[]) => void;
};

export default function MetaPageView() {
  const pathname = usePathname();

  useEffect(() => {
    const eventId = crypto.randomUUID();
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      const fbq = (window as MetaWindow).fbq;

      if (fbq) {
        fbq("track", "PageView", {}, { eventID: eventId });
        window.clearInterval(timer);
      } else if (tries >= 20) {
        window.clearInterval(timer);
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, [pathname]);

  return null;
}
