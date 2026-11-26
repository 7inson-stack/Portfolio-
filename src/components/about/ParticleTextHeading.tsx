"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Applies the Framer "Partical Effects" (ImageToParticles) physics directly to
 * the "JINSON SAMUEL" typography by sampling the rendered letterforms onto an
 * offscreen canvas using the exact computed styles of the heading.
 *
 * Reference: https://framer.com/m/Partical-Effects-dpsDEx.js@FbwXFuffXbgf70vseDMe
 */

const MAX_PARTICLES = 18000;
const MAX_CANVAS_PIXELS = 8e6;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  phase: number;
}

interface ParticleTextHeadingProps {
  text?: string;
  particleSize?: number;
  density?: number;
  speed?: number;
  pointerRadius?: number;
  pointerStrength?: number;
  drift?: number;
  maxDPR?: number;
  scaleX?: number;
  scaleY?: number;
}

export default function ParticleTextHeading({
  text = "JINSON SAMUEL",
  density = 4,
  speed = 1,
  pointerRadius = 110,
  pointerStrength = 1,
  drift = 0,
  maxDPR = 1.5,
  scaleX = 1.32,
  scaleY = 1.24,
}: ParticleTextHeadingProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleRadiusRef = useRef<number>(1.55);
  const [particlesReady, setParticlesReady] = useState(false);

  useEffect(() => {
    const heading = headingRef.current;
    const span = spanRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true, desynchronized: true });
    if (!heading || !span || !canvas || !context) return;

    let disposed = false;
    let animationFrame = 0;
    let hasPointer = false;
    let lastClientX = -1e4;
    let lastClientY = -1e4;
    let visible = true;
    let lastTime = 0;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const buildParticles = () => {
      if (disposed) return;
      const headingRect = heading.getBoundingClientRect();
      const spanRect = span.getBoundingClientRect();
      if (spanRect.width < 4 || spanRect.height < 4) return;

      const computed = window.getComputedStyle(span);
      const fontSize = parseFloat(computed.fontSize) || 64;
      const fontWeight = computed.fontWeight || "900";
      const fontFamily = computed.fontFamily || "sans-serif";
      const letterSpacing = computed.letterSpacing;
      const wordSpacing = computed.wordSpacing;

      // Measure the actual rasterized glyph width with font, spacing, and stroke
      const measureCanvas = document.createElement("canvas");
      const measureCtx = measureCanvas.getContext("2d");
      if (!measureCtx) return;

      measureCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      if ("letterSpacing" in measureCtx && letterSpacing && letterSpacing !== "normal") {
        (measureCtx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
          letterSpacing;
      }
      if ("wordSpacing" in measureCtx && wordSpacing && wordSpacing !== "normal") {
        (measureCtx as CanvasRenderingContext2D & { wordSpacing: string }).wordSpacing =
          wordSpacing;
      }

      const metrics = measureCtx.measureText(text);
      const strokeThickness = fontSize * 0.042;
      const rawTextWidth =
        Math.max(
          metrics.width,
          (metrics.actualBoundingBoxLeft ?? 0) + (metrics.actualBoundingBoxRight ?? 0)
        ) +
        strokeThickness +
        fontSize * 0.08;

      // Fit within the heading container if scaleX would otherwise clip outer letters
      const maxAvailableWidth = Math.max(headingRect.width, window.innerWidth - 16);
      const effectiveScaleX =
        rawTextWidth * scaleX > maxAvailableWidth
          ? Math.max(1, (maxAvailableWidth * 0.96) / rawTextWidth)
          : scaleX;

      const renderedWidth = Math.max(spanRect.width, rawTextWidth * effectiveScaleX);
      const rawTextHeight =
        (metrics.actualBoundingBoxAscent ?? fontSize * 0.8) +
        (metrics.actualBoundingBoxDescent ?? fontSize * 0.2) +
        strokeThickness +
        fontSize * 0.12;
      const renderedHeight = Math.max(spanRect.height, rawTextHeight * scaleY);

      // Generous padding so no glyph edge or repelled particle is ever cropped
      const padX = Math.round(Math.max(20, fontSize * 0.35));
      const padY = Math.round(Math.max(24, renderedHeight * 0.32));

      width = Math.ceil(renderedWidth + padX * 2);
      height = Math.ceil(renderedHeight + padY * 2);

      const dpr = Math.min(
        window.devicePixelRatio || 1,
        Math.max(1, maxDPR),
        Math.sqrt(MAX_CANVAS_PIXELS / Math.max(1, width * height))
      );

      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Rasterize the exact typography onto an offscreen sample canvas
      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = width;
      sampleCanvas.height = height;
      const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
      if (!sampleCtx) return;

      sampleCtx.clearRect(0, 0, width, height);
      sampleCtx.save();
      sampleCtx.translate(width / 2, height / 2);
      sampleCtx.scale(effectiveScaleX, scaleY);

      sampleCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      sampleCtx.textAlign = "center";
      sampleCtx.textBaseline = "middle";
      sampleCtx.fillStyle = "#000000";
      sampleCtx.strokeStyle = "#000000";
      sampleCtx.lineWidth = strokeThickness;
      sampleCtx.lineJoin = "miter";
      sampleCtx.miterLimit = 2;

      if ("letterSpacing" in sampleCtx && letterSpacing && letterSpacing !== "normal") {
        (sampleCtx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
          letterSpacing;
      }
      if ("wordSpacing" in sampleCtx && wordSpacing && wordSpacing !== "normal") {
        (sampleCtx as CanvasRenderingContext2D & { wordSpacing: string }).wordSpacing =
          wordSpacing;
      }

      sampleCtx.strokeText(text, 0, 0);
      sampleCtx.fillText(text, 0, 0);
      sampleCtx.restore();

      const pixels = sampleCtx.getImageData(0, 0, width, height).data;

      // Precision grid spacing: denser coverage inside bolder strokes without enlarging dots
      const targetStep =
        width < 520
          ? Math.max(2, Math.round(fontSize / 16))
          : Math.max(4, Math.round(fontSize / 24));
      let sampleStep = targetStep;
      while (
        Math.ceil(width / sampleStep) * Math.ceil(height / sampleStep) >
        MAX_PARTICLES
      ) {
        sampleStep++;
      }

      // Crisp, well-defined dot radius (~74% of grid step, ~26% uniform spacing)
      particleRadiusRef.current = Math.max(0.8, sampleStep * 0.37);

      const cols = Math.ceil(width / sampleStep);
      const rows = Math.ceil(height / sampleStep);
      const grid = new Uint8Array(cols * rows);

      // Strict alpha threshold (>= 210) eliminates anti-aliased fringe dots
      for (let row = 0; row < rows; row++) {
        const sy = Math.min(height - 1, row * sampleStep);
        for (let col = 0; col < cols; col++) {
          const sx = Math.min(width - 1, col * sampleStep);
          const alpha = pixels[(sy * width + sx) * 4 + 3];
          if (alpha >= 210) {
            grid[row * cols + col] = 1;
          }
        }
      }

      // Prune isolated boundary protrusions using orthogonal + 8-neighbor contour check
      const nextParticles: Particle[] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (grid[row * cols + col] === 0) continue;

          let orthogonalNeighbors = 0;
          let diagonalNeighbors = 0;
          if (row > 0 && grid[(row - 1) * cols + col]) orthogonalNeighbors++;
          if (row < rows - 1 && grid[(row + 1) * cols + col]) orthogonalNeighbors++;
          if (col > 0 && grid[row * cols + (col - 1)]) orthogonalNeighbors++;
          if (col < cols - 1 && grid[row * cols + (col + 1)]) orthogonalNeighbors++;

          if (row > 0 && col > 0 && grid[(row - 1) * cols + (col - 1)]) diagonalNeighbors++;
          if (row > 0 && col < cols - 1 && grid[(row - 1) * cols + (col + 1)]) diagonalNeighbors++;
          if (row < rows - 1 && col > 0 && grid[(row + 1) * cols + (col - 1)]) diagonalNeighbors++;
          if (row < rows - 1 && col < cols - 1 && grid[(row + 1) * cols + (col + 1)]) diagonalNeighbors++;

          // Keep solid interior/corner dots; strip stray 1-dot bumps on curves
          if (orthogonalNeighbors < 2) continue;
          if (orthogonalNeighbors === 2 && diagonalNeighbors < 2) continue;

          const tx = col * sampleStep;
          const ty = row * sampleStep;
          const angle = Math.random() * Math.PI * 2;
          const distance = reduceMotion
            ? 0
            : Math.hypot(width, height) * (0.03 + Math.random() * 0.06);

          nextParticles.push({
            x: tx + Math.cos(angle) * distance,
            y: ty + Math.sin(angle) * distance,
            vx: 0,
            vy: 0,
            tx,
            ty,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }

      particles = nextParticles;
      if (nextParticles.length > 0) {
        setParticlesReady(true);
      }
    };

    const onWindowPointerMove = (event: PointerEvent) => {
      hasPointer = true;
      lastClientX = event.clientX;
      lastClientY = event.clientY;
    };

    const onPointerLeave = () => {
      hasPointer = false;
      lastClientX = -1e4;
      lastClientY = -1e4;
    };

    window.addEventListener("pointermove", onWindowPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave, { passive: true });

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => buildParticles())
        : undefined;
    resizeObserver?.observe(span);

    const intersectionObserver =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              visible = entries[0]?.isIntersecting ?? true;
            },
            { rootMargin: "100px" }
          )
        : undefined;
    intersectionObserver?.observe(span);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!disposed) buildParticles();
      });
    } else {
      buildParticles();
    }

    const render = (time: number) => {
      if (disposed) return;
      animationFrame = requestAnimationFrame(render);
      if (!visible || !width || !height || particles.length === 0) return;

      const delta = lastTime ? Math.min(2, (time - lastTime) / 16.67) : 1;
      lastTime = time;

      // Recompute pointer coordinates against live getBoundingClientRect() every frame
      // so scrolling, resizing, or transforms never desynchronize the cursor.
      let pointerX = -1e4;
      let pointerY = -1e4;
      if (hasPointer) {
        const rect = canvas.getBoundingClientRect();
        const scaleToCanvasX = rect.width > 0 ? width / rect.width : 1;
        const scaleToCanvasY = rect.height > 0 ? height / rect.height : 1;
        const x = (lastClientX - rect.left) * scaleToCanvasX;
        const y = (lastClientY - rect.top) * scaleToCanvasY;
        if (
          x >= -pointerRadius &&
          x <= width + pointerRadius &&
          y >= -pointerRadius &&
          y <= height + pointerRadius
        ) {
          pointerX = x;
          pointerY = y;
        }
      }

      context.clearRect(0, 0, width, height);

      const repelEase = Math.min(0.65, 0.48 * delta);
      const repelDamping = Math.pow(0.66, delta);
      const returnEase = Math.min(0.45, 0.16 * Math.max(0.15, speed) * delta);
      const returnDamping = Math.pow(0.76, delta);

      const radius = Math.max(0, pointerRadius);
      const radiusSquared = radius * radius;
      const radiusPx = particleRadiusRef.current;
      const wobble = reduceMotion ? 0 : drift;

      context.beginPath();
      for (const particle of particles) {
        const dx = particle.x - pointerX;
        const dy = particle.y - pointerY;
        const distanceSquared = dx * dx + dy * dy;

        let targetX = particle.tx;
        let targetY = particle.ty;
        const isRepelled = distanceSquared < radiusSquared && radius > 0;

        if (isRepelled) {
          const distance = Math.max(0.001, Math.sqrt(distanceSquared));
          const falloff = 1 - distance / radius;
          const force =
            falloff *
            falloff *
            pointerStrength *
            Math.min(90, radius * 0.65);
          targetX += (dx / distance) * force;
          targetY += (dy / distance) * force;
        }

        targetX += Math.sin(time * 0.0012 + particle.phase) * wobble;
        targetY += Math.cos(time * 0.001 + particle.phase) * wobble;

        const ease = isRepelled ? repelEase : returnEase;
        const damping = isRepelled ? repelDamping : returnDamping;

        particle.vx = (particle.vx + (targetX - particle.x) * ease) * damping;
        particle.vy = (particle.vy + (targetY - particle.y) * ease) * damping;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;

        // Lock onto exact grid position once settled so resting letters stay razor-sharp
        if (
          !isRepelled &&
          wobble === 0 &&
          Math.abs(particle.tx - particle.x) < 0.12 &&
          Math.abs(particle.ty - particle.y) < 0.12 &&
          Math.abs(particle.vx) < 0.05 &&
          Math.abs(particle.vy) < 0.05
        ) {
          particle.x = particle.tx;
          particle.y = particle.ty;
          particle.vx = 0;
          particle.vy = 0;
        }

        if (radiusPx > 0.05) {
          context.moveTo(particle.x + radiusPx, particle.y);
          context.arc(particle.x, particle.y, radiusPx, 0, Math.PI * 2);
        }
      }
      context.fillStyle = "#000000";
      context.fill();
    };

    animationFrame = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener("pointermove", onWindowPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [text, speed, pointerRadius, pointerStrength, drift, maxDPR, scaleX, scaleY]);

  return (
    <h1
      ref={headingRef}
      aria-label={text}
      className="font-akzidenz font-black w-full text-center uppercase leading-[0.9] [word-spacing:0.22em] text-[#000000] whitespace-nowrap flex items-baseline justify-center z-10 relative overflow-visible"
    >
      {/* Preserves exact typography metrics, layout box, and text selection */}
      <span
        ref={spanRef}
        className={`inline-block origin-center scale-x-[1.32] scale-y-[1.24] text-[clamp(1.6rem,7.6vw,10.2rem)] tracking-[0.015em] [-webkit-text-stroke:0.02em_#000000] select-text ${
          particlesReady ? "opacity-0" : "opacity-100"
        }`}
      >
        {text}
      </span>
      {/* Particle-rendered letterforms aligned directly over the heading */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </h1>
  );
}
