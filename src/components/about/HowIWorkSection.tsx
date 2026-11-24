"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";
import { Pause, Play } from "lucide-react";

export const WORK_WORDS = ["Obsess", "Design", "Code", "Ship"] as const;
export type WorkWord = typeof WORK_WORDS[number];

export const WORK_VIDEOS: Record<WorkWord, string> = {
  Obsess: "/videos/cosmos_1029327048.mp4",
  Design: "/videos/cosmos_236671030.mp4",
  Code: "/videos/cosmos_2067680266.mp4",
  Ship: "/videos/cosmos_341236427.mp4",
};

interface WordButtonProps {
  word: WorkWord;
  index: number;
  scrollProgress: MotionValue<number>;
  isActive: boolean;
  onHover: (word: WorkWord | null) => void;
  isXl: boolean;
}

function WordButton({
  word,
  index,
  scrollProgress,
  isActive,
  onHover,
  isXl,
}: WordButtonProps) {
  // Staggered reveal based on scroll through the section (matching chunk 15v6ezkecnd5u.js)
  const start = 0.1 * index;
  const end = start + 0.16;
  const et = useTransform(scrollProgress, [start, end], [0, 1]);
  const opacity = useTransform(et, [0, 1], [0.2, 1]);
  const y = useTransform(et, [0, 1], [20, 0]);

  // Arrow translation: slide from left on hover (duration: 0.3s, ease: easeOut)
  const arrowVariants = {
    rest: { x: isXl ? -56 : -32, opacity: 0 },
    hover: { x: 0, opacity: 1 },
  };

  // Text translation: shift right when active (duration: 0.3s, ease: easeOut)
  const textVariants = {
    rest: { x: 0 },
    hover: { x: isXl ? 76 : 44 },
  };

  const handleMouseEnter = () => onHover(word);
  const handleMouseLeave = () => onHover(null);
  const handleFocus = () => onHover(word);
  const handleBlur = () => onHover(null);
  const handleClick = () => onHover(isActive ? null : word);

  return (
    <motion.button
      type="button"
      className="text-display-sm relative -my-1 flex min-h-[44px] items-center overflow-visible border-none bg-transparent py-1 text-left font-normal cursor-pointer select-none text-background"
      style={{ opacity, y, color: "inherit", fontFamily: "inherit" }}
      initial="rest"
      animate={isActive ? "hover" : "rest"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
      aria-label={`View video for ${word}`}
    >
      {/* Animated Arrow Icon */}
      <span
        className="absolute left-0 flex h-6 w-8 items-center overflow-hidden xl:h-12 xl:w-14"
        aria-hidden="true"
      >
        <motion.div
          className="bg-background size-full"
          variants={arrowVariants}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            maskImage: 'url("/icons/right-arrow.svg")',
            WebkitMaskImage: 'url("/icons/right-arrow.svg")',
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
            maskSize: "contain",
            WebkitMaskSize: "contain",
          }}
        />
      </span>

      {/* Stacked Word Label */}
      <motion.span
        className="inline-block"
        variants={textVariants}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {word}
      </motion.span>
    </motion.button>
  );
}

