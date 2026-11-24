"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, LayoutGroup } from "framer-motion";

export interface TechItem {
  cellId: string;
  name: string;
  href: string;
  icon: string;
  sizeClass: string;
  maxSizeClass: string;
  paddingClass: string;
  hideOnSm?: boolean;
}

export const TECH_ROW_1: TechItem[] = [
  {
    cellId: "first-row-cell-0",
    name: "React",
    href: "https://react.dev/",
    icon: "/icons/react-icon.svg",
    sizeClass: "size-24",
    maxSizeClass: "max-h-[50px] max-w-[50px] sm:max-h-14 sm:max-w-14 md:max-h-none md:max-w-none",
    paddingClass: "inline-flex size-full items-center justify-center p-4 sm:p-6 md:p-6 lg:p-8 xl:p-12",
  },
  {
    cellId: "first-row-cell-1",
    name: "Next.js",
    href: "https://nextjs.org/",
    icon: "/icons/nextjs-icon.svg",
    sizeClass: "size-36",
    maxSizeClass: "max-h-8 max-w-28 sm:max-h-9 sm:max-w-32 md:max-h-none md:max-w-none",
    paddingClass: "inline-flex size-full items-center justify-center p-4 sm:p-6 md:p-3 lg:p-6 xl:p-9 md:px-6 md:py-2 lg:px-8 lg:py-3 xl:px-14 xl:py-4",
  },
  {
    cellId: "first-row-cell-2",
    name: "TypeScript",
    href: "https://www.typescriptlang.org/",
    icon: "/icons/typescript-icon.svg",
    sizeClass: "size-24",
    maxSizeClass: "max-h-[50px] max-w-[50px] sm:max-h-14 sm:max-w-14 md:max-h-none md:max-w-none",
    paddingClass: "inline-flex size-full items-center justify-center p-4 sm:p-6 md:p-6 lg:p-8 xl:p-12",
  },
];

export const TECH_ROW_2: TechItem[] = [
  {
    cellId: "second-row-cell-0",
    name: "Kotlin",
    href: "https://kotlinlang.org/",
    icon: "/icons/kotlin-icon.svg",
    sizeClass: "size-16",
    maxSizeClass: "max-h-[50px] max-w-[50px] sm:max-h-14 sm:max-w-14 md:max-h-none md:max-w-none",
    paddingClass: "inline-flex size-full items-center justify-center p-4 sm:p-6 md:p-3 lg:p-6 xl:p-9",
  },
  {
    cellId: "second-row-cell-1",
    name: "Framer Motion",
    href: "https://motion.dev/",
    icon: "/icons/motion-icon.svg",
    sizeClass: "size-18",
    maxSizeClass: "max-h-[50px] max-w-[50px] sm:max-h-14 sm:max-w-14 md:max-h-none md:max-w-none",
    paddingClass: "inline-flex size-full items-center justify-center p-4 sm:p-6 md:p-3 lg:p-6 xl:p-9",
  },
  {
    cellId: "second-row-cell-2",
    name: "Tailwind CSS",
    href: "https://tailwindcss.com/",
    icon: "/icons/tailwind-icon.svg",
    sizeClass: "size-18",
    maxSizeClass: "max-h-[50px] max-w-[50px] sm:max-h-14 sm:max-w-14 md:max-h-none md:max-w-none",
    paddingClass: "inline-flex size-full items-center justify-center p-4 sm:p-6 md:p-3 lg:p-6 xl:p-9",
  },
  {
    cellId: "second-row-cell-3",
    name: "Webflow",
    href: "https://webflow.com/",
    icon: "/icons/webflow-icon.svg",
    sizeClass: "size-16",
    maxSizeClass: "max-h-[50px] max-w-[50px] sm:max-h-14 sm:max-w-14 md:max-h-none md:max-w-none",
    paddingClass: "inline-flex size-full items-center justify-center p-4 sm:p-6 md:p-3 lg:p-6 xl:p-9",
  },
  {
    cellId: "second-row-cell-4",
    name: "Figma",
    href: "https://www.figma.com/",
    icon: "/icons/figma-icon.svg",
    sizeClass: "size-16",
    maxSizeClass: "max-h-[50px] max-w-[50px] sm:max-h-14 sm:max-w-14 md:max-h-none md:max-w-none",
    paddingClass: "inline-flex size-full items-center justify-center p-4 sm:p-6 md:p-3 lg:p-6 xl:p-9",
  },
  {
    cellId: "second-row-cell-5",
    name: "Vercel",
    href: "https://vercel.com/home",
    icon: "/icons/vercel-icon.svg",
    sizeClass: "size-16",
    maxSizeClass: "max-h-[50px] max-w-[50px] sm:max-h-14 sm:max-w-14 md:max-h-none md:max-w-none",
    paddingClass: "inline-flex size-full items-center justify-center p-4 sm:p-6 md:p-3 lg:p-6 xl:p-9",
    hideOnSm: true,
  },
  {
    cellId: "second-row-cell-6",
    name: "GitHub",
    href: "https://github.com/dbuser03",
    icon: "/icons/github-icon.svg",
    sizeClass: "size-16",
    maxSizeClass: "max-h-[50px] max-w-[50px] sm:max-h-14 sm:max-w-14 md:max-h-none md:max-w-none",
    paddingClass: "inline-flex size-full items-center justify-center p-4 sm:p-6 md:p-3 lg:p-6 xl:p-9",
  },
];

