"use client";

import { motion } from "framer-motion";
import DotGridBackground from "@/components/layout/DotGridBackground";
import FormtectureContactBlock from "@/components/common/FormtectureContactBlock";

interface ContactsSectionProps {
  standalone?: boolean;
}

export default function ContactsSection({ standalone = false }: ContactsSectionProps) {
  const HeadingTag = standalone ? motion.h1 : motion.h2;

  return (
    <section
      id="project-contacts"
      className={`text-foreground relative flex flex-col overflow-hidden ${
        standalone
          ? "w-full bg-transparent"
          : "bg-background -mx-4 px-4"
      }`}
    >
      <div className="relative mx-auto flex w-full max-w-480 flex-col pt-20 pb-6 sm:pt-24 sm:pb-8 md:pt-20 md:pb-8">
        {!standalone && (
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
        )}

        <div className="relative z-10 flex flex-col gap-12 sm:gap-16 md:gap-24">
          <HeadingTag
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-display-xl text-foreground leading-[0.95] tracking-tight md:leading-[0.85]"
            aria-label={standalone ? "Say Hello - Contact page heading" : "Say Hello - Contact section heading"}
          >
            Say <br className="md:hidden" />
            Hello<span className="text-accent" aria-hidden="true">.</span>
          </HeadingTag>

          {/* Contact Content: Two-column layout */}
          <div className="w-full px-2 sm:px-4 md:px-8 lg:px-12">
            <FormtectureContactBlock
              email="7inson.5amuel@proton.me"
              phone="+91 8319471976"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
