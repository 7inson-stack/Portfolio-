"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Folder, FolderOpen, ChevronRight, File } from "lucide-react";
import StickyPageLayout from "@/components/layout/StickyPageLayout";
import ContactsSection from "@/components/common/ContactsSection";
import { entranceVariants, motionTokens } from "@/lib/animations";

const COLOR_SWATCHES = [
  { hex: "#0a0a0a", rgb: "10 10 10", pms: "Black 6 C" },
  { hex: "#262626", rgb: "38 38 38", pms: "426 C" },
  { hex: "#737373", rgb: "115 115 115", pms: "424 C" },
  { hex: "#e5e5e5", rgb: "229 229 229", pms: "663 C" },
  { hex: "#f7f7f7", rgb: "247 247 247", pms: "7436 C" },
];

const ARCHITECTURE_FOLDERS = [
  {
    name: "app/",
    path: "app",
    files: ["layout.tsx", "page.tsx", "globals.css"],
  },
  {
    name: "components/",
    path: "components",
    files: ["EarthGlobeAscii.tsx", "Telemetry.tsx", "Button.tsx"],
  },
  {
    name: "constants/",
    path: "constants",
    files: ["colors.ts", "navigation.ts"],
  },
  {
    name: "hooks/",
    path: "hooks",
    files: ["useMouseParallax.ts", "useTelemetry.ts"],
  },
  {
    name: "lib/",
    path: "lib",
    files: ["asciiShader.ts", "utils.ts"],
  },
  {
    name: "types/",
    path: "types",
    files: ["telemetry.d.ts", "projects.d.ts"],
  },
];

const CODE_SNIPPETS: Record<string, string> = {
  "CodePlaceholder.tsx": `"use client";

export default function CodePlaceholder() {
  return (
    <div className="my-auto flex size-full flex-col items-center justify-center p-8 select-none">
      <p className="text-body text-neutral font-normal">
        Select a file to view its implementation.
      </p>
    </div>
  );
}`,
  "EarthGlobeAscii.tsx": `import { useEffect, useRef } from "react";
import * as THREE from "three";

export function EarthGlobeAscii({ dark = true }: { dark?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Custom ASCII fragment shader with luminance quantization
    const material = new THREE.ShaderMaterial({
      uniforms: {
        asciiAtlas: { value: asciiAtlasTexture },
        charSize: { value: 8.0 * window.devicePixelRatio },
        resolution: { value: new THREE.Vector2() },
        asciiColor: { value: new THREE.Color(dark ? 0xc8c8c8 : 0x0a0a0a) }
      },
      fragmentShader: asciiFrag
    });
  }, [dark]);

  return <div ref={containerRef} className="size-full overflow-hidden" />;
}`,
  "useMouseParallax.ts": `import { useMotionValue, useSpring } from "framer-motion";

export function useMouseParallax() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 240, damping: 22, mass: 0.1 });
  const springY = useSpring(my, { stiffness: 240, damping: 22, mass: 0.1 });

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(x * 50);
    my.set(y * 30);
  };

  const onMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return { springX, springY, onMouseMove, onMouseLeave };
}`,
  "layout.tsx": `export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased selection:bg-foreground selection:text-background">
        {children}
      </body>
    </html>
  );
}`,
};

