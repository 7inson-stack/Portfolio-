"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface FormtectureContactBlockProps {
  email?: string;
  phone?: string;
  containerClassName?: string;
  showCopyright?: boolean;
}

export default function FormtectureContactBlock({
  email = "7inson.5amuel@proton.me",
  phone = "+91 8319471976",
  containerClassName = "",
  showCopyright = true,
}: FormtectureContactBlockProps) {
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  const socialLinks = [
    { label: "Instagram", href: "https://instagram.com/7inu.5amuel" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/jinsonsamuel" },
  ];

  return (
    <div className={`w-full flex flex-col gap-16 sm:gap-20 md:gap-24 select-none ${containerClassName}`}>
      {/* =========================================================
          MAIN CONTACT ROW (2-COLUMN COMPOSITION)
          - No extra black container or background layer
          - Blends directly into the website's existing background
          ========================================================= */}
      <div className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 lg:gap-8 xl:gap-16">
        {/* =========================================================
            LEFT SIDE: CONTACT BUTTONS
            - Two rectangular dark-grey buttons (#101010)
            - Outline envelope and phone icons
            - Large ~24px clean white typography
            - Equal height, comfortable padding, small gap
            - Minimal corners
            ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 w-full lg:w-auto"
        >
          {/* Email Button */}
          <a
            href={`mailto:${email}`}
            className="group inline-flex items-center justify-center sm:justify-start gap-3.5 sm:gap-4 bg-[#101010] hover:bg-[#161616] border border-[#1e1e1e] hover:border-[#333333] px-6 sm:px-8 py-4 sm:py-5 transition-all duration-200 shrink-0 min-h-[64px] rounded-none sm:rounded-[2px]"
            aria-label={`Send email to ${email}`}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white shrink-0 size-5 sm:size-[22px] transition-transform duration-200 group-hover:scale-105"
              aria-hidden="true"
            >
              <rect width="20" height="15" x="2" y="4.5" rx="1.5" />
              <path d="m22 6.5-10 7-10-7" />
            </svg>
            <span className="text-white font-sans text-lg sm:text-xl lg:text-[23px] font-normal tracking-[-0.01em] whitespace-nowrap">
              {email}
            </span>
          </a>

          {/* Phone Button */}
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="group inline-flex items-center justify-center sm:justify-start gap-3.5 sm:gap-4 bg-[#101010] hover:bg-[#161616] border border-[#1e1e1e] hover:border-[#333333] px-6 sm:px-8 py-4 sm:py-5 transition-all duration-200 shrink-0 min-h-[64px] rounded-none sm:rounded-[2px]"
            aria-label={`Call ${phone}`}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white shrink-0 size-5 sm:size-[22px] transition-transform duration-200 group-hover:scale-105"
              aria-hidden="true"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              <path d="M14.05 2a9 9 0 0 1 8 7.94" strokeWidth="1.2" opacity="0.8" />
              <path d="M14.05 6A5 5 0 0 1 18 10" strokeWidth="1.2" opacity="0.8" />
            </svg>
            <span className="text-white font-sans text-lg sm:text-xl lg:text-[23px] font-normal tracking-[-0.01em] whitespace-nowrap">
              {phone}
            </span>
          </a>
        </motion.div>

        {/* =========================================================
            RIGHT SIDE: SOCIAL LINKS (Instagram & LinkedIn)
            - Two horizontal rows
            - Thin subtle grey dividers (#242424)
            - Left-aligned text (~18px), right-aligned northeast arrow
            ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full lg:w-[320px] xl:w-[360px] flex flex-col border-t border-b border-[#242424] divide-y divide-[#242424] shrink-0"
          role="list"
          aria-label="Social media links"
        >
          {socialLinks.map((item) => {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHoveredSocial(item.label)}
                onMouseLeave={() => setHoveredSocial(null)}
                className="group flex w-full items-center justify-between py-4 sm:py-5 px-1 transition-colors duration-200 select-none hover:bg-white/[0.02]"
                role="listitem"
                aria-label={item.label}
              >
                <span className="font-sans text-[17px] sm:text-[18px] font-normal tracking-[-0.01em] text-white/90 group-hover:text-white transition-colors duration-200">
                  {item.label}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-4 text-white/80 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-white"
                  aria-hidden="true"
                >
                  <path
                    d="M7 17L17 7M17 7H9M17 7V15"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            );
          })}
        </motion.div>
      </div>

      {/* =========================================================
          FOOTER COPYRIGHT LEVEL
          - Bottom-left aligned with contact buttons
          - JINSON © 2026 ALL RIGHTS RESERVED
          - Clean, subtle styling blending into the page background
          ========================================================= */}
      {showCopyright && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full flex items-center justify-between pt-2 pb-4 text-xs font-mono tracking-[0.16em] uppercase text-neutral/70"
        >
          <div>JINSON © 2026 ALL RIGHTS RESERVED</div>
        </motion.div>
      )}
    </div>
  );
}