export const ALL_TECH_ITEMS: TechItem[] = [...TECH_ROW_1, ...TECH_ROW_2];

const CELL_SPRING = {
  type: "spring" as const,
  stiffness: 170,
  damping: 24,
  mass: 0.9,
};

const headingVariants = {
  initial: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const containerVariants = {
  initial: {},
  visible: {
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.08,
    },
  },
};

const tightContainerVariants = {
  initial: {},
  visible: {
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

interface TechCellProps {
  item: TechItem;
  layoutId: string;
  className: string;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function TechCell({
  item,
  layoutId,
  className,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: TechCellProps) {
  return (
    <motion.div
      variants={itemVariants}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Sliding Inverted Dark Accent Tile */}
      {isActive && (
        <motion.div
          layoutId={layoutId}
          className="bg-background pointer-events-none absolute inset-0 z-20"
          transition={CELL_SPRING}
        />
      )}

      {/* Interactive Tile Link & Icon */}
      <div className="relative z-30 size-full">
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-30 flex size-full items-center justify-center focus-visible:z-40 focus-visible:-outline-offset-2"
          aria-label={`Visit ${item.name} website (opens in new tab)`}
          href={item.href}
          onFocus={onMouseEnter}
          onBlur={onMouseLeave}
        >
          <span className="sr-only">{item.name} (opens in new tab)</span>
          <div className={item.paddingClass}>
            <motion.div
              className={`${item.sizeClass} ${item.maxSizeClass}`}
              aria-hidden="true"
              style={{
                maskImage: `url("${item.icon}")`,
                WebkitMaskImage: `url("${item.icon}")`,
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
                maskSize: "contain",
                WebkitMaskSize: "contain",
              }}
              animate={{
                backgroundColor: isActive ? "#f6f6f6" : "#0a0a0a",
              }}
              transition={{ duration: 0.15 }}
            />
          </div>
        </a>
      </div>
    </motion.div>
  );
}

export default function TechStackSection() {
  const [activeCellId, setActiveCellId] = useState<string>("first-row-cell-0");
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mobileGridRef = useRef<HTMLDivElement>(null);

  const handleCellEnter = useCallback((cellId: string) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setActiveCellId(cellId);
  }, []);

  const handleCellLeave = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
    }
    leaveTimerRef.current = setTimeout(() => {
      setActiveCellId("first-row-cell-0");
    }, 50);
  }, []);

  const handleSectionLeave = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setActiveCellId("first-row-cell-0");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
      }
    };
  }, []);

  // Scroll highlight for mobile viewport
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      if (!window.matchMedia("(max-width: 1023px)").matches) return;
      if (!mobileGridRef.current) return;

      const rect = mobileGridRef.current.getBoundingClientRect();
      if (rect.height <= 0) return;

      const viewportH = window.innerHeight;
      const triggerY = 0.7 * viewportH;
      const totalSpan = rect.height + (triggerY - 0.3 * viewportH);
      const ratio = Math.max(0, Math.min(0.9999, (triggerY - rect.top) / totalSpan));

      const isSm = window.matchMedia("(min-width: 640px) and (max-width: 767px)").matches;
      const activeList = isSm
        ? ALL_TECH_ITEMS.filter((item) => item.name !== "Vercel")
        : ALL_TECH_ITEMS;

      const index = Math.floor(ratio * activeList.length);
      const targetCell = activeList[index]?.cellId;
      if (targetCell) {
        setActiveCellId(targetCell);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section
      className="relative z-20 flex w-full flex-col gap-0"
      aria-labelledby="tech-stack-heading"
      onMouseLeave={handleSectionLeave}
    >
      <motion.h2
        variants={headingVariants}
        initial="initial"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-caption md:text-body uppercase text-neutral-dark"
        id="tech-stack-heading"
      >
        MY TECH STACK
      </motion.h2>

      {/* =========================================================================
          TIER A: MOBILE & TABLET (lg:hidden)
          2 columns on phone, 3 on sm, 2 on md
          Tiles: aspect-square md:aspect-2/1
          Vercel tile: sm:hidden md:block
          ========================================================================= */}
      <LayoutGroup id="tech-stack-mobile">
        <motion.div
          ref={mobileGridRef}
          variants={containerVariants}
          initial="initial"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-3 grid w-full grid-cols-2 gap-0 sm:grid-cols-3 md:grid-cols-2 lg:hidden"
        >
          {ALL_TECH_ITEMS.map((item) => (
            <TechCell
              key={`mobile-${item.cellId}`}
              item={item}
              layoutId="tech-stack-highlight-mobile"
              className={`bg-foreground relative aspect-square md:aspect-2/1 ${
                item.hideOnSm ? "sm:hidden md:block" : ""
              }`}
              isActive={activeCellId === item.cellId}
              onMouseEnter={() => handleCellEnter(item.cellId)}
              onMouseLeave={handleCellLeave}
            />
          ))}
        </motion.div>
      </LayoutGroup>

      {/* =========================================================================
          TIER B: LAPTOP (hidden lg:contents xl:hidden)
          3 columns, 10 items
          Tiles: aspect-2/1 min-h-0
          ========================================================================= */}
      <div className="hidden lg:contents xl:hidden">
        <LayoutGroup id="tech-stack-lg">
          <motion.div
            variants={containerVariants}
            initial="initial"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-3 grid w-full grid-cols-3 gap-0"
          >
            {ALL_TECH_ITEMS.map((item) => (
              <TechCell
                key={`lg-${item.cellId}`}
                item={item}
                layoutId="tech-stack-highlight-lg"
                className="bg-foreground relative aspect-2/1 min-h-0"
                isActive={activeCellId === item.cellId}
                onMouseEnter={() => handleCellEnter(item.cellId)}
                onMouseLeave={handleCellLeave}
              />
            ))}
          </motion.div>
        </LayoutGroup>
      </div>

      {/* =========================================================================
          TIER C: DESKTOP & ULTRAWIDE (hidden xl:contents)
          Top row: 3 columns (React, Next.js, TS), aspect-3/2 min-h-0
          Bottom row: 7 columns (Kotlin, Motion, Tailwind, Webflow, Figma, Vercel, GitHub), aspect-square
          ========================================================================= */}
      <div className="hidden xl:contents">
        <LayoutGroup id="tech-stack-xl">
          {/* Top Row: 3 Core Technologies */}
          <motion.div
            variants={containerVariants}
            initial="initial"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-3 grid w-full grid-cols-3 gap-0"
          >
            {TECH_ROW_1.map((item) => (
              <TechCell
                key={`xl-${item.cellId}`}
                item={item}
                layoutId="tech-stack-highlight-xl"
                className="bg-foreground relative aspect-3/2 min-h-0"
                isActive={activeCellId === item.cellId}
                onMouseEnter={() => handleCellEnter(item.cellId)}
                onMouseLeave={handleCellLeave}
              />
            ))}
          </motion.div>

          {/* Bottom Row: 7 Specialized Technologies & Tools */}
          <motion.div
            variants={tightContainerVariants}
            initial="initial"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid w-full grid-cols-7 gap-0"
          >
            {TECH_ROW_2.map((item) => (
              <TechCell
                key={`xl-${item.cellId}`}
                item={item}
                layoutId="tech-stack-highlight-xl"
                className="bg-foreground relative aspect-square"
                isActive={activeCellId === item.cellId}
                onMouseEnter={() => handleCellEnter(item.cellId)}
                onMouseLeave={handleCellLeave}
              />
            ))}
          </motion.div>
        </LayoutGroup>
      </div>
    </section>
  );
}
