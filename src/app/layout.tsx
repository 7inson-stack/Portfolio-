import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/layout/CustomCursor";
import SmoothScroll from "@/components/layout/SmoothScroll";

export const metadata: Metadata = {
  title: "Daniele Buser | Creative Developer",
  description:
    "Explore Daniele Buser's creative development projects: interactive 3D web experiences, WebGL experiments, and high-performance front-end engineering.",
  applicationName: "Daniele Buser Portfolio",
  authors: [{ name: "Daniele Buser", url: "https://www.danielebuser.com" }],
  keywords: [
    "Daniele Buser",
    "Creative Developer",
    "Front-end Developer",
    "Creative Development Portfolio",
    "Next.js Developer",
    "WebGL",
    "Three.js",
    "Framer Motion",
    "GSAP",
    "Interactive Web Design",
    "TypeScript",
    "React",
    "Tailwind CSS",
    "Web Performance",
    "UI Animation",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "Daniele Buser | Creative Developer",
    description:
      "Explore Daniele Buser's creative development projects: interactive 3D web experiences, WebGL experiments, and high-performance front-end engineering.",
    url: "https://www.danielebuser.com",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daniele Buser | Creative Developer",
    description:
      "Explore Daniele Buser's creative development projects: interactive 3D web experiences, WebGL experiments, and high-performance front-end engineering.",
    images: ["/images/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="has-custom-cursor lenis">
      <body className="antialiased bg-[#0a0a0a] text-[#f6f6f6] min-h-dvh flex flex-col">
        <a
          href="#main-content"
          className="focus:bg-[#ff4500] focus:text-[#f6f6f6] sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-sm focus:px-4 focus:py-2 focus:outline-none"
        >
          Skip to content
        </a>
        <CustomCursor />
        <Header />
        <SmoothScroll>
          <div className="flex min-h-dvh flex-col">{children}</div>
        </SmoothScroll>
        <Footer />
      </body>
    </html>
  );
}
