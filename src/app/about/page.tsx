"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import StickyPageLayout from "@/components/layout/StickyPageLayout";
import ContactsSection from "@/components/common/ContactsSection";
import HeroTitleInView from "@/components/common/HeroTitleInView";
import TechStackSection from "@/components/about/TechStackSection";
import HowIWorkSection from "@/components/about/HowIWorkSection";
import { entranceVariants, motionTokens } from "@/lib/animations";
import portraitImage from "@/assets/images/regenerated_image_1795495941341.jpg";

export default function AboutPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="bg-foreground flex w-full flex-1 flex-col justify-start gap-0 px-4 focus:outline-none"
      aria-label="About page main content"
    >
      <StickyPageLayout contacts={<ContactsSection />}>
        {/* Hero Section */}
        <section className="flex min-h-screen w-full flex-col justify-center py-20 pt-44 sm:pt-48 md:py-20">
          <div className="grid w-full grid-cols-4 gap-y-10 sm:grid-cols-6 sm:gap-y-12 md:grid-cols-8 md:gap-4 lg:grid-cols-10 lg:gap-4 xl:grid-cols-12">
            <div className="col-span-4 sm:col-span-6 md:col-span-5 md:row-start-1 lg:col-span-7 xl:col-span-9">
              <HeroTitleInView
                as="h1"
                className="text-display-xl text-background relative z-10 -ml-1 leading-[0.95] tracking-tight sm:-ml-2 md:-ml-4 md:leading-[0.85]"
                ariaLabel="Hey - About page heading"
              >
                Hey<span className="text-accent" aria-hidden="true">.</span>
              </HeroTitleInView>
            </div>

            <div className="relative z-10 col-span-4 mt-20 sm:col-span-5 sm:col-start-1 sm:row-start-2 sm:mt-24 md:col-span-3 md:col-start-6 md:row-span-2 md:row-start-1 md:mt-0 lg:col-span-3 lg:col-start-8 xl:col-span-3 xl:col-start-10">
              <motion.figure
                className="relative aspect-3/4 w-full overflow-hidden"
                variants={entranceVariants(motionTokens.delay.long, motionTokens.distance.base)}
                initial="initial"
                animate="visible"
              >
                <motion.div
                  className="relative size-full cursor-pointer"
                  whileHover={{ scale: 1.08, y: -16 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <Image
                    alt="Portrait of Daniele Buser"
                    fill
                    className="scale-[1.01] object-cover"
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                    src={portraitImage}
                    priority
                  />
                </motion.div>
              </motion.figure>
            </div>

            <div className="col-span-4 sm:col-span-5 sm:col-start-1 sm:row-start-3 md:col-span-4 md:col-start-1 md:row-start-2 md:self-end lg:col-span-6 lg:col-start-1 xl:col-span-6 xl:col-start-1">
              <motion.p
                variants={entranceVariants(motionTokens.delay.longer, motionTokens.distance.base)}
                initial="initial"
                animate="visible"
                id="about-intro-paragraph"
                className="text-section text-background"
              >
                I&apos;m a 23-year-old Swiss creative developer, who crafts web and mobile products where design and code work as one. I enjoy taking the lead on projects because, honestly, someone has to.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Tech Stack & How I Work Section */}
        <section className="flex min-h-screen w-full flex-col justify-center gap-20 pt-0 pb-64">
          {/* Tech Stack */}
          <TechStackSection />

          {/* How I Work */}
          <HowIWorkSection />
        </section>
      </StickyPageLayout>
    </main>
  );
}
