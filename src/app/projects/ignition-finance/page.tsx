"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Folder, FolderOpen, ChevronRight, File, Star, Download, CandlestickChart, CircleDollarSign } from "lucide-react";
import StickyPageLayout from "@/components/layout/StickyPageLayout";
import ContactsSection from "@/components/common/ContactsSection";
import { entranceVariants, motionTokens } from "@/lib/animations";

const COLOR_SWATCHES = [
  { hex: "#070707", rgb: "7 7 7", pms: "Black 6 C" },
  { hex: "#19191b", rgb: "25 25 27", pms: "426 C" },
  { hex: "#787878", rgb: "120 120 120", pms: "Cool Gray 9 C" },
  { hex: "#bebebe", rgb: "190 190 190", pms: "Cool Gray 4 C" },
  { hex: "#f8f8f8", rgb: "248 248 248", pms: "7436 C" },
];

const ARCHITECTURE_FOLDERS = [
  {
    name: "data/",
    path: "data",
    files: ["SyncWorker.kt", "StockRepositoryImpl.kt"],
  },
  {
    name: "di/",
    path: "di",
    files: ["AppModule.kt", "DatabaseModule.kt"],
  },
  {
    name: "domain/",
    path: "domain",
    files: ["FireSimulator.kt", "WithdrawalCalculator.kt", "StartSimulationUseCase.kt"],
  },
  {
    name: "presentation/",
    path: "presentation",
    files: ["SimulationScreen.kt", "SummaryScreen.kt"],
  },
];

const ROOT_FILES = ["MainActivity.kt", "MyApplication.kt"];

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
  "MainActivity.kt": `package com.error404.ignitionfinance

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.error404.ignitionfinance.presentation.navigation.MainNavigationGraph
import com.error404.ignitionfinance.ui.theme.IgnitionFinanceTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            IgnitionFinanceTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    MainNavigationGraph()
                }
            }
        }
    }
}`,
  "MyApplication.kt": `package com.error404.ignitionfinance

import android.app.Application
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

@HiltAndroidApp
class MyApplication : Application(), Configuration.Provider {
    @Inject lateinit var workerFactory: HiltWorkerFactory

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()
}`,
  "FireSimulator.kt": `package com.error404.ignitionfinance.domain

import com.error404.ignitionfinance.domain.model.Portfolio
import com.error404.ignitionfinance.domain.model.SimulationResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject

class FireSimulator @Inject constructor(
    private val calculator: WithdrawalCalculator
) {
    suspend fun runMonteCarlo(
        portfolio: Portfolio,
        years: Int = 30,
        iterations: Int = 10000
    ): SimulationResult = withContext(Dispatchers.Default) {
        val outcomes = (0 until iterations).map {
            simulatePath(portfolio, years)
        }
        SimulationResult.from(outcomes)
    }

    private fun simulatePath(portfolio: Portfolio, years: Int): Double {
        var balance = portfolio.totalValue
        for (year in 1..years) {
            val returnRate = calculator.sampleNormalReturn()
            balance = balance * (1 + returnRate) - portfolio.annualExpenses
            if (balance <= 0) return 0.0
        }
        return balance
    }
}`,
  "SyncWorker.kt": `package com.error404.ignitionfinance.data

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val repository: StockRepository
) : CoroutineWorker(appContext, workerParams) {
    override suspend fun doWork(): Result = try {
        repository.syncPortfolioData()
        Result.success()
    } catch (e: Exception) {
        Result.retry()
    }
}`,
};

