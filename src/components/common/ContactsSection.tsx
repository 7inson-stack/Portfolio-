"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import BackgroundGrid from "@/components/layout/BackgroundGrid";

export default function ContactsSection() {
  return (
    <section
      id="project-contacts"
      className="bg-[#0a0a0a] text-[#f6f6f6] before:bg-[#0a0a0a] relative -mx-4 flex min-h-dvh flex-col justify-center px-4 before:absolute before:bottom-full before:left-0 before:h-0.5 before:w-full"
    >
      <div className="relative mx-auto flex w-full max-w-480 flex-1 flex-col justify-center pt-14 pb-14 sm:pt-24 sm:pb-20 md:py-20">
        <BackgroundGrid theme="dark" />
        <div className="relative z-10 flex flex-col gap-40 sm:gap-52 md:gap-64">
          <motion.h2
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-display-xl text-[#f6f6f6] leading-[0.95] tracking-tight md:leading-[0.85]"
            aria-label="Say Hello - Contact section heading"
          >
            Say <br className="md:hidden" />
            Hello<span className="text-[#ff4500]" aria-hidden="true">.</span>
          </motion.h2>

          <section
            className="text-[#f6f6f6] grid w-full grid-cols-4 items-center gap-4 sm:grid-cols-6 sm:gap-6 md:grid-cols-8 md:gap-12 lg:grid-cols-10 xl:grid-cols-12"
            aria-labelledby="contacts-heading"
          >
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
              className="text-section col-span-4 max-w-2xl leading-[1.15] font-normal sm:col-span-5 md:col-span-7 lg:col-span-5 xl:col-span-5"
            >
              If you have a project in mind, feel free to reach out - I&apos;d be glad to help bring your vision to life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: 0.45, ease: "easeOut" }}
              className="col-span-4 justify-self-start sm:col-span-6 md:col-span-8 md:col-start-1 md:justify-self-start lg:col-span-5 lg:col-start-6 lg:justify-self-end xl:col-span-6 xl:col-start-7 2xl:col-span-5 2xl:col-start-8"
            >
              <a
                href="mailto:buserdaniele@gmail.com"
                className="block w-fit max-w-full"
                aria-label="Send email to buserdaniele@gmail.com"
              >
                <h2
                  id="contacts-heading"
                  className="text-display-sm text-[#f6f6f6] leading-[0.95] font-normal tracking-tight wrap-anywhere xl:whitespace-nowrap"
                >
                  buserdaniele<wbr />@gmail.com
                </h2>
              </a>

              <nav
                className="mt-2 flex flex-wrap items-center justify-start gap-x-4 gap-y-1 md:mt-3"
                aria-label="Social and professional links"
              >
                <a
                  href="https://linkedin.com/in/daniele-buser"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body md:text-body-lg text-[#9b9b9b] hover:text-[#f6f6f6] transition-colors"
                >
                  LinkedIn<span className="sr-only"> (opens in new tab)</span>
                </a>
                <span className="text-[#9b9b9b] text-body md:text-body-lg select-none" aria-hidden="true">
                  |
                </span>
                <a
                  href="https://github.com/dbuser03"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body md:text-body-lg text-[#9b9b9b] hover:text-[#f6f6f6] transition-colors"
                >
                  GitHub<span className="sr-only"> (opens in new tab)</span>
                </a>
                <span className="text-[#9b9b9b] text-body md:text-body-lg select-none" aria-hidden="true">
                  |
                </span>
                <a
                  href="/pages/resume.html"
                  download
                  className="text-body md:text-body-lg text-[#9b9b9b] hover:text-[#f6f6f6] transition-colors"
                >
                  Resume
                </a>
              </nav>
            </motion.div>
          </section>
        </div>
      </div>
    </section>
  );
}
