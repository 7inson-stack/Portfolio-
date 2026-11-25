"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

interface FluidMorphHeroProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  liquify?: number;
  pull?: number;
  cursorSize?: number;
  speed?: number;
  swirl?: number;
  fold?: number;
  resolution?: number;
  pressureIterations?: number;
  velocityDecay?: number;
  trailDecay?: number;
  quality?: number;
}

export default function FluidMorphHero({
  src,
  alt,
  priority = true,
  className = "",
  liquify = 60,
  pull = 26,
  cursorSize = 8,
  speed = 1.6,
  swirl = 9,
  fold = 3.2,
  resolution = 160,
  pressureIterations = 4,
  velocityDecay = 0.945,
  trailDecay = 0.968,
  quality = 2,
}: FluidMorphHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  const pointerState = useRef({
    x: 0.5,
    y: 0.5,
    oldX: 0.5,
    oldY: 0.5,
    startX: 0.5,
    startY: 0.5,
    endX: 0.5,
    endY: 0.5,
    dx: 0,
    dy: 0,
    pending: false,
    inside: false,
  });

  const requestRenderRef = useRef<(() => void) | null>(null);
  const ambientTickRef = useRef<number>(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src || isReducedMotion) return;

    let disposed = false;
    let animId: number | null = null;
    let resizeTimer: NodeJS.Timeout | null = null;
    let fallbackTimer: NodeJS.Timeout | null = null;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });

    if (!gl) {
      setWebglSupported(false);
      return;
    }

    // Context loss handlers
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      if (animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };
    const handleContextRestored = () => {
      // triggers re-init
      setWebglSupported((prev) => !prev);
    };
    canvas.addEventListener("webglcontextlost", handleContextLost, false);
    canvas.addEventListener("webglcontextrestored", handleContextRestored, false);

    // Extensions check
    const extHalfFloat = gl.getExtension("OES_texture_half_float");
    const extHalfFloatLinear = gl.getExtension("OES_texture_half_float_linear");
    const extColorBufferHalfFloat = gl.getExtension("EXT_color_buffer_half_float");
    const extFloat = gl.getExtension("OES_texture_float");
    const extColorBufferFloat = gl.getExtension("WEBGL_color_buffer_float");

    const checkFramebuffer = (type: number) => {
      const tex = gl.createTexture();
      const fbo = gl.createFramebuffer();
      if (!tex || !fbo) return false;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 4, 4, 0, gl.RGBA, type, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.deleteFramebuffer(fbo);
      gl.deleteTexture(tex);
      return ok;
    };

    let textureType: number | null = null;
    if (extHalfFloat && extColorBufferHalfFloat && checkFramebuffer(extHalfFloat.HALF_FLOAT_OES)) {
      textureType = extHalfFloat.HALF_FLOAT_OES;
    } else if (extFloat && extColorBufferFloat && checkFramebuffer(gl.FLOAT)) {
      textureType = gl.FLOAT;
    }

    if (textureType === null) {
      setWebglSupported(false);
      return;
    }

    let isImageLoaded = false;
    let isFboReady = false;
    let prevWidth = 0;
    let prevHeight = 0;
    let simWidth = resolution;
    let simHeight = resolution;
    let lastRenderTime = 0;
    let isIntersecting = true;

    // Shader compilation
    function compileShader(type: number, source: string) {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const baseVertexShader = `
      precision highp float;
      attribute vec2 a_position;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 uTexel;
      void main() {
        vUv = a_position * 0.5 + 0.5;
        vL = vUv - vec2(uTexel.x, 0.0);
        vR = vUv + vec2(uTexel.x, 0.0);
        vT = vUv + vec2(0.0, uTexel.y);
        vB = vUv - vec2(0.0, uTexel.y);
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    function createProgram(fragmentSource: string) {
      const vert = compileShader(gl!.VERTEX_SHADER, baseVertexShader);
      const frag = compileShader(gl!.FRAGMENT_SHADER, fragmentSource);
      if (!vert || !frag) return null;
      const prog = gl!.createProgram();
      if (!prog) return null;
      gl!.attachShader(prog, vert);
      gl!.attachShader(prog, frag);
      gl!.linkProgram(prog);
      if (!gl!.getProgramParameter(prog, gl!.LINK_STATUS)) {
        return null;
      }
      gl!.deleteShader(vert);
      gl!.deleteShader(frag);
      return prog;
    }

    const splatShader = createProgram(`
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform vec2 uStart;
      uniform vec2 uEnd;
      uniform vec2 uValue;
      uniform float uRadius;
      uniform float uAspect;
      float segmentDistance(vec2 p, vec2 a, vec2 b) {
        p.x *= uAspect;
        a.x *= uAspect;
        b.x *= uAspect;
        vec2 pa = p - a;
        vec2 ba = b - a;
        float denom = max(dot(ba, ba), 0.000001);
        float h = clamp(dot(pa, ba) / denom, 0.0, 1.0);
        return length(pa - ba * h);
      }
      void main() {
        vec2 current = texture2D(uTarget, vUv).xy;
        float d = segmentDistance(vUv, uStart, uEnd);
        float influence = exp(-(d * d) / max(uRadius, 0.000001));
        influence = pow(influence, 1.35);
        current += uValue * influence;
        gl_FragColor = vec4(current, 0.0, 1.0);
      }
    `);

    const curlShader = createProgram(`
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      void main() {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float curl = 0.5 * (R - L - T + B);
        gl_FragColor = vec4(curl, 0.0, 0.0, 1.0);
      }
    `);

    const vorticityShader = createProgram(`
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float uStrength;
      uniform float uDt;
      void main() {
        float L = abs(texture2D(uCurl, vL).x);
        float R = abs(texture2D(uCurl, vR).x);
        float T = abs(texture2D(uCurl, vT).x);
        float B = abs(texture2D(uCurl, vB).x);
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(R - L, T - B);
        float len = length(force);
        force /= max(len, 0.0001);
        force = vec2(force.y, -force.x) * C * uStrength;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * uDt;
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `);

    const divergenceShader = createProgram(`
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      void main() {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `);

    const pressureShader = createProgram(`
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      void main() {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float D = texture2D(uDivergence, vUv).x;
        float P = (L + R + T + B - D) * 0.25;
        gl_FragColor = vec4(P, 0.0, 0.0, 1.0);
      }
    `);

    const gradientShader = createProgram(`
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      void main() {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `);

    const advectionShader = createProgram(`
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 uTexel;
      uniform float uDt;
      uniform float uDecay;
      vec4 bilerp(sampler2D tex, vec2 uv) {
        vec2 size = 1.0 / uTexel;
        vec2 position = uv * size - 0.5;
        vec2 index = floor(position);
        vec2 fraction = fract(position);
        vec2 uv00 = (index + 0.5) / size;
        vec2 uv10 = (index + vec2(1.5, 0.5)) / size;
        vec2 uv01 = (index + vec2(0.5, 1.5)) / size;
        vec2 uv11 = (index + 1.5) / size;
        vec4 a = texture2D(tex, uv00);
        vec4 b = texture2D(tex, uv10);
        vec4 c = texture2D(tex, uv01);
        vec4 d = texture2D(tex, uv11);
        return mix(mix(a, b, fraction.x), mix(c, d, fraction.x), fraction.y);
      }
      void main() {
        vec2 vel = bilerp(uVelocity, vUv).xy;
        vec2 coord = vUv - vel * uTexel * uDt;
        vec4 value = bilerp(uSource, coord);
        gl_FragColor = value * uDecay;
      }
    `);

    const displayShader = createProgram(`
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uImage;
      uniform sampler2D uWarp;
      uniform sampler2D uVelocity;
      uniform vec2 uResolution;
      uniform vec2 uImageSize;
      uniform float uPower;
      uniform float uFold;
      uniform float uFit;
      vec2 imageUV(vec2 uv) {
        float viewportAspect = uResolution.x / max(uResolution.y, 1.0);
        float imageAspect = uImageSize.x / max(uImageSize.y, 1.0);
        if (uFit < 0.5) {
          // cover
          if (viewportAspect > imageAspect) {
            float s = imageAspect / viewportAspect;
            uv.y = (uv.y - 0.5) * s + 0.5;
          } else {
            float s = viewportAspect / imageAspect;
            uv.x = (uv.x - 0.5) * s + 0.5;
          }
        } else {
          // contain
          if (viewportAspect > imageAspect) {
            float s = imageAspect / viewportAspect;
            uv.x = (uv.x - 0.5) / s + 0.5;
          } else {
            float s = viewportAspect / imageAspect;
            uv.y = (uv.y - 0.5) / s + 0.5;
          }
        }
        return uv;
      }
      void main() {
        vec2 warp = texture2D(uWarp, vUv).xy;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        float magnitude = length(warp);
        float folding = 1.0 + min(magnitude * uFold, 2.5);
        vec2 displacement = warp * folding * uPower;
        displacement += velocity * uPower * 0.035;
        vec2 uv = vUv - displacement;
        uv = clamp(uv, vec2(0.001), vec2(0.999));
        vec2 texUv = imageUV(uv);
        texUv = clamp(texUv, vec2(0.001), vec2(0.999));
        gl_FragColor = texture2D(uImage, texUv);
      }
    `);

    if (
      !splatShader ||
      !curlShader ||
      !vorticityShader ||
      !divergenceShader ||
      !pressureShader ||
      !gradientShader ||
      !advectionShader ||
      !displayShader
    ) {
      setWebglSupported(false);
      return;
    }

    function getUniforms(prog: WebGLProgram, names: string[]) {
      const map: Record<string, WebGLUniformLocation | null> = {};
      for (const name of names) {
        map[name] = gl!.getUniformLocation(prog, name);
      }
      return map;
    }

    const uniforms = {
      splat: getUniforms(splatShader, ["uTexel", "uTarget", "uStart", "uEnd", "uValue", "uRadius", "uAspect"]),
      curl: getUniforms(curlShader, ["uTexel", "uVelocity"]),
      vorticity: getUniforms(vorticityShader, ["uTexel", "uVelocity", "uCurl", "uStrength", "uDt"]),
      divergence: getUniforms(divergenceShader, ["uTexel", "uVelocity"]),
      pressure: getUniforms(pressureShader, ["uTexel", "uPressure", "uDivergence"]),
      gradient: getUniforms(gradientShader, ["uTexel", "uPressure", "uVelocity"]),
      advection: getUniforms(advectionShader, ["uTexel", "uVelocity", "uSource", "uDt", "uDecay"]),
      display: getUniforms(displayShader, [
        "uTexel",
        "uImage",
        "uWarp",
        "uVelocity",
        "uResolution",
        "uImageSize",
        "uPower",
        "uFold",
        "uFit",
      ]),
    };

    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    function bindQuad(prog: WebGLProgram, texelLoc: WebGLUniformLocation | null, w: number, h: number) {
      gl!.useProgram(prog);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, quadBuffer);
      const posAttr = gl!.getAttribLocation(prog, "a_position");
      gl!.enableVertexAttribArray(posAttr);
      gl!.vertexAttribPointer(posAttr, 2, gl!.FLOAT, false, 0, 0);
      if (texelLoc) {
        gl!.uniform2f(texelLoc, 1 / w, 1 / h);
      }
    }

    function renderQuad(fbo: WebGLFramebuffer | null, w: number, h: number) {
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.viewport(0, 0, w, h);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    function bindTexture(tex: WebGLTexture, unit: number) {
      gl!.activeTexture(gl!.TEXTURE0 + unit);
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      return unit;
    }

    function createFBO(w: number, h: number) {
      const tex = gl!.createTexture();
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.NEAREST);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.NEAREST);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, w, h, 0, gl!.RGBA, textureType!, null);

      const fbo = gl!.createFramebuffer();
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0);
      if (gl!.checkFramebufferStatus(gl!.FRAMEBUFFER) === gl!.FRAMEBUFFER_COMPLETE) {
        gl!.viewport(0, 0, w, h);
        gl!.clearColor(0, 0, 0, 0);
        gl!.clear(gl!.COLOR_BUFFER_BIT);
        return { texture: tex!, framebuffer: fbo!, width: w, height: h };
      }
      gl!.deleteTexture(tex);
      gl!.deleteFramebuffer(fbo);
      return null;
    }

    function createDoubleFBO(w: number, h: number) {
      let fbo1 = createFBO(w, h);
      let fbo2 = createFBO(w, h);
      if (!fbo1 || !fbo2) {
        if (fbo1) {
          gl!.deleteTexture(fbo1.texture);
          gl!.deleteFramebuffer(fbo1.framebuffer);
        }
        if (fbo2) {
          gl!.deleteTexture(fbo2.texture);
          gl!.deleteFramebuffer(fbo2.framebuffer);
        }
        return null;
      }
      return {
        get read() {
          return fbo1!;
        },
        get write() {
          return fbo2!;
        },
        swap() {
          const temp = fbo1;
          fbo1 = fbo2;
          fbo2 = temp;
        },
      };
    }

    function destroyFBO(fbo: { texture: WebGLTexture; framebuffer: WebGLFramebuffer } | null) {
      if (fbo) {
        gl!.deleteTexture(fbo.texture);
        gl!.deleteFramebuffer(fbo.framebuffer);
      }
    }

    function destroyDoubleFBO(doubleFbo: ReturnType<typeof createDoubleFBO>) {
      if (doubleFbo) {
        destroyFBO(doubleFbo.read);
        destroyFBO(doubleFbo.write);
      }
    }

    let velocityFBO: ReturnType<typeof createDoubleFBO> = null;
    let warpFBO: ReturnType<typeof createDoubleFBO> = null;
    let curlFBO: ReturnType<typeof createFBO> = null;
    let divergenceFBO: ReturnType<typeof createFBO> = null;
    let pressureFBO: ReturnType<typeof createDoubleFBO> = null;

    function getSimResolution() {
      const rect = canvas!.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return null;
      const aspect = rect.width / rect.height;
      let w: number;
      let h: number;
      if (aspect >= 1) {
        h = resolution;
        w = Math.round(resolution * aspect);
      } else {
        w = resolution;
        h = Math.round(resolution / aspect);
      }
      if (w > 384) {
        const s = 384 / w;
        w = 384;
        h = Math.round(h * s);
      }
      if (h > 384) {
        const s = 384 / h;
        h = 384;
        w = Math.round(w * s);
      }
      return {
        width: Math.max(32, w),
        height: Math.max(32, h),
      };
    }

    function initFBOs(force = false) {
      const res = getSimResolution();
      if (!res) return false;
      if (!force && isFboReady && res.width === simWidth && res.height === simHeight) return true;

      destroyDoubleFBO(velocityFBO);
      destroyDoubleFBO(warpFBO);
      destroyFBO(curlFBO);
      destroyFBO(divergenceFBO);
      destroyDoubleFBO(pressureFBO);
      isFboReady = false;

      simWidth = res.width;
      simHeight = res.height;

      velocityFBO = createDoubleFBO(simWidth, simHeight);
      warpFBO = createDoubleFBO(simWidth, simHeight);
      curlFBO = createFBO(simWidth, simHeight);
      divergenceFBO = createFBO(simWidth, simHeight);
      pressureFBO = createDoubleFBO(simWidth, simHeight);

      if (!velocityFBO || !warpFBO || !curlFBO || !divergenceFBO || !pressureFBO) {
        destroyDoubleFBO(velocityFBO);
        destroyDoubleFBO(warpFBO);
        destroyFBO(curlFBO);
        destroyFBO(divergenceFBO);
        destroyDoubleFBO(pressureFBO);
        setWebglSupported(false);
        return false;
      }
      isFboReady = true;
      return true;
    }

    // Apply interactive or ambient splat
    function applySplat(
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      dx: number,
      dy: number,
      forceMultiplier = 1
    ) {
      if (!velocityFBO || !warpFBO) return;
      const rect = canvas!.getBoundingClientRect();
      const aspect = rect.width / Math.max(rect.height, 1);
      const rad = (cursorSize * 0.01) ** 2;
      const p = pull * 11 * forceMultiplier;

      // Velocity splat
      bindQuad(splatShader!, uniforms.splat.uTexel, simWidth, simHeight);
      gl!.uniform1i(uniforms.splat.uTarget, bindTexture(velocityFBO.read.texture, 0));
      gl!.uniform2f(uniforms.splat.uStart, startX, startY);
      gl!.uniform2f(uniforms.splat.uEnd, endX, endY);
      gl!.uniform2f(uniforms.splat.uValue, dx * p, dy * p);
      gl!.uniform1f(uniforms.splat.uRadius, rad);
      gl!.uniform1f(uniforms.splat.uAspect, aspect);
      renderQuad(velocityFBO.write.framebuffer, simWidth, simHeight);
      velocityFBO.swap();

      // Warp splat
      bindQuad(splatShader!, uniforms.splat.uTexel, simWidth, simHeight);
      gl!.uniform1i(uniforms.splat.uTarget, bindTexture(warpFBO.read.texture, 0));
      gl!.uniform2f(uniforms.splat.uStart, startX, startY);
      gl!.uniform2f(uniforms.splat.uEnd, endX, endY);
      const c = pull * 2.5 * forceMultiplier;
      gl!.uniform2f(uniforms.splat.uValue, dx * c, dy * c);
      gl!.uniform1f(uniforms.splat.uRadius, rad * 0.95);
      gl!.uniform1f(uniforms.splat.uAspect, aspect);
      renderQuad(warpFBO.write.framebuffer, simWidth, simHeight);
      warpFBO.swap();
    }

    function stepSimulation() {
      if (!velocityFBO || !warpFBO || !curlFBO || !divergenceFBO || !pressureFBO) return;
      const simSpeed = Math.max(0.2, speed);

      // 1. Vorticity
      if (swirl > 0) {
        bindQuad(curlShader!, uniforms.curl.uTexel, simWidth, simHeight);
        gl!.uniform1i(uniforms.curl.uVelocity, bindTexture(velocityFBO.read.texture, 0));
        renderQuad(curlFBO.framebuffer, simWidth, simHeight);

        bindQuad(vorticityShader!, uniforms.vorticity.uTexel, simWidth, simHeight);
        gl!.uniform1i(uniforms.vorticity.uVelocity, bindTexture(velocityFBO.read.texture, 0));
        gl!.uniform1i(uniforms.vorticity.uCurl, bindTexture(curlFBO.texture, 1));
        gl!.uniform1f(uniforms.vorticity.uStrength, swirl);
        gl!.uniform1f(uniforms.vorticity.uDt, 0.016 * simSpeed);
        renderQuad(velocityFBO.write.framebuffer, simWidth, simHeight);
        velocityFBO.swap();
      }

      // 2. Divergence
      bindQuad(divergenceShader!, uniforms.divergence.uTexel, simWidth, simHeight);
      gl!.uniform1i(uniforms.divergence.uVelocity, bindTexture(velocityFBO.read.texture, 0));
      renderQuad(divergenceFBO.framebuffer, simWidth, simHeight);

      // 3. Pressure solve
      bindQuad(pressureShader!, uniforms.pressure.uTexel, simWidth, simHeight);
      gl!.uniform1i(uniforms.pressure.uDivergence, bindTexture(divergenceFBO.texture, 1));
      const iters = Math.max(2, Math.min(10, Math.round(pressureIterations)));
      for (let i = 0; i < iters; i++) {
        gl!.uniform1i(uniforms.pressure.uPressure, bindTexture(pressureFBO.read.texture, 0));
        renderQuad(pressureFBO.write.framebuffer, simWidth, simHeight);
        pressureFBO.swap();
      }

      // 4. Gradient subtraction
      bindQuad(gradientShader!, uniforms.gradient.uTexel, simWidth, simHeight);
      gl!.uniform1i(uniforms.gradient.uPressure, bindTexture(pressureFBO.read.texture, 0));
      gl!.uniform1i(uniforms.gradient.uVelocity, bindTexture(velocityFBO.read.texture, 1));
      renderQuad(velocityFBO.write.framebuffer, simWidth, simHeight);
      velocityFBO.swap();

      // 5. Velocity advection
      bindQuad(advectionShader!, uniforms.advection.uTexel, simWidth, simHeight);
      gl!.uniform1i(uniforms.advection.uVelocity, bindTexture(velocityFBO.read.texture, 0));
      gl!.uniform1i(uniforms.advection.uSource, bindTexture(velocityFBO.read.texture, 1));
      gl!.uniform1f(uniforms.advection.uDt, 0.8 * simSpeed);
      gl!.uniform1f(uniforms.advection.uDecay, velocityDecay);
      renderQuad(velocityFBO.write.framebuffer, simWidth, simHeight);
      velocityFBO.swap();

      // 6. Warp advection
      bindQuad(advectionShader!, uniforms.advection.uTexel, simWidth, simHeight);
      gl!.uniform1i(uniforms.advection.uVelocity, bindTexture(velocityFBO.read.texture, 0));
      gl!.uniform1i(uniforms.advection.uSource, bindTexture(warpFBO.read.texture, 1));
      gl!.uniform1f(uniforms.advection.uDt, 1.15 * simSpeed);
      gl!.uniform1f(uniforms.advection.uDecay, trailDecay);
      renderQuad(warpFBO.write.framebuffer, simWidth, simHeight);
      warpFBO.swap();
    }

    // Load Image as WebGL Texture
    const imageTex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, imageTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";

    function updateCanvasSize() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, quality);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
      }
    }

    function drawDisplay() {
      if (!isImageLoaded || !isFboReady || !velocityFBO || !warpFBO) return;
      updateCanvasSize();
      bindQuad(displayShader!, uniforms.display.uTexel, canvas!.width, canvas!.height);
      gl!.uniform1i(uniforms.display.uImage, bindTexture(imageTex, 0));
      gl!.uniform1i(uniforms.display.uWarp, bindTexture(warpFBO.read.texture, 1));
      gl!.uniform1i(uniforms.display.uVelocity, bindTexture(velocityFBO.read.texture, 2));
      gl!.uniform2f(uniforms.display.uResolution, canvas!.width, canvas!.height);
      gl!.uniform2f(uniforms.display.uImageSize, img.naturalWidth || 600, img.naturalHeight || 800);
      gl!.uniform1f(uniforms.display.uPower, liquify * 0.00072);
      gl!.uniform1f(uniforms.display.uFold, fold);
      gl!.uniform1f(uniforms.display.uFit, 0.0); // cover
      renderQuad(null, canvas!.width, canvas!.height);
    }

    function renderLoop(time: number) {
      if (disposed || !isIntersecting || !isImageLoaded || !isFboReady) {
        animId = null;
        return;
      }

      // Check pointer interaction
      const pt = pointerState.current;
      if (pt.pending) {
        applySplat(pt.startX, pt.startY, pt.endX, pt.endY, pt.dx, pt.dy, 1.0);
        pt.pending = false;
        lastRenderTime = time;
      }

      // Subtle ambient continuous drift when visible
      ambientTickRef.current += 0.012;
      const t = ambientTickRef.current;
      // Gentle sine wave motion across portrait center to keep fluid alive and breathing
      const ambX = 0.5 + Math.sin(t * 0.8) * 0.22;
      const ambY = 0.5 + Math.cos(t * 0.6) * 0.26;
      const ambDx = -Math.cos(t * 0.8) * 0.003;
      const ambDy = Math.sin(t * 0.6) * 0.003;
      applySplat(ambX, ambY, ambX + ambDx, ambY + ambDy, ambDx, ambDy, 0.22);

      stepSimulation();
      drawDisplay();

      // Continuous loop while intersecting
      animId = requestAnimationFrame(renderLoop);
    }

    function triggerRender() {
      if (disposed || !isIntersecting || animId !== null || !isImageLoaded || !isFboReady) return;
      lastRenderTime = performance.now();
      animId = requestAnimationFrame(renderLoop);
    }

    requestRenderRef.current = triggerRender;

    img.onload = () => {
      if (disposed) return;
      gl.bindTexture(gl.TEXTURE_2D, imageTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      isImageLoaded = true;

      // Warmup & initial draw
      const rect = canvas.getBoundingClientRect();
      if (rect.width >= 2 && rect.height >= 2) {
        updateCanvasSize();
        if (initFBOs(true)) {
          prevWidth = rect.width;
          prevHeight = rect.height;
          // Apply initial soft ripple for page entrance feel
          applySplat(0.5, 0.45, 0.52, 0.55, 0.02, 0.02, 0.8);
          drawDisplay();
          triggerRender();
        }
      }
    };
    img.src = src;

    // Resize observer
    const ro = new ResizeObserver(() => {
      if (!isImageLoaded || disposed) return;
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (disposed) return;
        const rect = canvas.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return;
        const changed = Math.abs(rect.width - prevWidth) > 2 || Math.abs(rect.height - prevHeight) > 2;
        updateCanvasSize();
        if (changed) {
          prevWidth = rect.width;
          prevHeight = rect.height;
          initFBOs(false);
        }
        drawDisplay();
      }, 100);
    });
    ro.observe(canvas);

    // Intersection observer
    const io = new IntersectionObserver(
      ([entry]) => {
        if (disposed) return;
        isIntersecting = entry.isIntersecting && entry.intersectionRatio > 0;
        if (!isIntersecting) {
          if (animId !== null) {
            cancelAnimationFrame(animId);
            animId = null;
          }
        } else if (isImageLoaded && isFboReady) {
          drawDisplay();
          triggerRender();
        }
      },
      { threshold: 0.01 }
    );
    io.observe(canvas);

    return () => {
      disposed = true;
      requestRenderRef.current = null;
      if (resizeTimer) clearTimeout(resizeTimer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (animId !== null) cancelAnimationFrame(animId);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      ro.disconnect();
      io.disconnect();

      destroyDoubleFBO(velocityFBO);
      destroyDoubleFBO(warpFBO);
      destroyFBO(curlFBO);
      destroyFBO(divergenceFBO);
      destroyDoubleFBO(pressureFBO);

      gl.deleteTexture(imageTex);
      gl.deleteBuffer(quadBuffer);
      gl.deleteProgram(splatShader);
      gl.deleteProgram(curlShader);
      gl.deleteProgram(vorticityShader);
      gl.deleteProgram(divergenceShader);
      gl.deleteProgram(pressureShader);
      gl.deleteProgram(gradientShader);
      gl.deleteProgram(advectionShader);
      gl.deleteProgram(displayShader);
    };
  }, [
    src,
    liquify,
    pull,
    cursorSize,
    speed,
    swirl,
    fold,
    resolution,
    pressureIterations,
    velocityDecay,
    trailDecay,
    quality,
    isReducedMotion,
  ]);

  const getRelativeCoords = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: 1 - (e.clientY - rect.top) / rect.height,
    };
  }, []);

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const coords = getRelativeCoords(e);
      const pt = pointerState.current;
      pt.x = coords.x;
      pt.y = coords.y;
      pt.oldX = coords.x;
      pt.oldY = coords.y;
      pt.startX = coords.x;
      pt.startY = coords.y;
      pt.endX = coords.x;
      pt.endY = coords.y;
      pt.dx = 0;
      pt.dy = 0;
      pt.inside = true;
    },
    [getRelativeCoords]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const coords = getRelativeCoords(e);
      const pt = pointerState.current;
      if (!pt.pending) {
        pt.startX = pt.x;
        pt.startY = pt.y;
        pt.dx = 0;
        pt.dy = 0;
      }
      const rx = coords.x - pt.x;
      const ry = coords.y - pt.y;
      pt.dx += rx;
      pt.dy += ry;
      pt.dx = Math.max(-0.1, Math.min(0.1, pt.dx));
      pt.dy = Math.max(-0.1, Math.min(0.1, pt.dy));
      pt.x = coords.x;
      pt.y = coords.y;
      pt.endX = coords.x;
      pt.endY = coords.y;
      pt.pending = true;
      requestRenderRef.current?.();
    },
    [getRelativeCoords]
  );

  const handlePointerLeave = useCallback(() => {
    pointerState.current.inside = false;
  }, []);

  return (
    <div
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative size-full overflow-hidden ${className}`}
      style={{ touchAction: "pan-y" }}
    >
      {/* High-quality static image for immediate LCP, SEO & accessibility */}
      <Image
        alt={alt}
        src={src}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
        className="scale-[1.01] object-cover pointer-events-none select-none"
        draggable={false}
      />

      {/* WebGL Fluid Morph Canvas Overlay */}
      {webglSupported && !isReducedMotion && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 size-full block pointer-events-none transition-opacity duration-700 ease-out"
        />
      )}
    </div>
  );
}
