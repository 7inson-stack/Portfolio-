"use client";

import { motion } from "framer-motion";
import React from "react";

interface HeroTitleInViewProps {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "div";
  className?: string;
  ariaLabel?: string;
  yOffset?: number;
  delay?: number;
  duration?: number;
  viewport?: { once?: boolean; amount?: number };
}

export default function HeroTitleInView({
  children,
  as: Component = "h1",
  className = "",
  ariaLabel,
  yOffset = 48,
  delay = 0,
  duration = 0.2,
  viewport = { once: false, amount: 0.2 },
}: HeroTitleInViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <Component className={className} aria-label={ariaLabel}>
        {children}
      </Component>
    </motion.div>
  );
}
