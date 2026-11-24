"use client";

import React, { useState, useCallback, useEffect } from "react";
import BackgroundGrid from "./BackgroundGrid";

interface StickyPageLayoutProps {
  children: React.ReactNode;
  contacts?: React.ReactNode;
  theme?: "light" | "dark";
}

export default function StickyPageLayout({
  children,
  contacts,
  theme = "light",
}: StickyPageLayoutProps) {
  const [height, setHeight] = useState<number>(0);

  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    const updateHeight = () => {
      const rect = node.getBoundingClientRect();
      if (rect.height > 0) {
        setHeight(rect.height);
      }
    };

    updateHeight();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        updateHeight();
      });
      observer.observe(node);
      return () => observer.disconnect();
    }
  }, []);

  const topStyle = height > 0 ? `calc(100vh - ${height}px)` : "auto";

  return (
    <>
      <div
        ref={measureRef}
        className="sticky z-0 mx-auto flex w-full max-w-480 flex-col gap-0"
        style={{ top: topStyle }}
      >
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <BackgroundGrid theme={theme} />
        </div>
        <div className="relative z-10">{children}</div>
      </div>
      {contacts}
    </>
  );
}
