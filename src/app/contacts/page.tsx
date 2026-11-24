"use client";

import { motion } from "framer-motion";
import BackgroundGrid from "@/components/layout/BackgroundGrid";
import HeroTitleInView from "@/components/common/HeroTitleInView";
import { entranceVariants, motionTokens } from "@/lib/animations";

export default function ContactsPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative z-10 flex h-dvh max-h-dvh w-full flex-1 flex-col justify-start gap-0 overflow-hidden px-4 focus:outline-none bg-background"
    >
      <div className="relative mx-auto flex w-full max-w-480 flex-1 flex-col justify-center pt-14 pb-14 sm:pt-24 sm:pb-20 md:py-20">
        <BackgroundGrid theme="dark" />

        <div className="relative z-10 flex flex-col gap-40 sm:gap-52 md:gap-64">
          <HeroTitleInView
            as="h1"
            className="text-display-xl text-foreground leading-[0.95] tracking-tight md:leading-[0.85]"
            ariaLabel="Say Hello - Contact page heading"
          >
            Say <br className="md:hidden" />
            Hello<span className="text-accent" aria-hidden="true">.</span>
          </HeroTitleInView>

          <section
            className="text-foreground grid w-full grid-cols-4 items-center gap-4 sm:grid-cols-6 sm:gap-6 md:grid-cols-8 md:gap-12 lg:grid-cols-10 xl:grid-cols-12"
            aria-labelledby="contacts-heading"
          >
            <motion.p
              className="text-section col-span-4 max-w-2xl leading-[1.15] font-normal sm:col-span-5 md:col-span-7 lg:col-span-5 xl:col-span-5"
              variants={entranceVariants(motionTokens.delay.long, motionTokens.distance.base)}
              initial="initial"
              animate="visible"
            >
              If you have a project in mind, feel free to reach out - I&apos;d be glad to help bring your vision to life.
            </motion.p>

            <motion.div
              className="col-span-4 justify-self-start sm:col-span-6 md:col-span-8 md:col-start-1 md:justify-self-start lg:col-span-5 lg:col-start-6 lg:justify-self-end xl:col-span-6 xl:col-start-7 2xl:col-span-5 2xl:col-start-8"
              variants={entranceVariants(motionTokens.delay.longer, motionTokens.distance.base)}
              initial="initial"
              animate="visible"
            >
              <a
                href="mailto:buserdaniele@gmail.com"
                className="block w-fit max-w-full"
                aria-label="Send email to buserdaniele@gmail.com"
              >
                <h2
                  id="contacts-heading"
                  className="text-display-sm text-foreground leading-[0.95] font-normal tracking-tight wrap-anywhere xl:whitespace-nowrap"
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
          </section>
        </div>
      </div>
    </main>
  );
}
