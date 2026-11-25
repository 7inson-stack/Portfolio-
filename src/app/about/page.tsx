"use client";

import StickyPageLayout from "@/components/layout/StickyPageLayout";
import ContactsSection from "@/components/common/ContactsSection";
import FormtectureAboutHero from "@/components/about/FormtectureAboutHero";
import TechStackSection from "@/components/about/TechStackSection";
import HowIWorkSection from "@/components/about/HowIWorkSection";

export default function AboutPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="bg-foreground flex w-full flex-1 flex-col justify-start gap-0 px-4 focus:outline-none"
      aria-label="About page main content"
    >
      <StickyPageLayout contacts={<ContactsSection />}>
        {/* Formtecture-Inspired About Hero Section */}
        <FormtectureAboutHero />

        {/* Tech Stack & How I Work Section */}
        <section
          id="tech-stack-section"
          className="flex min-h-screen w-full flex-col justify-center gap-20 pt-12 pb-64"
        >
          {/* Tech Stack */}
          <TechStackSection />

          {/* How I Work */}
          <HowIWorkSection />
        </section>
      </StickyPageLayout>
    </main>
  );
}
