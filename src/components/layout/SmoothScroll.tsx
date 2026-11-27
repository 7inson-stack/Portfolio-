"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    const wrapper = document.querySelector<HTMLElement>(".scale-wrapper");
    const syncScaleWrapperHeight = () => {
      if (!wrapper) return;
      const scale =
        parseFloat(getComputedStyle(wrapper).getPropertyValue("--scale-factor")) || 1;
      if (scale < 1) {
        wrapper.style.marginBottom = `${-(wrapper.offsetHeight * (1 - scale))}px`;
      } else {
        wrapper.style.marginBottom = "0px";
      }
    };

    syncScaleWrapperHeight();
    const resizeObserver =
      wrapper && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(syncScaleWrapperHeight)
        : undefined;
    if (wrapper) resizeObserver?.observe(wrapper);
    window.addEventListener("resize", syncScaleWrapperHeight, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", syncScaleWrapperHeight);
    };
  }, []);

  return <>{children}</>;
}
