"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const isProjects = pathname === "/" || pathname.startsWith("/projects");
  const isAbout = pathname === "/about";
  const isContacts = pathname === "/contacts";

  return (
    <header className="pointer-events-none fixed top-0 left-1/2 z-30 w-full max-w-480 -translate-x-1/2 p-4 mix-blend-difference">
      <div className="flex w-full items-start justify-between sm:grid sm:grid-cols-6 sm:gap-4 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
        <div className="pointer-events-auto flex shrink-0 items-start sm:col-span-2 sm:col-start-1">
          <Link
            className="pointer-events-auto flex w-fit flex-col items-start select-none"
            href="/"
          >
            <span className="text-body md:text-body-lg text-foreground leading-tight font-bold">
              JINSON SAMUEL
            </span>
            <p className="text-caption md:text-body text-neutral">
              Full Stack Developer
            </p>
          </Link>
        </div>
        <div className="pointer-events-auto flex flex-1 justify-end sm:col-span-3 sm:col-start-4 sm:block md:col-span-3 md:col-start-6 lg:col-span-3 lg:col-start-8 xl:col-span-3 xl:col-start-10 2xl:col-span-2 2xl:col-start-11">
          <nav aria-label="Main navigation" className="w-full max-w-50 select-none sm:max-w-none">
            <ul className="flex w-full justify-between">
              <li>
                <Link
                  className={`text-caption md:text-body -my-2 inline-flex items-center py-2 uppercase ${
                    isProjects ? "font-bold text-foreground" : "font-normal text-neutral"
                  }`}
                  aria-current={isProjects ? "page" : undefined}
                  href="/"
                >
                  PROJECTS
                </Link>
              </li>
              <li>
                <Link
                  className={`text-caption md:text-body -my-2 inline-flex items-center py-2 uppercase ${
                    isAbout ? "font-bold text-foreground" : "font-normal text-neutral"
                  }`}
                  aria-current={isAbout ? "page" : undefined}
                  href="/about"
                >
                  ABOUT
                </Link>
              </li>
              <li>
                <Link
                  className={`text-caption md:text-body -my-2 inline-flex items-center py-2 uppercase ${
                    isContacts ? "font-bold text-foreground" : "font-normal text-neutral"
                  }`}
                  aria-current={isContacts ? "page" : undefined}
                  href="/contacts"
                >
                  CONTACTS
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
