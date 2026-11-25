"use client";

import React, { useEffect, useRef } from "react";

function smoothstep(t: number) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

function resolveVar(raw: string, el: HTMLElement | null): string {
  const s = raw.trim();
  if (!s.startsWith("var(")) return s;
  const inner = s.slice(4, -1).trim();
  const commaIdx = inner.indexOf(",");
  const varName = (commaIdx !== -1 ? inner.slice(0, commaIdx) : inner).trim();
  const fallback = commaIdx !== -1 ? inner.slice(commaIdx + 1).trim() : "";
  try {
    if (el) {
      const resolved = getComputedStyle(el).getPropertyValue(varName).trim();
      if (resolved) return resolved;
    }
  } catch (_) {}
  if (fallback) return resolveVar(fallback, el);
  return "#ffffff";
}

function parseColor(raw: string, el: HTMLElement | null) {
  const color = resolveVar(raw, el);
  if (color.startsWith("rgb")) {
    const m = color.match(/[\d.]+/g) || [];
    return {
      r: Number(m[0]) || 0,
      g: Number(m[1]) || 0,
      b: Number(m[2]) || 0,
    };
  }
  let h = color.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h.slice(0, 6), 16);
  if (isNaN(n)) return { r: 255, g: 255, b: 255 };
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

export interface DotGridBackgroundProps {
  dotColor?: string;
  dotSize?: number;
  dotSpacing?: number;
  orbitSpeed?: number;
  impactRadius?: number;
  scaleOnHover?: number;
  enableRevolve?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function DotGridBackground({
  dotColor = "rgba(255, 255, 255, 0.22)",
  dotSize = 2,
  dotSpacing = 24,
  orbitSpeed = 1.5,
  impactRadius = 120,
  scaleOnHover = 2.0,
  enableRevolve = true,
  style,
  className = "",
}: DotGridBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const cfgRef = useRef({
    dotColor,
    dotSize,
    dotSpacing,
    orbitSpeed,
    impactRadius,
    scaleOnHover,
    enableRevolve,
  });

  cfgRef.current.dotColor = dotColor;
  cfgRef.current.dotSize = dotSize;
  cfgRef.current.dotSpacing = dotSpacing;
  cfgRef.current.orbitSpeed = orbitSpeed;
  cfgRef.current.impactRadius = impactRadius;
  cfgRef.current.scaleOnHover = scaleOnHover;
  cfgRef.current.enableRevolve = enableRevolve;

  const dotsRef = useRef<
    Array<{
      bx: number;
      by: number;
      inclination: number;
      ascension: number;
      phase: number;
      speedMult: number;
    }>
  >([]);

  const spacingSnapRef = useRef(dotSpacing);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    const mouse = { x: -9999, y: -9999 };
    let hovering = false;
    let leaveTs = 0;
    let prevTs = 0;
    let raf = 0;
    let globalAngle = 0;

    function buildDots() {
      const sp = cfgRef.current.dotSpacing;
      spacingSnapRef.current = sp;
      dotsRef.current = [];
      const cols = Math.ceil(W / sp) + 2;
      const rows = Math.ceil(H / sp) + 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dotsRef.current.push({
            bx: c * sp,
            by: r * sp,
            inclination: Math.random() * Math.PI,
            ascension: Math.random() * Math.PI * 2,
            phase: Math.random() * Math.PI * 2,
            speedMult: 0.7 + Math.random() * 0.6,
          });
        }
      }
    }

    function resize() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildDots();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // Track mouse on window so pointer-events-none canvas still receives reactive mouse events
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        hovering = true;
      } else if (hovering) {
        mouse.x = -9999;
        mouse.y = -9999;
        hovering = false;
        leaveTs = performance.now();
      }
    };

    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      hovering = false;
      leaveTs = performance.now();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    function loop(ts: number) {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((ts - (prevTs || ts)) / 1000, 0.05);
      prevTs = ts;
      const cfg = cfgRef.current;
      if (spacingSnapRef.current !== cfg.dotSpacing) buildDots();
      globalAngle += cfg.orbitSpeed * dt;

      ctx!.clearRect(0, 0, W, H);
      const rgb = parseColor(cfg.dotColor, canvas);
      const mx = mouse.x;
      const my = mouse.y;
      const timeSinceLeave = hovering ? 0 : Math.max(0, ts - leaveTs) / 1000;
      const decay = hovering ? 1 : smoothstep(Math.max(0, 1 - timeSinceLeave * 1.5));

      for (const d of dotsRef.current) {
        const dx = d.bx - mx;
        const dy = d.by - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const inRange = dist < cfg.impactRadius && dist > 0;
        let x = d.bx;
        let y = d.by;
        let scale = 1;
        let alpha = 0.25;

        if (inRange) {
          const t = dist / cfg.impactRadius;
          const inf = smoothstep(1 - t) * decay;
          if (cfg.enableRevolve) {
            const orbitR = (1 - t) * cfg.dotSpacing * 0.7 * inf;
            const theta = globalAngle * d.speedMult + d.phase;
            const cosA = Math.cos(d.ascension);
            const sinA = Math.sin(d.ascension);
            const cosI = Math.cos(d.inclination);
            const sinI = Math.sin(d.inclination);
            const lx = Math.cos(theta);
            const ly = Math.sin(theta) * cosI;
            const lz = Math.sin(theta) * sinI;

            const ox = (lx * cosA - ly * sinA) * orbitR;
            const oy = (lx * sinA + ly * cosA) * orbitR;
            x = d.bx + ox;
            y = d.by + oy;

            const depthScale = 0.75 + 0.25 * ((lz + 1) * 0.5);
            scale = (1 + (cfg.scaleOnHover - 1) * inf) * depthScale;
            alpha = (0.25 + 0.75 * inf) * depthScale;
          } else {
            scale = 1 + (cfg.scaleOnHover - 1) * inf;
            alpha = 0.25 + 0.75 * inf;
          }
        }

        const r = (cfg.dotSize / 2) * scale;
        ctx!.beginPath();
        ctx!.arc(x, y, r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
        ctx!.fill();
      }
    }

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none block size-full ${className}`}
      style={{ ...style }}
    />
  );
}
