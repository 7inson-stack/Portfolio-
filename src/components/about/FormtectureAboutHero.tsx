"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

export default function FormtectureAboutHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse parallax motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Physics spring smoothing for subtle cursor parallax
  const springX = useSpring(mouseX, { stiffness: 45, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 45, damping: 25 });

  // Subtle portrait parallax
  const portraitX = useTransform(springX, [-0.5, 0.5], [-8, 8]);
  const portraitY = useTransform(springY, [-0.5, 0.5], [-8, 8]);

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
      id="about-hero-section"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="About Hero Section"
      className="relative z-10 flex min-h-[max(92vh,46rem)] w-full flex-col justify-between pt-[100px] sm:pt-[115px] md:pt-[130px] pb-12 sm:pb-16 md:pb-16 select-none"
    >
      {/* =========================================================
          1. MAIN HERO TYPOGRAPHY: JINSON SAMUEL
          - Clash Display font
          - Bold/heavy weight (700)
          - ALL CAPITAL LETTERS
          - Clearly visible, balanced space between JINSON and SAMUEL
          - Massive typography matching KREOFOLIO scale
          - Left margin: ~4.3% of viewport width
          - Right margin: ~4.3%
          - Occupies ~91.2% of the viewport width on ONE SINGLE LINE
          - Tight letter spacing (-0.035em)
          - Solid black text (#000000)
          - Orange square accent immediately after SAMUEL
          ========================================================= */}
      <motion.div
        className="relative z-10 w-full px-2 sm:px-4 md:px-[2.5vw] pb-6 sm:pb-8 flex justify-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1
          aria-label="JINSON SAMUEL"
          className="font-akzidenz font-black w-full text-center uppercase leading-[0.9] [word-spacing:0.22em] text-[#000000] whitespace-nowrap flex items-baseline justify-center"
        >
          <span className="inline-block origin-center scale-x-[1.32] text-[clamp(1.6rem,7.6vw,10.2rem)] tracking-[0.015em] [-webkit-text-stroke:0.02em_#000000]">
            JINSON SAMUEL
          </span>
        </h1>
      </motion.div>

      {/* =========================================================
          2. CONTENT COMPOSITION (Optimized Hero Proportions & Spacing)
          - Left: Dominant Main Title (Hey.), Subheading, Normal Text 1 & Normal Text 2
          - Right: Portrait image with role label
          ========================================================= */}
      <div className="relative z-10 mt-auto flex w-full flex-col lg:flex-row items-start lg:items-end justify-between gap-10 lg:gap-8 pt-10 sm:pt-14 md:pt-16">
        
        {/* LEFT SIDE: Typography Hierarchy */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-[3px] pt-8 sm:pt-16 lg:pt-[110px] flex w-full max-w-4xl flex-1 flex-col items-start text-left pr-0 lg:pr-6 xl:pr-10"
        >
          {/* Main Title: Hey. (132px desktop / 48px mobile, weight 800, line-height 0.94) */}
          <h2
            className="text-type-title font-extrabold tracking-[-0.03em] text-[#080808] leading-[0.94] mb-6 sm:mb-8 flex items-baseline"
            style={{
              fontFamily: '"Clash Display", "PP Neue Montreal", sans-serif',
            }}
          >
            <span>Hey</span>
            <span
              className="ml-[0.05em] inline-block size-[0.16em] bg-accent shrink-0 align-baseline"
              aria-hidden="true"
            />
          </h2>

          {/* Subheading: 30px desktop / 22px mobile, weight 600, line-height 1.2 */}
          <p className="font-sans text-type-subheading font-semibold leading-[1.2] tracking-[-0.015em] text-[#111111] max-w-3xl mb-6 sm:mb-7">
            I&apos;m Jinson Samuel — a full stack developer building modern digital experiences through design, code and technology.
          </p>

          {/* Normal Text 1: 22px desktop / 17px mobile, weight 400, line-height 1.5 */}
          <p className="font-sans text-type-body-1 font-normal leading-[1.5] text-[#4a4a4a] max-w-2xl mb-8 sm:mb-10">
            I combine creative thinking, modern frontend development and interactive experiences to turn ideas into refined digital products.
          </p>

          {/* Normal Text 2: 18px desktop / 15px mobile, weight 400, line-height 1.5 */}
          <div className="flex flex-wrap items-center gap-2.5 text-type-body-2 font-mono font-normal leading-[1.5] uppercase tracking-[0.16em] text-[#555555] mb-8 sm:mb-10">
            <span>FULL STACK DEVELOPER</span>
            <span className="text-accent text-[0.85em] leading-none">•</span>
            <span>INDIA</span>
            <span className="text-accent text-[0.85em] leading-none">•</span>
            <span>EST. 2026</span>
          </div>

          {/* Minimal Outlined Button: EXPLORE STACK */}
          <Link
            href="#tech-stack-section"
            className="group inline-flex items-center gap-3.5 border border-black/25 bg-transparent px-7 py-4 text-type-body-2 font-mono font-normal leading-[1.2] tracking-[0.16em] uppercase text-[#080808] transition-all duration-300 hover:border-black hover:bg-black hover:text-white"
          >
            <span>EXPLORE STACK</span>
            <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </Link>
        </motion.div>

        {/* RIGHT SIDE: Image component with text physically positioned on the LEFT, vertically centered */}
        <div className="flex flex-col sm:flex-row items-center justify-end self-end lg:self-end shrink-0 w-full sm:w-auto gap-5 sm:gap-7 md:gap-9">
          {/* Text block strictly on the LEFT of the photograph, vertically centered */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start sm:items-end justify-center text-left sm:text-right"
          >
            <span
              className="ml-[3px] lg:mt-[672px] [font-family:Arial] font-bold text-type-body-1 uppercase tracking-tight text-[#080808] whitespace-nowrap leading-[1.1] select-none"
            >
              FULL STACK DEVELOPER
            </span>
          </motion.div>

          <motion.div
            style={{ x: portraitX, y: portraitY }}
            initial={{
              clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
              scale: 1.08,
              opacity: 0,
            }}
            animate={{
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: 1.0,
              delay: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative w-[300px] sm:w-[360px] md:w-[420px] lg:w-[460px] xl:w-[520px] h-[410px] sm:h-[495px] md:h-[575px] lg:h-[630px] xl:h-[700px] overflow-hidden bg-neutral-900 shadow-2xl cursor-pointer shrink-0"
          >
            <Image
              src="/images/PROFILE_2.jpeg"
              alt="Jinson Samuel - Creative Developer"
              fill
              priority
              sizes="(min-width: 1280px) 520px, (min-width: 1024px) 460px, (min-width: 768px) 420px, 300px"
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
