"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

interface NavItemData {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItemData[] = [
  { href: "/", label: "PROJECTS" },
  { href: "/about", label: "ABOUT" },
  { href: "/contacts", label: "CONTACTS" },
];

export default function Header() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  // Animation constants extracted from Daniele Buser's original bundle
  // duration.smooth = 0.4s, distance.base = 24px, ease = "easeOut"
  // delays: Brand Name = 0s, Subtitle = 0.1s
  // nav items: 0.15s + i * 0.05s (PROJECTS: 0.15s, ABOUT: 0.20s, CONTACTS: 0.25s)
  const getVariants = (delay: number) => ({
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 24,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.4,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0, 0, 0.2, 1] as const, // standard easeOut
      },
    },
  });

  const handleSmoothScrollTop = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="pointer-events-none fixed top-0 left-1/2 z-50 w-full max-w-480 -translate-x-1/2 p-4 mix-blend-difference">
      <div className="flex w-full items-start justify-between sm:grid sm:grid-cols-6 sm:gap-4 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
        {/* BRAND / LOGO on Upper-Left */}
        <div className="pointer-events-auto flex shrink-0 items-start sm:col-span-2 sm:col-start-1">
          <Link
            className="pointer-events-auto flex w-fit flex-col items-start gap-0.5 select-none group"
            href="/"
            onClick={(e) => handleSmoothScrollTop(e, "/")}
          >
            <motion.span
              variants={getVariants(0)}
              initial="initial"
              animate="visible"
              className="font-akzidenz text-type-header text-foreground leading-[1.15] font-bold tracking-tight"
            >
              JINSON SAMUEL
            </motion.span>
            <motion.p
              variants={getVariants(0.1)}
              initial="initial"
              animate="visible"
              className="text-type-body-2 font-normal leading-[1.35] text-neutral"
            >
              Full Stack Developer
            </motion.p>
          </Link>
        </div>

        {/* NAVIGATION LINKS on Upper-Right */}
        <div className="pointer-events-auto flex flex-1 justify-end sm:col-span-3 sm:col-start-4 sm:block md:col-span-3 md:col-start-6 lg:col-span-3 lg:col-start-8 xl:col-span-3 xl:col-start-10 2xl:col-span-2 2xl:col-start-11">
          <nav aria-label="Main navigation" className="w-full max-w-64 select-none sm:max-w-none">
            <ul className="flex w-full items-center justify-end gap-4 sm:justify-between sm:gap-6">
              {NAV_ITEMS.map((item, index) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/" || pathname.startsWith("/projects")
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const delay = 0.15 + index * 0.05;

                return (
                  <li key={item.href}>
                    <motion.div
                      variants={getVariants(delay)}
                      initial="initial"
                      animate="visible"
                    >
                      <Link
                        className={`text-type-header -my-2 inline-flex items-center py-2 font-bold leading-[1.15] tracking-tight uppercase transition-colors duration-150 ${
                          isActive ? "text-foreground" : "text-neutral hover:text-foreground"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                        href={item.href}
                        onClick={(e) => handleSmoothScrollTop(e, item.href)}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
