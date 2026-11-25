"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface FormtectureContactBlockProps {
  email?: string;
  phone?: string;
  onStartProject?: () => void;
}

export default function FormtectureContactBlock({
  email = "7inson.5amuel@proton.me",
  phone = "+91 8319471976",
  onStartProject,
}: FormtectureContactBlockProps) {
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <div className="w-full flex flex-col gap-8 sm:gap-10">
      {/* =========================================================
          Large Email & Phone Number with Underlines
          (Positioned directly below heading, aligned to left)
          ========================================================= */}
      <div className="flex flex-col gap-6 sm:gap-8 max-w-full">
        {/* A. EMAIL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="group relative inline-block w-fit max-w-full"
        >
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-3 sm:gap-4 text-2xl font-light tracking-tight text-foreground transition-colors duration-300 sm:text-3xl md:text-4xl lg:text-5xl"
            aria-label={`Send email to ${email}`}
          >
            <span className="break-all">{email}</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-5 sm:size-6 md:size-7 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1 text-foreground"
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

          {/* Thin Horizontal Underline with smooth hover reveal animation */}
          <div className="mt-3 sm:mt-4 h-[1px] w-full bg-white/30 overflow-hidden relative">
            <motion.div
              className="absolute inset-0 bg-accent origin-left"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </motion.div>

        {/* B. PHONE NUMBER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="group relative inline-block w-fit max-w-full"
        >
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="inline-flex items-center gap-3 sm:gap-4 text-2xl font-light tracking-tight text-foreground transition-colors duration-300 sm:text-3xl md:text-4xl lg:text-5xl"
            aria-label={`Call ${phone}`}
          >
            <span>{phone}</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-5 sm:size-6 md:size-7 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1 text-foreground"
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

          {/* Thin Horizontal Underline with smooth hover reveal animation */}
          <div className="mt-3 sm:mt-4 h-[1px] w-full bg-white/30 overflow-hidden relative">
            <motion.div
              className="absolute inset-0 bg-accent origin-left"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </motion.div>
      </div>

      {/* =========================================================
          C. START A PROJECT BUTTON (underneath contact links)
          - Rectangular outlined button
          - Text "START A PROJECT"
          - Small diagonal arrow icon
          - Subtle animated background-fill interaction on hover
          ========================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-2 sm:mt-4"
      >
        <a
          href={`mailto:${email}?subject=${encodeURIComponent("Project Enquiry")}`}
          onClick={onStartProject}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          className="relative inline-flex items-center justify-between gap-4 overflow-hidden border border-white/50 px-6 py-3.5 font-mono text-xs sm:text-sm uppercase tracking-[0.2em] text-foreground transition-all duration-300 hover:border-white focus:outline-none"
          aria-label="Start a Project"
        >
          {/* Animated Background Fill curtain from left */}
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ x: "-100%" }}
            animate={{ x: btnHovered ? "0%" : "-100%" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Button Text with color transition */}
          <span
            className={`relative z-10 font-medium transition-colors duration-300 ${
              btnHovered ? "text-black" : "text-white"
            }`}
          >
            START A PROJECT
          </span>

          {/* Small Diagonal Arrow Icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`relative z-10 size-3.5 shrink-0 transition-transform duration-300 ease-out ${
              btnHovered ? "translate-x-1 -translate-y-1 text-black" : "text-white"
            }`}
            aria-hidden="true"
          >
            <path
              d="M4 12L12 4M12 4H6M12 4V10"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </motion.div>
    </div>
  );
}