export default function HowIWorkSection() {
  const [activeWord, setActiveWord] = useState<WorkWord>("Obsess");
  const [isPaused, setIsPaused] = useState(false);
  const [isXl, setIsXl] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const wordListRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasEndedRef = useRef<boolean>(false);
  const activeWordRef = useRef<WorkWord>("Obsess");

  useEffect(() => {
    activeWordRef.current = activeWord;
  }, [activeWord]);

  // Video element references for each word
  const videoRefs = {
    Obsess: useRef<HTMLVideoElement | null>(null),
    Design: useRef<HTMLVideoElement | null>(null),
    Code: useRef<HTMLVideoElement | null>(null),
    Ship: useRef<HTMLVideoElement | null>(null),
  };

  // Track responsive screen width for arrow offset
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    setIsXl(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsXl(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Motion value for scroll-based word reveal with spring physics from chunk 15v6ezkecnd5u.js
  const scrollRaw = useMotionValue(0);
  const scrollSpring = useSpring(scrollRaw, {
    stiffness: 110,
    damping: 26,
    mass: 0.35,
  });

  // Calculate scroll position across word list: (0.85 * innerHeight - top) / (0.55 * innerHeight)
  useEffect(() => {
    const handleScroll = () => {
      if (!wordListRef.current) return;
      const rect = wordListRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = 0.85 * vh;
      const end = 0.3 * vh;
      const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
      scrollRaw.set(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [scrollRaw]);

  // Video playback helper
  const playVideo = useCallback((word: WorkWord) => {
    const vid = videoRefs[word].current;
    if (vid) {
      vid.currentTime = 0;
      vid.play().catch(() => {});
    }
  }, []);

  // Word selection handler
  const handleWordSelect = useCallback(
    (word: WorkWord) => {
      hasEndedRef.current = false;
      setActiveWord(word);
      if (!isPaused) {
        playVideo(word);
      }
    },
    [isPaused, playVideo]
  );

  // Advance to next video
  const advanceNextWord = useCallback(() => {
    const current = activeWordRef.current;
    const currentIndex = WORK_WORDS.indexOf(current);
    const nextIndex = (currentIndex + 1) % WORK_WORDS.length;
    handleWordSelect(WORK_WORDS[nextIndex]);
  }, [handleWordSelect]);

  // Debounced hover handler
  const handleWordHover = useCallback(
    (word: WorkWord | null) => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }

      if (word !== null) {
        handleWordSelect(word);
      } else {
        hoverTimerRef.current = setTimeout(() => {
          hoverTimerRef.current = null;
        }, 50);
      }
    },
    [handleWordSelect]
  );

  // Video time update and auto-advance with strict hasEndedRef guard
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>, word: WorkWord) => {
    if (word !== activeWordRef.current || hasEndedRef.current) return;
    const vid = e.currentTarget;
    if (vid.duration && vid.currentTime >= vid.duration - 0.08) {
      hasEndedRef.current = true;
      advanceNextWord();
    }
  };

  const handleVideoEnded = (word: WorkWord) => {
    if (word !== activeWordRef.current || hasEndedRef.current) return;
    hasEndedRef.current = true;
    advanceNextWord();
  };

  // Toggle pause
  const togglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused((prev) => {
      const next = !prev;
      const activeVid = videoRefs[activeWord].current;
      if (activeVid) {
        if (next) activeVid.pause();
        else activeVid.play().catch(() => {});
      }
      return next;
    });
  };

  // Intersection observer to play video when in view
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const vid = videoRefs[activeWordRef.current].current;
        if (entry.isIntersecting) {
          if (!isPaused && vid) {
            vid.play().catch(() => {});
          }
        } else {
          vid?.pause();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(panel);
    return () => observer.disconnect();
  }, [isPaused]);

  return (
    <section className="text-background relative z-10" aria-labelledby="how-i-work-heading">
      {/* Section Header */}
      <motion.h2
        id="how-i-work-heading"
        className="text-caption md:text-body uppercase text-neutral-dark"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        HOW I WORK
      </motion.h2>

      <div className="mt-3 flex flex-col gap-10">
        {/* Top Media Row: Static Image (Desktop) + Video Player Container */}
        <div className="grid w-full grid-cols-4 items-stretch gap-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
          {/* Static Hero Image */}
          <motion.div
            className="relative hidden w-full overflow-hidden md:col-span-4 md:block md:h-full lg:col-span-7 lg:aspect-16/9 xl:col-span-9 xl:aspect-16/7"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          >
            <Image
              src="/images/how-i-work-hero.webp"
              alt=""
              fill
              sizes="(min-width: 1280px) 75vw, (min-width: 1024px) 70vw, (min-width: 768px) 50vw, 100vw"
              className="scale-[1.01] object-cover"
              aria-hidden="true"
            />
          </motion.div>

          {/* Interactive Video Container */}
          <motion.div
            ref={panelRef}
            className="bg-card-dark relative col-span-4 aspect-3/4 w-full cursor-pointer overflow-hidden sm:col-span-5 sm:col-start-1 md:col-span-4 md:col-start-5 md:aspect-3/4 lg:col-span-3 lg:col-start-8 lg:aspect-auto lg:h-full lg:cursor-default xl:col-span-3 xl:col-start-10"
            onClick={advanceNextWord}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          >
            {WORK_WORDS.map((word) => {
              const isActive = activeWord === word;
              return (
                <motion.div
                  key={word}
                  className="absolute inset-0 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <video
                    ref={videoRefs[word]}
                    src={WORK_VIDEOS[word]}
                    muted
                    playsInline
                    preload="auto"
                    onTimeUpdate={(e) => handleTimeUpdate(e, word)}
                    onEnded={() => handleVideoEnded(word)}
                    className="size-full object-cover"
                    aria-hidden="true"
                  />
                </motion.div>
              );
            })}

            {/* Play / Pause Toggle Button */}
            <button
              type="button"
              onClick={togglePause}
              aria-label={isPaused ? "Play videos" : "Pause videos"}
              className="bg-background/60 text-foreground hover:bg-background/80 absolute right-2 bottom-2 z-10 flex size-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors cursor-pointer"
            >
              {isPaused ? (
                <Play className="size-3.5" strokeWidth={2} aria-hidden="true" />
              ) : (
                <Pause className="size-3.5" strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          </motion.div>
        </div>

        {/* Bottom Content Row: Text Paragraph (Left) + Stacked Words (Right) */}
        <div className="grid w-full grid-cols-4 gap-x-4 gap-y-8 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
          {/* Left Paragraph */}
          <p className="text-section text-background col-span-4 sm:col-span-5 sm:col-start-1 md:col-span-7 md:col-start-1 lg:col-span-6 xl:col-span-6">
            Most of my time goes into the parts nobody sees — decisions, tradeoffs, things that get cut. What ships is what survives that process. I handle design and development together, which means faster decisions and fewer misunderstandings.
          </p>

          {/* Right-Side Typography Stack */}
          <div
            ref={wordListRef}
            className="hidden flex-col items-start gap-1 lg:col-span-3 lg:col-start-8 lg:flex xl:col-span-3 xl:col-start-10"
          >
            {WORK_WORDS.map((word, idx) => (
              <WordButton
                key={word}
                word={word}
                index={idx}
                scrollProgress={scrollSpring}
                isActive={activeWord === word}
                onHover={handleWordHover}
                isXl={isXl}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
