"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

export default function KreoHeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse parallax motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Physics spring smoothing for subtle cursor parallax
  const springX = useSpring(mouseX, { stiffness: 45, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 45, damping: 25 });

  // Layered parallax transformations
  // Diamonds move softly in opposite directions for visual depth
  const diamond1X = useTransform(springX, [-0.5, 0.5], [-25, 25]);
  const diamond1Y = useTransform(springY, [-0.5, 0.5], [-18, 18]);
  const diamond2X = useTransform(springX, [-0.5, 0.5], [20, -20]);
  const diamond2Y = useTransform(springY, [-0.5, 0.5], [15, -15]);

  // Portrait subtle parallax
  const portraitX = useTransform(springX, [-0.5, 0.5], [-10, 10]);
  const portraitY = useTransform(springY, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="Hero Section"
      className="relative z-10 flex min-h-[max(92vh,46rem)] w-full flex-col justify-between pt-16 pb-8 sm:pt-20 sm:pb-12 md:pt-16 md:pb-16 select-none overflow-hidden"
    >
      {/* =========================================================
          3. GEOMETRIC BACKGROUND GRAPHICS (Kreofolio Diamonds)
          - Large overlapping diamond shapes rotated 45deg
          - Very light subtle grey tone against the background
          - Extending beyond the visible viewport
          - Ambient floating and mouse parallax movement
          - Positioned in center and left side
          ========================================================= */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Diamond 1 (Left & Lower) */}
        <motion.div
          style={{ x: diamond1X, y: diamond1Y }}
          animate={{
            y: [0, -14, 0],
            rotate: [45, 46.5, 45],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-24 bottom-[-15%] sm:-left-16 sm:bottom-[-10%] md:-left-8 md:bottom-[-5%] size-[340px] sm:size-[460px] md:size-[560px] lg:size-[680px] bg-[#f5f5f5] opacity-90 shadow-sm"
        />

        {/* Diamond 2 (Center-Left overlapping) */}
        <motion.div
          style={{ x: diamond2X, y: diamond2Y }}
          animate={{
            y: [0, 12, 0],
            rotate: [45, 43.5, 45],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[20%] bottom-[-22%] sm:left-[24%] sm:bottom-[-15%] md:left-[28%] md:bottom-[-10%] size-[300px] sm:size-[400px] md:size-[500px] lg:size-[620px] bg-[#f1f1f1] opacity-80 shadow-xs"
        />
      </div>

      {/* =========================================================
          1. MAIN HERO TYPOGRAPHY (Top)
          - "JINSON SAMUEL" in ALL CAPITAL LETTERS
          - Massive, bold, heavy sans-serif typography (Anton / Neue Haas Grotesk Bold / Helvetica Neue)
          - Kept on ONE SINGLE LINE on desktop spanning almost full width
          - Deep black (#050505) with orange square accent
          ========================================================= */}
      <motion.div
        className="relative z-10 w-full overflow-hidden border-b border-black/10 pb-4 sm:pb-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1
          aria-label="JINSON SAMUEL."
          className="w-full text-left font-akzidenz text-[clamp(2.75rem,8.3vw,11.4rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.035em] text-[#050505] whitespace-nowrap overflow-hidden text-ellipsis flex items-baseline justify-start"
        >
          <span>JINSON SAMUEL</span>
          {/* Orange square accent after the name */}
          <span
            className="ml-[0.06em] inline-block size-[0.11em] bg-accent shrink-0 align-baseline translate-y-[-0.1em]"
            aria-hidden="true"
          />
        </h1>
      </motion.div>

      {/* =========================================================
          2. MIDDLE WHITESPACE & 4. BOTTOM-RIGHT COMPOSITION
          - Middle: Generous whitespace showcasing geometric diamonds
          - Bottom Right:
              - Identity label: "[ CREATIVE DEVELOPER ]" and "JINSON SAMUEL"
              - Compact portrait (approx 18-20% desktop width, ~400-420px height)
          ========================================================= */}
      <div className="relative z-10 mt-auto flex w-full flex-col sm:flex-row items-end justify-end pt-24 sm:pt-32 md:pt-40">
        {/* Container grouping Identity Label + Compact Portrait */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-end gap-6 sm:gap-8 md:gap-10">
          {/* 4. FOUNDER / PERSONAL IDENTITY BLOCK */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start sm:items-end text-left sm:text-right pb-1 select-none"
          >
            <span className="font-mono text-[0.68rem] sm:text-xs uppercase tracking-[0.22em] text-[#6b6b6b] font-medium">
              [ CREATIVE DEVELOPER ]
            </span>
            <span className="mt-1 font-akzidenz text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-tight text-[#050505]">
              JINSON SAMUEL
            </span>
          </motion.div>

          {/* 2. COMPACT PORTRAIT IMAGE (Match Kreofolio proportions)
              - Desktop width ~18-20vw (approx 280-320px)
              - Height ~390-430px (aspect-3/4 or 4/5)
              - Clean rectangular edges, no excessive decoration
              - Cinematic clip-path reveal and mouse parallax
          */}
          <motion.div
            style={{ x: portraitX, y: portraitY }}
            initial={{
              clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
              scale: 1.12,
              opacity: 0,
            }}
            animate={{
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: 1.1,
              delay: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative w-[240px] sm:w-[260px] md:w-[290px] lg:w-[320px] h-[330px] sm:h-[360px] md:h-[400px] lg:h-[430px] overflow-hidden bg-neutral-900 shadow-xl cursor-pointer shrink-0"
          >
            <Image
              src="/images/PROFILE_2.jpeg"
              alt="Jinson Samuel"
              fill
              priority
              sizes="(min-width: 1024px) 320px, (min-width: 768px) 290px, 240px"
              className={`object-cover object-center select-none pointer-events-none transition-transform duration-700 ease-out ${
                isHovered ? "scale-[1.06]" : "scale-100"
              }`}
            />
            {/* Subtle soft lighting vignette */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-60" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
