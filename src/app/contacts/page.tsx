"use client";

import { motion } from "framer-motion";
import DotGridBackground from "@/components/layout/DotGridBackground";
import HeroTitleInView from "@/components/common/HeroTitleInView";
import FormtectureContactBlock from "@/components/common/FormtectureContactBlock";

export default function ContactsPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative z-10 flex min-h-dvh w-full flex-1 flex-col justify-start gap-0 overflow-y-auto px-4 focus:outline-none bg-background"
    >
      <div className="relative mx-auto flex w-full max-w-480 flex-1 flex-col justify-center pt-20 pb-20 sm:pt-28 sm:pb-24 md:py-24">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          <DotGridBackground
            dotColor="rgba(255, 255, 255, 0.22)"
            dotSize={2}
            dotSpacing={26}
            orbitSpeed={1.5}
            impactRadius={120}
            scaleOnHover={2.0}
            enableRevolve={true}
          />
        </div>

        <div className="relative z-10 flex flex-col gap-28 sm:gap-40 md:gap-[280px]">
          <HeroTitleInView
            as="h1"
            className="text-display-xl text-foreground leading-[0.95] tracking-tight md:leading-[0.85]"
            ariaLabel="Say Hello - Contact page heading"
          >
            Say <br className="md:hidden" />
            Hello<span className="text-accent" aria-hidden="true">.</span>
          </HeroTitleInView>

          {/* Contact Content: Email & Phone moved up to left, Social Links on right */}
          <div className="grid w-full grid-cols-1 items-start gap-10 md:grid-cols-12 md:gap-8 lg:gap-12">
            {/* Left: Email, Phone, Start A Project */}
            <div className="md:col-span-8 lg:col-span-8">
              <FormtectureContactBlock
                email="7inson.5amuel@proton.me"
                phone="+91 8319471976"
              />
            </div>

            {/* Right: Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              className="md:col-span-4 lg:col-span-4 md:justify-self-end pt-2"
            >
              <nav
                className="flex flex-wrap items-center justify-start md:justify-end gap-x-4 gap-y-1"
                aria-label="Social and professional links"
              >
                <a
                  href="https://linkedin.com/in/daniele-buser"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body md:text-body-lg text-neutral hover:text-foreground transition-colors"
                >
                  LinkedIn<span className="sr-only"> (opens in new tab)</span>
                </a>
                <span className="text-neutral text-body md:text-body-lg select-none" aria-hidden="true">
                  |
                </span>
                <a
                  href="https://github.com/dbuser03"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body md:text-body-lg text-neutral hover:text-foreground transition-colors"
                >
                  GitHub<span className="sr-only"> (opens in new tab)</span>
                </a>
                <span className="text-neutral text-body md:text-body-lg select-none" aria-hidden="true">
                  |
                </span>
                <a
                  href="/pages/resume.html"
                  download
                  className="text-body md:text-body-lg text-neutral hover:text-foreground transition-colors"
                >
                  Resume
                </a>
              </nav>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
