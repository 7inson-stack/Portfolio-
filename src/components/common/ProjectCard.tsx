"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface ProjectCardProps {
  id: string;
  title: string;
  href: string;
  imageSrc: string;
  videoSrc: string;
  tags: string[];
}

export default function ProjectCard({
  id,
  title,
  href,
  imageSrc,
  videoSrc,
  tags,
}: ProjectCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cardRef = useRef<HTMLAnchorElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt / parallax springs matching chunk 0ik7o53axsp2s.js
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springConfig = { stiffness: 240, damping: 22, mass: 0.1 };
  const springX = useSpring(mx, springConfig);
  const springY = useSpring(my, springConfig);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const t = (e.clientX - rect.left) / rect.width - 0.5;
    const n = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(72 * t);
    my.set(48 * n);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mx.set(0);
    my.set(0);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: "easeOut",
          },
        },
      }}
      className="col-span-12 flex w-full flex-col gap-4 lg:col-span-6"
    >
      <Link
        ref={cardRef}
        data-project-card="true"
        data-project-id={id}
        className="group bg-[#1e1e1e] flex w-full flex-col p-4 pb-8 cursor-pointer select-none"
        href={href}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative aspect-4/3 w-full overflow-hidden select-none">
          {/* Static image overscaled to 1.1 for subtle parallax feeling */}
          <div
            className="pointer-events-none absolute inset-0 select-none transition-transform duration-500 ease-out"
            style={{
              filter: "blur(0px)",
              transform: isHovered ? "scale(1.12)" : "scale(1.1)",
            }}
          >
            <Image
              alt={title}
              draggable={false}
              fill
              className="pointer-events-none scale-[1.01] object-cover select-none"
              sizes="(min-width: 1024px) 50vw, 100vw"
              src={imageSrc}
            />
          </div>

          {/* Dark scrim overlay */}
          <div
            className={`bg-[#0a0a0a]/25 pointer-events-none absolute inset-0 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
          />

          {/* Hover video mockup popup */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-2">
            <div className="flex w-full items-center justify-center">
              <motion.div
                className="border-[#f6f6f6]/15 bg-[#0a0a0a] relative aspect-2304/1302 w-[90%] overflow-hidden rounded-xs border shadow-[0_16px_32px_-8px_rgba(0,0,0,0.4),0_4px_10px_-2px_rgba(0,0,0,0.2)] transition-all duration-300"
                style={{
                  x: springX,
                  y: springY,
                  opacity: isHovered ? 1 : 0,
                  filter: isHovered ? "blur(0px)" : "blur(6px)",
                  scale: isHovered ? 1 : 0.96,
                }}
              >
                <video
                  ref={videoRef}
                  src={videoSrc}
                  muted
                  playsInline
                  loop
                  preload="metadata"
                  className="size-full object-cover"
                  aria-hidden="true"
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Info footer */}
        <div className="text-foreground mt-6 flex items-start justify-between gap-4 sm:mt-8">
          <h3 className="text-section min-w-0 flex-1 font-normal">
            {title}
          </h3>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-caption md:text-body uppercase text-neutral"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
