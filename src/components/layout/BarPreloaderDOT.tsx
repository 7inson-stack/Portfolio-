"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface BarPreloaderProps {
  backgroundColor?: string;
  showVignette?: boolean;
  showNoise?: boolean;
  barColor?: string;
  barGradientEnd?: string;
  useGradient?: boolean;
  showGlow?: boolean;
  glowColor?: string;
  barBorderRadius?: number;
  barPaddingVertical?: number;
  barPaddingHorizontal?: number;
  barVerticalPosition?: number;
  leftPadding?: number;
  loadingText?: string;
  completeText?: string;
  barTextColor?: string;
  textSize?: number;
  font?: { fontFamily?: string; fontWeight?: number };
  subtitleText?: string;
  subtitleColor?: string;
  subtitleSize?: number;
  subtitlePosition?: "above" | "below";
  showCounter?: boolean;
  counterColor?: string;
  counterSize?: number;
  duration?: number;
  easing?: "linear" | "ease-out" | "ease-in-out";
  holdDuration?: number;
  showOncePerSession?: boolean;
  zIndex?: number;
  onComplete?: () => void;
}

export default function BarPreloaderDOT({
  backgroundColor = "#0a0a0a",
  showVignette = true,
  showNoise = false,
  barColor = "#ffffff",
  barGradientEnd = "#ffffff",
  useGradient = false,
  showGlow = false,
  glowColor = "rgba(255, 255, 255, 0.35)",
  barBorderRadius = 0,
  barPaddingVertical = 6,
  barPaddingHorizontal = 14,
  barVerticalPosition = 50,
  leftPadding = 0,
  loadingText = "LOADING...",
  completeText = "READY",
  barTextColor = "#0a0a0a",
  textSize = 12,
  font = { fontFamily: "neueHaasGrotesk", fontWeight: 600 },
  subtitleText = "DANIELE BUSER \xa9 2026",
  subtitleColor = "rgba(255, 255, 255, 0.4)",
  subtitleSize = 10,
  subtitlePosition = "below",
  showCounter = true,
  counterColor = "#0a0a0a",
  counterSize = 12,
  duration = 2.0,
  easing = "ease-out",
  holdDuration = 0.35,
  showOncePerSession = false,
  zIndex = 9999,
  onComplete,
}: BarPreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const typographyStyles = useMemo(() => {
    return {
      fontFamily: font.fontFamily
        ? `"${font.fontFamily}", sans-serif`
        : '"neueHaasGrotesk", sans-serif',
      fontWeight: font.fontWeight || 600,
    };
  }, [font]);

  useEffect(() => {
    if (showOncePerSession && typeof sessionStorage !== "undefined") {
      try {
        if (sessionStorage.getItem("barPreloaderShown") === "true") {
          setIsDone(true);
          onComplete?.();
          return;
        }
      } catch (e) {}
    }
  }, [showOncePerSession, onComplete]);

  useEffect(() => {
    if (isDone) return;
    const startTime = performance.now();
    const totalMs = duration * 1000;
    let rafId: number;
    let holdTimeout: NodeJS.Timeout | null = null;

    function applyEasing(t: number) {
      switch (easing) {
        case "linear":
          return t;
        case "ease-out":
          return 1 - Math.pow(1 - t, 3);
        case "ease-in-out":
          return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        default:
          return 1 - Math.pow(1 - t, 3);
      }
    }

    function tick() {
      const elapsed = performance.now() - startTime;
      const rawProgress = Math.min(elapsed / totalMs, 1);
      const easedProgress = applyEasing(rawProgress);
      const currentPct = Math.floor(easedProgress * 100);
      setProgress(currentPct);

      if (rawProgress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setIsComplete(true);
        holdTimeout = setTimeout(() => {
          setIsExiting(true);
          onComplete?.();
          if (showOncePerSession && typeof sessionStorage !== "undefined") {
            try {
              sessionStorage.setItem("barPreloaderShown", "true");
            } catch (e) {}
          }
        }, holdDuration * 1000);
      }
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (holdTimeout) clearTimeout(holdTimeout);
    };
  }, [duration, easing, holdDuration, isDone, showOncePerSession, onComplete]);

  useEffect(() => {
    if (!isExiting) return;
    const timer = setTimeout(() => setIsDone(true), 700);
    return () => clearTimeout(timer);
  }, [isExiting]);

  if (isDone) return null;

  const currentText = isComplete ? completeText || loadingText : loadingText;

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          key="bar-preloader"
          initial={false}
          animate={{ y: 0 }}
          exit={{
            y: "-100%",
            transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            backgroundColor,
            zIndex,
            overflow: "hidden",
            pointerEvents: isExiting ? "none" : "auto",
          }}
        >
          {showVignette && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.6) 100%)",
                zIndex: 1,
              }}
            />
          )}

          {showNoise && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.04,
                pointerEvents: "none",
                zIndex: 2,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            />
          )}

          <div
            style={{
              position: "absolute",
              left: leftPadding,
              right: 0,
              top: `${barVerticalPosition}%`,
              transform: "translateY(-50%)",
              zIndex: 4,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {subtitleText && subtitlePosition === "above" && (
              <span
                style={{
                  ...typographyStyles,
                  color: subtitleColor,
                  fontSize: subtitleSize,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  userSelect: "none",
                  paddingLeft: Math.max(leftPadding ? 0 : 8, 4),
                  fontWeight: 400,
                }}
              >
                {subtitleText}
              </span>
            )}

            <div
              style={{
                width: `${progress}%`,
                minWidth: 40,
                background: useGradient
                  ? `linear-gradient(90deg, ${barColor} 0%, ${barGradientEnd} 100%)`
                  : barColor,
                borderRadius: barBorderRadius,
                boxShadow: showGlow ? `0 0 24px ${glowColor}` : "none",
                paddingTop: barPaddingVertical,
                paddingBottom: barPaddingVertical,
                paddingLeft: barPaddingHorizontal,
                paddingRight: barPaddingHorizontal,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: textSize + barPaddingVertical * 2,
                transition: "width 0.05s linear",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {currentText && (
                <motion.span
                  key={currentText}
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    color: barTextColor,
                    fontSize: textSize,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                    ...typographyStyles,
                  }}
                >
                  {currentText}
                </motion.span>
              )}

              {showCounter && (
                <span
                  style={{
                    color: counterColor || barTextColor,
                    fontSize: counterSize,
                    fontVariantNumeric: "tabular-nums",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                    marginLeft: 16,
                    ...typographyStyles,
                  }}
                >
                  {`${String(progress).padStart(2, "0")}%`}
                </span>
              )}
            </div>

            {subtitleText && subtitlePosition === "below" && (
              <span
                style={{
                  ...typographyStyles,
                  color: subtitleColor,
                  fontSize: subtitleSize,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  userSelect: "none",
                  paddingLeft: Math.max(leftPadding ? 0 : 8, 4),
                  fontWeight: 400,
                }}
              >
                {subtitleText}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