export default function LeonardoBerselliPage() {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<string>("CodePlaceholder.tsx");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    components: true,
  });

  // LeonardoUI live states
  const [clickCount, setClickCount] = useState<number>(0);
  const [isEngineActive, setEngineActive] = useState<boolean>(true);
  const [uptime, setUptime] = useState<number>(38);
  const [progress, setProgress] = useState<number>(100);
  const [coreLoad, setCoreLoad] = useState<number>(12);
  const [clientEnv, setClientEnv] = useState({
    cores: "24",
    gpu: "Intel",
    res: "1536x791",
    os: "Windows",
    language: "en-GB",
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const toggleVideo = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      setIsVideoPlaying(true);
    } else {
      vid.pause();
      setIsVideoPlaying(false);
    }
  };

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setClientEnv({
        cores: `${navigator.hardwareConcurrency || 24}`,
        gpu: "Intel",
        res: `${window.innerWidth}x${window.innerHeight}`,
        os: navigator.platform?.includes("Win") ? "Windows" : navigator.platform?.includes("Mac") ? "MacOS" : "Linux",
        language: navigator.language || "en-GB",
      });
    }

    const interval = setInterval(() => {
      setUptime((prev) => prev + 1);
      setCoreLoad((prev) => (isEngineActive ? 12 + (prev % 5) : 3));
    }, 1000);

    return () => clearInterval(interval);
  }, [isEngineActive]);

  // 3D ASCII Globe Animation on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let angle = 0;
    const chars = " .:-=+*#%@";

    const render = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = isEngineActive ? "#000000" : "#000000";
      ctx.font = "bold 9px monospace";

      const rows = 24;
      const cols = 48;
      const radius = 9.5;

      for (let i = 0; i < rows; i++) {
        const phi = (i / rows) * Math.PI;
        for (let j = 0; j < cols; j++) {
          const theta = (j / cols) * 2 * Math.PI + angle;
          const x = radius * Math.sin(phi) * Math.cos(theta);
          const y = radius * Math.cos(phi);
          const z = radius * Math.sin(phi) * Math.sin(theta);

          if (z > 0) {
            const charIdx = Math.floor(((z + radius) / (2 * radius)) * (chars.length - 1));
            const screenX = canvas.width / 2 + x * 7.5;
            const screenY = canvas.height / 2 + y * 7;
            ctx.fillText(chars[charIdx] || ".", screenX, screenY);
          }
        }
      }

      angle += isEngineActive ? 0.012 : 0.002;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isEngineActive]);

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const currentCode = CODE_SNIPPETS[selectedFile] || CODE_SNIPPETS["CodePlaceholder.tsx"];
  const codeLines = currentCode.split("\n");

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="bg-foreground flex w-full flex-1 flex-col justify-start gap-0 px-4 focus:outline-none"
      aria-label="Leonardo Berselli's Portfolio project page main content"
    >
      <StickyPageLayout contacts={<ContactsSection />}>
        <div className="text-background relative z-10 flex min-h-screen w-full flex-col pt-32 pb-48">
          <div className="my-auto flex w-full flex-col gap-20">
            {/* Header: Title and Year */}
            <div className="flex flex-col">
              <motion.h1
                id="project-detail-title"
                className="text-display-md text-background relative z-10 -ml-1"
                aria-label="Leonardo Berselli's Portfolio - Project heading"
                variants={entranceVariants(motionTokens.delay.none, motionTokens.distance.hero)}
                initial="initial"
                animate="visible"
              >
                Leonardo Berselli&apos;s Portfolio
              </motion.h1>
              <motion.p
                className="text-section text-neutral-dark mt-3 font-normal"
                variants={entranceVariants(motionTokens.delay.short, motionTokens.distance.base)}
                initial="initial"
                animate="visible"
              >
                2026
              </motion.p>
            </div>

            {/* Hero Media: Floating Video Frame + 3-Image Showcase Gallery */}
            <div className="flex flex-col gap-4">
              {/* Main Showcase Video Frame */}
              <motion.div
                className="border-foreground/10 relative aspect-16/10 w-full overflow-hidden border select-none sm:aspect-16/9 xl:aspect-21/9"
                variants={entranceVariants(motionTokens.delay.base, motionTokens.distance.base)}
                initial="initial"
                animate="visible"
              >
                {/* Blurred Backdrop Image */}
                <Image
                  src="/projects/leonardo-berselli-portfolio/leonardo-berselli-portfolio.webp"
                  alt="Leonardo Berselli's Portfolio Hero Image"
                  fill
                  priority
                  sizes="100vw"
                  className="pointer-events-none scale-105 object-cover blur-md brightness-60 select-none"
                />
                <div className="bg-background/25 pointer-events-none absolute inset-0 select-none" />

                {/* Floating Centered Video with Drop Shadow */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-3 sm:p-6 lg:p-8">
                  <div className="flex size-full items-center justify-center">
                    <div className="border-foreground/15 bg-background relative aspect-2304/1302 h-[88%] max-w-[94%] overflow-hidden rounded-xs border shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6),0_6px_16px_-4px_rgba(0,0,0,0.4)]">
                      <video
                        ref={videoRef}
                        src="/projects/leonardo-berselli-portfolio/leonardo-berselli-showcase.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className="size-full object-cover"
                        aria-label="Leonardo Berselli's Portfolio showcase video"
                      />
                      {/* Play / Pause Toggle Button */}
                      <button
                        type="button"
                        onClick={toggleVideo}
                        aria-label={isVideoPlaying ? "Pause showcase video" : "Play showcase video"}
                        className="bg-background/60 text-foreground hover:bg-background/80 pointer-events-auto absolute right-2 bottom-2 z-10 flex size-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors cursor-pointer"
                      >
                        {isVideoPlaying ? (
                          <Pause className="size-3.5" strokeWidth={2} aria-hidden="true" />
                        ) : (
                          <Play className="size-3.5" strokeWidth={2} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 3-Image Showcase Gallery Row */}
              <motion.div
                className="grid grid-cols-12 gap-4"
                variants={entranceVariants(motionTokens.delay.long, motionTokens.distance.base)}
                initial="initial"
                animate="visible"
              >
                <div className="col-span-12 sm:col-span-6 md:col-span-4">
                  <div className="relative aspect-3/4 w-full overflow-hidden">
                    <Image
                      src="/projects/leonardo-berselli-portfolio/leonardo-berselli-vertical-1.webp"
                      alt="Leonardo Berselli's Portfolio Showcase 1"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 33vw"
                      className="scale-[1.01] object-cover"
                    />
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-6 md:col-span-4">
                  <div className="relative aspect-3/4 w-full overflow-hidden">
                    <Image
                      src="/projects/leonardo-berselli-portfolio/leonardo-berselli-vertical-2.webp"
                      alt="Leonardo Berselli's Portfolio Showcase 2"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 33vw"
                      className="scale-[1.01] object-cover"
                    />
                  </div>
                </div>
                <div className="hidden md:col-span-4 md:block">
                  <div className="relative aspect-3/4 w-full overflow-hidden">
                    <Image
                      src="/projects/leonardo-berselli-portfolio/leonardo-berselli-vertical-3.webp"
                      alt="Leonardo Berselli's Portfolio Showcase 3"
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="scale-[1.01] object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Obsess Section */}
            <motion.div
              className="mt-6 grid grid-cols-12 gap-4"
              variants={entranceVariants(motionTokens.delay.none, motionTokens.distance.base)}
              initial="initial"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="col-span-12 flex flex-col xl:col-span-2">
                <h2 className="text-caption md:text-body uppercase text-neutral-dark">
                  Obsess
                </h2>
              </div>
              <div className="col-span-12 xl:col-span-10">
                <div className="text-section text-background grid grid-cols-1 gap-6 font-normal md:grid-cols-2 md:gap-8">
                  <p className="break-inside-avoid">
                    Leonardo Berselli is a Machine Learning Engineer. His portfolio features a highly interactive, techy aesthetic inspired by the world of informatics.
                  </p>
                  <p className="break-inside-avoid">
                    The main site is built using Next.js, Tailwind, and Motion, with custom Three.js WebGL integrated as refined interactive details.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Design Section */}
            <div id="project-detail-design" className="flex w-full flex-col">
              <motion.h2
                className="text-caption md:text-body uppercase text-neutral-dark"
                variants={entranceVariants(motionTokens.delay.none, motionTokens.distance.base)}
                initial="initial"
                whileInView="visible"
                viewport={{ once: true }}
              >
                Design
              </motion.h2>

              <motion.div
                className="bg-background mt-3 flex w-full flex-col p-4"
                variants={entranceVariants(motionTokens.delay.short, motionTokens.distance.base)}
                initial="initial"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="grid w-full grid-cols-1 gap-4 xl:grid-cols-2">
                  {/* Card 1: Palette */}
                  <div className="col-span-1">
                    <div className="bg-card-dark relative flex aspect-4/3 w-full flex-col justify-between overflow-hidden p-4">
                      <div>
                        <span className="text-caption md:text-body uppercase text-neutral">
                          Palette
                        </span>
                      </div>
                      <div className="mt-6 flex w-full gap-2 pb-2 sm:mt-8 sm:gap-4">
                        <span className="sr-only" role="status" aria-live="polite" />
                        {COLOR_SWATCHES.map((swatch) => {
                          const isCopied = copiedHex === swatch.hex;
                          return (
                            <div key={swatch.hex} className="flex flex-1 flex-col">
                              <span
                                className="text-caption sm:text-body text-neutral-dark -mt-4 mb-1 font-normal sm:-mt-5 sm:mb-2 transition-opacity duration-200"
                                style={{ opacity: isCopied ? 1 : 0 }}
                                aria-hidden="true"
                              >
                                (copied)
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(swatch.hex)}
                                aria-label={`Copy color ${swatch.hex} to clipboard`}
                                className="border-foreground/10 focus-visible:outline-accent h-28 w-full cursor-pointer border focus-visible:outline-2 sm:h-36 md:h-48 lg:h-66 transition-transform active:scale-98"
                                tabIndex={0}
                                style={{ backgroundColor: swatch.hex }}
                              />
                              <div className="sm:text-caption md:text-body text-foreground mt-4 flex flex-col gap-y-0.5 text-[10px] leading-tight font-normal uppercase sm:mt-8 sm:gap-y-1.5 font-mono">
                                <span>{swatch.hex}</span>
                                <span className="text-neutral">RGB {swatch.rgb}</span>
                                <span className="text-neutral">PMS {swatch.pms}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Typefaces */}
                  <div className="col-span-1">
                    <div className="bg-card-dark relative flex aspect-4/3 w-full flex-col justify-between overflow-hidden p-4">
                      <div>
                        <span className="text-caption md:text-body uppercase text-neutral">
                          Typefaces
                        </span>
                      </div>
                      <div className="grid w-full gap-4 pb-2 pl-2 grid-cols-2">
                        {/* Column 1: Neue Haas Grotesk */}
                        <div className="flex flex-col items-start justify-end font-sans">
                          <span className="text-display-md sm:text-display-lg xl:text-display-xl text-neutral leading-none font-normal select-none">
                            Aa
                          </span>
                          <span className="text-caption sm:text-body text-neutral-dark mt-1 font-normal">
                            sans
                          </span>
                          <span className="text-body sm:text-section text-foreground mt-1 leading-tight font-normal break-words xl:whitespace-nowrap">
                            Neue Haas Grotesk
                          </span>
                          <div className="text-caption sm:text-body text-foreground mt-4 flex flex-col gap-y-1 sm:mt-6 sm:gap-y-1.5 font-normal">
                            <span>Light 300</span>
                            <span>Roman 400</span>
                            <span>Bold 700</span>
                          </div>
                        </div>

                        {/* Column 2: PP Neue Montreal */}
                        <div className="flex flex-col items-start justify-end font-sans">
                          <span className="text-display-md sm:text-display-lg xl:text-display-xl text-neutral leading-none font-normal select-none">
                            Aa
                          </span>
                          <span className="text-caption sm:text-body text-neutral-dark mt-1 font-normal">
                            sans
                          </span>
                          <span className="text-body sm:text-section text-foreground mt-1 leading-tight font-normal break-words xl:whitespace-nowrap">
                            PP Neue Montreal
                          </span>
                          <div className="text-caption sm:text-body text-foreground mt-4 flex flex-col gap-y-1 sm:mt-6 sm:gap-y-1.5 font-normal">
                            <span>Light 300</span>
                            <span>Regular 400</span>
                            <span>Semibold 600</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Interactive UI Kit & Telemetry */}
                  <div className="col-span-1 min-h-0">
                    <div className="bg-card-dark relative flex aspect-4/3 w-full flex-col justify-between overflow-hidden p-4">
                      <div>
                        <span className="text-caption md:text-body uppercase text-neutral">
                          Components
                        </span>
                      </div>

                      <div className="project-theme-leonardo-berselli-portfolio mt-3 flex min-h-0 w-full flex-1 flex-col overflow-y-auto pb-2 text-left font-mono">
                        {/* Interactive UI Kit Buttons & Engine Toggle */}
                        <div className="w-full space-y-2 text-foreground">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setClickCount((c) => c + 1)}
                              className="px-3 py-1 bg-foreground text-card-dark font-mono text-xs uppercase font-bold rounded-xs cursor-pointer active:scale-95 transition-transform"
                            >
                              Click ({clickCount})
                            </button>
                            <button
                              type="button"
                              onClick={() => setClickCount(0)}
                              className="px-3 py-1 border border-foreground/20 text-foreground font-mono text-xs uppercase rounded-xs cursor-pointer hover:bg-foreground/10"
                            >
                              Reset
                            </button>
                            <button
                              type="button"
                              disabled
                              className="px-3 py-1 border border-foreground/10 text-neutral font-mono text-xs uppercase rounded-xs opacity-50 cursor-not-allowed"
                            >
                              Disabled
                            </button>
                          </div>

                          <div className="grid grid-cols-12 items-stretch gap-2">
                            <div className="col-span-12 sm:col-span-7 flex w-full items-center justify-between border border-foreground/15 px-3 py-2 bg-white/40">
                              <div className="flex items-center gap-3">
                                <span className="text-caption font-mono text-neutral uppercase">Engine</span>
                                <button
                                  type="button"
                                  onClick={() => setEngineActive(!isEngineActive)}
                                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                                    isEngineActive ? "bg-foreground" : "bg-neutral-dark"
                                  }`}
                                >
                                  <div
                                    className={`size-4 rounded-full bg-background transition-transform ${
                                      isEngineActive ? "translate-x-4" : "translate-x-0"
                                    }`}
                                  />
                                </button>
                              </div>
                              <span
                                className={`text-caption font-mono uppercase ${
                                  isEngineActive ? "text-foreground font-bold" : "text-neutral"
                                }`}
                              >
                                {isEngineActive ? "RUNNING" : "STABLE"}
                              </span>
                            </div>

                            <div className="col-span-12 sm:col-span-5 grid h-full grid-cols-4 sm:grid-cols-2 gap-1.5 text-center text-[10px]">
                              <div className="flex items-center justify-center border border-foreground/10 px-1 py-1 font-mono text-foreground bg-foreground/5">
                                0xLEO
                              </div>
                              <div className="flex items-center justify-center border border-foreground/10 px-1 py-1 font-mono text-neutral">
                                MLOPS
                              </div>
                              <div className="flex items-center justify-center border border-foreground/10 px-1 py-1 font-mono text-neutral">
                                STABLE
                              </div>
                              <div className="flex items-center justify-center border border-foreground/10 px-1 py-1 font-mono text-foreground">
                                ERR_0
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Telemetry Progress & Grid */}
                        <div className="mt-3 border border-foreground/10 p-3 bg-white/40">
                          <div className="flex items-center justify-between text-xs text-neutral font-mono uppercase mb-1.5">
                            <div className="flex items-center gap-2 text-foreground">
                              <div className="size-2 rounded-full bg-foreground animate-pulse" />
                              <span>System Initialization</span>
                            </div>
                            <span className="font-mono text-foreground">{progress}%</span>
                          </div>
                          <div className="h-px w-full bg-foreground/10 overflow-hidden mb-3">
                            <div
                              className="h-full bg-foreground transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-neutral font-mono uppercase">
                            <div>
                              <div className="text-neutral">CORE_LOAD:</div>
                              <div className="text-foreground">{coreLoad}%</div>
                            </div>
                            <div>
                              <div className="text-neutral">UDP_LAT:</div>
                              <div className="text-foreground">12ms</div>
                            </div>
                            <div>
                              <div className="text-neutral">GEO_LOC:</div>
                              <div className="text-foreground">45.4642 N</div>
                            </div>
                            <div>
                              <div className="text-neutral">LICENSE:</div>
                              <div className="text-foreground">BERS_OS</div>
                            </div>
                          </div>
                        </div>

                        {/* Client Hardware & Session Telemetry */}
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                          <div className="border border-foreground/10 p-2.5 bg-white/40">
                            <div className="text-neutral font-mono uppercase mb-1">CLIENT_ENV</div>
                            <div className="flex justify-between border-b border-foreground/10 py-0.5">
                              <span className="text-neutral">OS</span>
                              <span className="text-foreground">{clientEnv.os}</span>
                            </div>
                            <div className="flex justify-between border-b border-foreground/10 py-0.5">
                              <span className="text-neutral">CORES</span>
                              <span className="text-foreground">{clientEnv.cores}</span>
                            </div>
                            <div className="flex justify-between border-b border-foreground/10 py-0.5">
                              <span className="text-neutral">GPU_UNIT</span>
                              <span className="text-foreground">{clientEnv.gpu}</span>
                            </div>
                            <div className="flex justify-between py-0.5">
                              <span className="text-neutral">VIEWPORT</span>
                              <span className="text-foreground">{clientEnv.res}</span>
                            </div>
                          </div>

                          <div className="border border-foreground/10 p-2.5 bg-white/40">
                            <div className="text-neutral font-mono uppercase mb-1">LOCAL_METRICS</div>
                            <div className="flex justify-between border-b border-foreground/10 py-0.5">
                              <span className="text-neutral">IPV4_ADDR</span>
                              <span className="text-foreground">REDACTED</span>
                            </div>
                            <div className="flex justify-between border-b border-foreground/10 py-0.5">
                              <span className="text-neutral">LANGUAGE</span>
                              <span className="text-foreground">{clientEnv.language}</span>
                            </div>
                            <div className="flex justify-between border-b border-foreground/10 py-0.5">
                              <span className="text-neutral">UPTIME</span>
                              <span className="text-foreground">{formatUptime(uptime)}</span>
                            </div>
                            <div className="flex justify-between py-0.5">
                              <span className="text-neutral">CONNECTION</span>
                              <span className="text-foreground">SECURE</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Cool S***t (Three.js WebGL ASCII Globe) */}
                  <div className="col-span-1 min-h-0">
                    <div className="bg-card-dark relative flex aspect-4/3 w-full items-center justify-center overflow-hidden">
                      <span className="text-caption md:text-body uppercase text-neutral absolute top-4 left-4 z-10">
                        Cool S***t
                      </span>
                      <div className="flex size-full items-center justify-center">
                        <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                          <canvas
                            ref={canvasRef}
                            width={540}
                            height={400}
                            className="size-full object-contain"
                            data-engine="three.js r184"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Code Section */}
            <div id="project-detail-code" className="flex w-full flex-col">
              <motion.h2
                className="text-caption md:text-body uppercase text-neutral-dark"
                variants={entranceVariants(motionTokens.delay.none, motionTokens.distance.base)}
                initial="initial"
                whileInView="visible"
                viewport={{ once: true }}
              >
                Code
              </motion.h2>

              <motion.div
                className="bg-background mt-3 flex w-full flex-col p-4"
                variants={entranceVariants(motionTokens.delay.short, motionTokens.distance.base)}
                initial="initial"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="grid w-full grid-cols-12 gap-4">
                  {/* Column 1: Technologies */}
                  <div className="col-span-12 md:col-span-12 xl:col-span-4">
                    <div className="bg-card-dark relative flex w-full flex-col justify-between gap-6 p-4 sm:gap-8 md:gap-12 aspect-auto min-h-[12rem] xl:aspect-3/4 xl:min-h-0">
                      <div>
                        <span className="text-caption md:text-body uppercase text-neutral">
                          Technologies
                        </span>
                        <div className="text-section text-foreground font-normal mt-4">
                          <p>
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              className="transition-colors duration-200 text-foreground underline hover:text-neutral"
                              href="https://nextjs.org"
                            >
                              Next.js
                            </a>{" "}
                            and{" "}
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              className="transition-colors duration-200 text-foreground underline hover:text-neutral"
                              href="https://tailwindcss.com"
                            >
                              Tailwind CSS
                            </a>{" "}
                            drive the project’s performance and structure, while{" "}
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              className="transition-colors duration-200 text-foreground underline hover:text-neutral"
                              href="https://motion.dev"
                            >
                              Motion
                            </a>{" "}
                            and{" "}
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              className="transition-colors duration-200 text-foreground underline hover:text-neutral"
                              href="https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API"
                            >
                              WebGL
                            </a>{" "}
                            power the interactive visual experiences.
                          </p>
                        </div>
                      </div>
                      <p className="text-caption lg:text-body text-neutral shrink-0">
                        Mostly pnpm install and good intentions.
                      </p>
                    </div>
                  </div>

                  {/* Column 2: Architecture Tree */}
                  <div className="col-span-12 md:col-span-6 xl:col-span-4">
                    <div className="bg-card-dark relative flex aspect-3/4 w-full flex-col justify-between gap-6 p-4 sm:gap-8 md:gap-12">
                      <div>
                        <span className="text-caption md:text-body uppercase text-neutral">
                          Architecture
                        </span>
                        <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto">
                          <div className="w-full select-none text-caption md:text-body">
                            {/* Root Folder */}
                            <div className="bg-card-dark sticky top-0 z-10">
                              <button
                                type="button"
                                className="flex w-full items-center gap-1.5 py-0.5 text-left cursor-pointer"
                              >
                                <FolderOpen className="text-neutral size-3.5 shrink-0" />
                                <span className="text-caption md:text-body text-foreground leading-tight font-normal">
                                  leonardo-berselli-portfolio/
                                </span>
                              </button>
                            </div>

                            {/* Subfolders & Files */}
                            <div className="relative pl-3 border-l border-neutral/30 ml-1.5 mt-1">
                              {ARCHITECTURE_FOLDERS.map((folder) => {
                                const isExpanded = !!expandedFolders[folder.path];
                                return (
                                  <div key={folder.path} className="flex flex-col">
                                    <button
                                      type="button"
                                      onClick={() => toggleFolder(folder.path)}
                                      className="flex w-full items-center gap-1.5 py-0.5 text-left cursor-pointer hover:text-foreground text-neutral"
                                    >
                                      <ChevronRight
                                        className={`size-3 shrink-0 transition-transform ${
                                          isExpanded ? "rotate-90" : ""
                                        }`}
                                      />
                                      <Folder className="size-3.5 shrink-0" />
                                      <span className="text-caption md:text-body text-foreground leading-tight font-normal">
                                        {folder.name}
                                      </span>
                                    </button>

                                    {isExpanded && (
                                      <div className="pl-4 flex flex-col">
                                        {folder.files.map((file) => (
                                          <button
                                            key={file}
                                            type="button"
                                            onClick={() => setSelectedFile(file)}
                                            className={`flex items-center gap-1.5 py-0.5 text-left cursor-pointer transition-colors ${
                                              selectedFile === file
                                                ? "text-accent font-medium"
                                                : "text-neutral hover:text-foreground"
                                            }`}
                                          >
                                            <File className="size-3 shrink-0" />
                                            <span className="text-caption md:text-body leading-tight">
                                              {file}
                                            </span>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-caption lg:text-body text-neutral shrink-0">
                        Click or hover on a folder to explore the project structure.
                      </p>
                    </div>
                  </div>

                  {/* Column 3: Implementation Code Viewer */}
                  <div className="col-span-12 md:col-span-6 xl:col-span-4">
                    <div className="bg-card-dark relative flex aspect-3/4 w-full flex-col justify-between gap-6 p-4 sm:gap-8 md:gap-12">
                      <div className="flex flex-col min-h-0 flex-1">
                        <span className="text-caption md:text-body uppercase text-neutral">
                          Implementation
                        </span>
                        <div className="mt-4 flex min-h-0 flex-1 overflow-y-auto">
                          <div className="flex w-full">
                            {/* Line Numbers */}
                            <div className="text-code text-neutral shrink-0 pr-2 text-right leading-tight select-none border-r border-neutral/30">
                              {codeLines.map((_, i) => (
                                <div key={i}>{i + 1}</div>
                              ))}
                            </div>
                            {/* Code Area */}
                            <div
                              tabIndex={0}
                              role="region"
                              aria-label={`Source code of ${selectedFile}`}
                              className="focus-visible:outline-accent flex-1 overflow-x-auto pl-2 font-mono text-code select-none focus-visible:outline-2"
                            >
                              <pre className="text-code text-neutral w-fit min-w-full leading-tight whitespace-pre font-mono">
                                <code>{currentCode}</code>
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-caption lg:text-body text-neutral shrink-0">
                        {selectedFile}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Ship Section */}
            <div id="project-detail-ship" className="grid grid-cols-12 gap-4">
              <div className="col-span-12 flex flex-col xl:col-span-2">
                <h2 className="text-caption md:text-body uppercase text-neutral-dark">
                  Ship
                </h2>
              </div>
              <div className="col-span-12 xl:col-span-10">
                <div className="mt-3 flex flex-col gap-10">
                  <div className="grid grid-cols-12 gap-8 md:gap-4">
                    {/* Preview 1 */}
                    <div className="col-span-12 flex flex-col gap-6 md:col-span-6 md:gap-10">
                      <div className="relative aspect-4/3 w-full overflow-hidden">
                        <Image
                          src="/projects/leonardo-berselli-portfolio/leonardo-berselli-ship-1.webp"
                          alt="Leonardo Berselli's Portfolio Preview 1"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
                          className="scale-[1.01] object-cover"
                        />
                      </div>
                      <p className="text-section text-background w-full font-normal xl:w-5/6">
                        Vercel provides the ideal hosting environment for Next.js portfolios. The source code resides on GitHub, utilizing GitHub Actions to manage the CI/CD pipeline and automate every deployment.
                      </p>
                    </div>

                    {/* Preview 2 */}
                    <div className="col-span-12 flex flex-col gap-6 md:col-span-6 md:gap-10">
                      <div className="relative aspect-4/3 w-full overflow-hidden">
                        <Image
                          src="/projects/leonardo-berselli-portfolio/leonardo-berselli-ship-2-v2.webp"
                          alt="Leonardo Berselli's Portfolio Preview 2"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
                          className="scale-[1.01] object-cover"
                        />
                      </div>
                      <p className="text-section text-background w-full font-normal xl:w-5/6">
                        The portfolio seamlessly integrates with GitHub to manage projects. Each case study directly links back to its corresponding repository, allowing visitors to easily dive into the actual source code.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </StickyPageLayout>
    </main>
  );
}
