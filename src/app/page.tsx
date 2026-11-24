"use client";

import { motion } from "framer-motion";
import StickyPageLayout from "@/components/layout/StickyPageLayout";
import ProjectCard from "@/components/common/ProjectCard";
import ContactsSection from "@/components/common/ContactsSection";
import HeroTitleInView from "@/components/common/HeroTitleInView";
import { entranceVariants, listVariants, motionTokens } from "@/lib/animations";

export default function HomePage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="bg-foreground flex w-full flex-1 flex-col px-4 focus:outline-none"
      aria-label="Projects page main content"
    >
      <StickyPageLayout contacts={<ContactsSection />}>
        <section className="flex min-h-[max(65vh,24rem)] w-full flex-col justify-center pt-16 sm:pt-20 md:pt-0">
          <HeroTitleInView
            as="h1"
            className="text-display-xl text-background relative z-10 flex w-full flex-col leading-[0.95] tracking-tight md:flex-row md:items-baseline md:justify-between md:leading-[0.85]"
            ariaLabel="Projects 26"
          >
            <span className="-ml-1 inline-block text-left sm:-ml-2 md:-ml-3.5">
              Projects
            </span>
            <span className="-ml-1 inline-block text-left sm:-ml-2 md:-mr-2 md:ml-0 md:text-right">
              <span className="text-accent">&apos;</span>26
            </span>
          </HeroTitleInView>
        </section>

        <section
          className="relative z-10 flex w-full flex-col pb-64"
          aria-labelledby="projects-list-heading"
        >
          <motion.h2
            className="text-caption md:text-body uppercase text-neutral-dark"
            id="projects-list-heading"
            variants={entranceVariants(motionTokens.delay.long, motionTokens.distance.base)}
            initial="initial"
            animate="visible"
          >
            SELECTED WORKS
          </motion.h2>

          <motion.div
            className="mt-3 grid w-full grid-cols-12 gap-4"
            variants={listVariants(motionTokens.delay.longer, motionTokens.stagger.loose)}
            initial="initial"
            animate="visible"
          >
            <ProjectCard
              id="leonardo-berselli-portfolio"
              title="Leonardo Berselli's Portfolio"
              href="/projects/leonardo-berselli-portfolio"
              imageSrc="/projects/leonardo-berselli-portfolio/leonardo-berselli-portfolio.webp"
              videoSrc="/projects/leonardo-berselli-portfolio/leonardo-berselli-showcase.mp4"
              tags={["Next.js", "Tailwind", "Motion", "WebGL"]}
            />
            <ProjectCard
              id="ignition-finance"
              title="Ignition Finance"
              href="/projects/ignition-finance"
              imageSrc="/projects/ignition-finance/ignition-finance.webp"
              videoSrc="/projects/ignition-finance/ignition-finance-showcase.mp4"
              tags={["UI/UX DESIGN", "Kotlin", "Jetpack Compose", "Firebase"]}
            />
          </motion.div>
        </section>
      </StickyPageLayout>
    </main>
  );
}
