"use client";

import { useEffect, useState } from "react";

export default function Footer() {
  const [timeStr, setTimeStr] = useState("17:27");

  useEffect(() => {
    function updateSwissTime() {
      try {
        const now = new Date();
        const swissTime = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Europe/Zurich",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(now);
        setTimeStr(swissTime);
      } catch {
        // Fallback
      }
    }

    updateSwissTime();
    const interval = setInterval(updateSwissTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer
      className="pointer-events-none fixed bottom-0 left-1/2 z-30 flex w-full max-w-480 -translate-x-1/2 flex-col p-4 mix-blend-difference"
      aria-label="Site footer with location and time"
    >
      <div className="pointer-events-auto w-fit select-none">
        <p className="text-caption md:text-body text-foreground leading-tight">
          LUGANO - <span>{timeStr}</span>
        </p>
        <p className="text-caption md:text-body text-neutral">
          46° 00&apos; 13.24&quot; - 08° 57&apos; 03.79&quot;
        </p>
      </div>
    </footer>
  );
}
