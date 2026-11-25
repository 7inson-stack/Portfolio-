"use client";

import React, { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import BarPreloaderDOT from "./BarPreloaderDOT";

export default function PreloaderWrapper() {
  const router = useRouter();
  const pathname = usePathname();

  const handlePreloaderComplete = useCallback(() => {
    // Only automatically navigate to About if the user opens the root/landing page
    if (pathname === "/") {
      router.push("/about");
    }
  }, [pathname, router]);

  return (
    <BarPreloaderDOT
      duration={2.2}
      easing="ease-out"
      holdDuration={0.35}
      backgroundColor="#0a0a0a"
      barColor="#ffffff"
      barTextColor="#0a0a0a"
      showCounter={true}
      counterColor="#0a0a0a"
      subtitleText="DANIELE BUSER © 2026"
      loadingText="LOADING..."
      completeText="READY"
      showOncePerSession={false}
      onComplete={handlePreloaderComplete}
    />
  );
}