export default function IgnitionFinancePage() {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<string>("MainActivity.kt");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    domain: true,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  const currentCode = CODE_SNIPPETS[selectedFile] || CODE_SNIPPETS["CodePlaceholder.tsx"];
  const codeLines = currentCode.split("\n");

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="bg-foreground flex w-full flex-1 flex-col justify-start gap-0 px-4 focus:outline-none"
      aria-label="Ignition Finance project page main content"
    >
      <StickyPageLayout contacts={<ContactsSection />}>
        <div className="text-background relative z-10 flex min-h-screen w-full flex-col pt-32 pb-48">
          <div className="my-auto flex w-full flex-col gap-20">
            {/* Header: Title and Year */}
            <div className="flex flex-col">
              <motion.h1
                id="project-detail-title"
                className="text-display-md text-background relative z-10 -ml-1"
                aria-label="Ignition Finance - Project heading"
                variants={entranceVariants(motionTokens.delay.none, motionTokens.distance.hero)}
                initial="initial"
                animate="visible"
              >
                Ignition Finance
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
                  src="/projects/ignition-finance/ignition-finance.webp"
                  alt="Ignition Finance Hero Image"
                  fill
                  priority
                  sizes="100vw"
                  className="pointer-events-none scale-105 object-cover blur-md brightness-60 select-none"
                />
                <div className="bg-background/25 pointer-events-none absolute inset-0 select-none" />

                {/* Floating Centered Video with Drop Shadow */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-3 sm:p-6 lg:p-8">
                  <div className="flex size-full items-center justify-center">
                    <div className="border-foreground/15 bg-background relative aspect-2304/1302 h-[88%] max-w-[94%] overflow-hidden rounded-xs border shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15),0_6px_16px_-4px_rgba(0,0,0,0.1)]">
                      <video
                        ref={videoRef}
                        src="/projects/ignition-finance/ignition-finance-showcase.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className="size-full object-cover"
                        aria-label="Ignition Finance showcase video"
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
                      src="/projects/ignition-finance/ignition-finance-vertical-1.webp"
                      alt="Ignition Finance Showcase 1"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 33vw"
                      className="scale-[1.01] object-cover"
                    />
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-6 md:col-span-4">
                  <div className="relative aspect-3/4 w-full overflow-hidden">
                    <Image
                      src="/projects/ignition-finance/ignition-finance-vertical-2.webp"
                      alt="Ignition Finance Showcase 2"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 33vw"
                      className="scale-[1.01] object-cover"
                    />
                  </div>
                </div>
                <div className="hidden md:col-span-4 md:block">
                  <div className="relative aspect-3/4 w-full overflow-hidden">
                    <Image
                      src="/projects/ignition-finance/ignition-finance-vertical-3.webp"
                      alt="Ignition Finance Showcase 3"
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
                    Ignition Finance guides users toward financial independence. It pairs portfolio tracking with Monte Carlo simulations to stress-test retirement plans.
                  </p>
                  <p className="break-inside-avoid">
                    Built natively for Android with Kotlin and Jetpack Compose, featuring offline-first Room persistence and background Firebase sync.
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
                      <div className="grid w-full gap-4 pb-2 pl-2 grid-cols-1">
                        <div className="flex flex-col items-start justify-end font-sans">
                          <span className="text-display-md sm:text-display-lg xl:text-display-xl text-neutral leading-none font-normal select-none">
                            Aa
                          </span>
                          <span className="text-caption sm:text-body text-neutral-dark mt-1 font-normal">
                            sans
                          </span>
                          <span className="text-body sm:text-section text-foreground mt-1 leading-tight font-normal break-words xl:whitespace-nowrap">
                            Google Sans
                          </span>
                          <div className="text-caption sm:text-body text-foreground mt-4 flex flex-col gap-y-1 sm:mt-6 sm:gap-y-1.5 font-normal">
                            <span>Medium 500</span>
                            <span>Regular 400</span>
                            <span>Bold 700</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Asset Allocation & Performance */}
                  <div className="col-span-1 min-h-0">
                    <div className="bg-card-dark relative flex aspect-4/3 w-full flex-col justify-between overflow-hidden p-4">
                      <div>
                        <span className="text-caption md:text-body uppercase text-neutral">
                          Components
                        </span>
                      </div>

                      <div className="mt-3 flex min-h-0 w-full flex-1 flex-col justify-between pb-2">
                        {/* Asset allocation widget */}
                        <div>
                          <h3 className="text-foreground mb-2 font-sans text-xs font-bold tracking-tight sm:mb-3 sm:text-sm md:mb-4 md:text-base">
                            Asset allocation:
                          </h3>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              className="border border-foreground/15 bg-card-dark px-3 py-1.5 rounded-full text-foreground text-xs font-mono font-medium flex items-center gap-2 hover:bg-foreground/5 cursor-pointer transition-colors"
                            >
                              <span className="size-2 rounded-full bg-emerald-500" />
                              <span>IE00BK5BQT80VWCE</span>
                            </button>
                            <span className="text-neutral text-xs font-sans">
                              Vanguard FTSE All-World UCITS ETF
                            </span>
                          </div>
                        </div>

                        {/* Performance indicators */}
                        <div className="mt-4 pt-3 border-t border-foreground/10 flex items-center justify-between">
                          <div>
                            <h3 className="text-foreground shrink-0 font-sans text-xs font-bold tracking-tight sm:text-sm md:text-base">
                              Performance:
                            </h3>
                            <div className="text-emerald-500 text-sm font-mono mt-1 flex items-center gap-1.5">
                              <CandlestickChart className="size-4" />
                              <span>+14.8% YTD</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-neutral text-xs font-mono">
                            <CircleDollarSign className="size-4 text-neutral" />
                            <span>EUR Base Currency</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Play Store / App Store Card */}
                  <div className="col-span-1 min-h-0">
                    <div className="bg-card-dark relative flex aspect-4/3 w-full flex-col justify-between overflow-hidden p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-caption md:text-body uppercase text-neutral">
                          Preview
                        </span>
                      </div>

                      {/* App Header */}
                      <div className="my-auto flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 sm:size-14 overflow-hidden rounded-xl bg-card-dark border border-foreground/10 shrink-0">
                            <Image
                              src="/projects/ignition-finance/logo.webp"
                              alt="Ignition Finance Logo"
                              fill
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h3 className="text-foreground truncate font-sans text-base leading-tight font-bold tracking-tight sm:text-lg md:text-xl xl:text-2xl">
                              Ignition Finance: FIRE
                            </h3>
                            <span className="text-neutral mt-0.5 font-sans text-xs leading-snug font-normal tracking-tight sm:text-sm">
                              Error404
                            </span>
                            <span className="text-neutral truncate font-sans text-[10px] leading-snug font-normal sm:text-xs">
                              Personal finance — FIRE &amp; ETF
                            </span>
                          </div>
                        </div>

                        {/* Store Statistics */}
                        <div className="flex w-full items-center justify-between py-1 text-center border-y border-foreground/10">
                          <div className="flex flex-1 flex-col items-center justify-center">
                            <div className="text-foreground flex items-center gap-1 font-sans text-xs font-normal sm:text-sm md:text-base xl:text-lg">
                              <span>5.0</span>
                              <Star className="fill-foreground text-foreground size-3 sm:size-3.5" aria-hidden="true" />
                            </div>
                            <span className="text-neutral mt-0.5 font-sans text-[10px] font-normal sm:text-xs">
                              486 reviews
                            </span>
                          </div>
                          <div className="bg-foreground/15 h-6 w-px sm:h-7 xl:h-8" />
                          <div className="flex flex-1 flex-col items-center justify-center">
                            <span className="border-foreground/30 bg-foreground/10 text-foreground rounded border px-1.5 py-0.5 text-[9px] leading-none font-normal sm:text-[10px]">
                              PEGI 18
                            </span>
                            <span className="text-neutral mt-0.5 font-sans text-[10px] font-normal sm:text-xs">
                              Rated for 18+
                            </span>
                          </div>
                          <div className="bg-foreground/15 h-6 w-px sm:h-7 xl:h-8" />
                          <div className="flex flex-1 flex-col items-center justify-center">
                            <span className="text-foreground font-sans text-xs font-normal sm:text-sm md:text-base xl:text-lg">
                              20.3 MB
                            </span>
                            <span className="text-neutral mt-0.5 font-sans text-[10px] font-normal sm:text-xs">
                              Size
                            </span>
                          </div>
                        </div>

                        {/* Download & GitHub Buttons */}
                        <div className="flex w-full items-center gap-2 sm:gap-2.5">
                          <button
                            type="button"
                            className="bg-foreground text-background flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full font-sans text-xs font-normal shadow-md transition-all hover:opacity-90 active:scale-[0.99] sm:h-10 sm:gap-2 sm:text-sm md:h-11 xl:h-12 xl:gap-2.5 xl:text-base"
                            aria-label="Download Ignition Finance APK"
                          >
                            <Download className="size-3.5 sm:size-4 xl:size-4.5" strokeWidth={2.2} />
                            <span>Download</span>
                          </button>
                          <a
                            href="https://github.com/dbuser03/IgnitionFinance"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-neutral-dark text-foreground flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full shadow-md transition-all hover:opacity-90 active:scale-[0.96] sm:size-10 md:size-11 xl:size-12"
                            aria-label="View Ignition Finance repository on GitHub"
                          >
                            <svg className="size-3.5 sm:size-4 xl:size-4.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                            </svg>
                          </a>
                        </div>
                      </div>

                      {/* Footer Team Attribution */}
                      <p className="text-caption sm:text-body text-neutral mt-2">
                        <span>Developed with Error404 teammates </span>
                        <a target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline cursor-pointer transition-colors duration-200" href="https://github.com/Teto03">
                          Francesco Bianchi
                        </a>
                        <span>, </span>
                        <a target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline cursor-pointer transition-colors duration-200" href="https://github.com/BrighentiStefano">
                          Stefano Brighenti
                        </a>
                        <span>, and </span>
                        <a target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline cursor-pointer transition-colors duration-200" href="https://github.com/HichamBenbouzid">
                          Hicham Benbouzid
                        </a>
                        <span>.</span>
                      </p>
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
                              href="https://kotlinlang.org"
                            >
                              Kotlin
                            </a>{" "}
                            and{" "}
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              className="transition-colors duration-200 text-foreground underline hover:text-neutral"
                              href="https://developer.android.com/jetpack/compose"
                            >
                              Jetpack Compose
                            </a>{" "}
                            power the reactive UI, while{" "}
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              className="transition-colors duration-200 text-foreground underline hover:text-neutral"
                              href="https://developer.android.com/training/data-storage/room"
                            >
                              Room
                            </a>{" "}
                            and{" "}
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              className="transition-colors duration-200 text-foreground underline hover:text-neutral"
                              href="https://firebase.google.com"
                            >
                              Firebase
                            </a>{" "}
                            handle data persistence and cloud synchronization.
                          </p>
                        </div>
                      </div>
                      <p className="text-caption lg:text-body text-neutral shrink-0">
                        Over-engineered Clean Architecture and endless Gradle syncs.
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
                                  ignition-finance/
                                </span>
                              </button>
                            </div>

                            {/* Subfolders & Root Files */}
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

                              {/* Root level files */}
                              {ROOT_FILES.map((file) => (
                                <button
                                  key={file}
                                  type="button"
                                  onClick={() => setSelectedFile(file)}
                                  className={`flex items-center gap-1.5 py-0.5 text-left cursor-pointer transition-colors pl-4 ${
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
                          src="/projects/ignition-finance/ignition-finance-ship-1.webp"
                          alt="Ignition Finance Preview 1"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
                          className="scale-[1.01] object-cover"
                        />
                      </div>
                      <p className="text-section text-background w-full font-normal xl:w-5/6">
                        Automated CI/CD pipelines on GitHub Actions handle linting, unit testing, and release signing. Production builds are packaged as Android App Bundles (AAB) for reliable distribution.
                      </p>
                    </div>

                    {/* Preview 2 */}
                    <div className="col-span-12 flex flex-col gap-6 md:col-span-6 md:gap-10">
                      <div className="relative aspect-4/3 w-full overflow-hidden">
                        <Image
                          src="/projects/ignition-finance/ignition-finance-ship-2.webp"
                          alt="Ignition Finance Preview 2"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
                          className="scale-[1.01] object-cover"
                        />
                      </div>
                      <p className="text-section text-background w-full font-normal xl:w-5/6">
                        The project integrates with GitHub Releases to deliver signed APK builds. Each version tags production milestones, making release binaries and source code readily accessible.
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
