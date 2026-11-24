import { Variants } from "framer-motion";

export const motionTokens = {
  duration: {
    smooth: 0.4,
    base: 0.3,
    fast: 0.2,
  },
  delay: {
    none: 0,
    short: 0.15,
    base: 0.3,
    long: 0.45,
    longer: 0.6,
  },
  distance: {
    hero: 48,
    base: 24,
    small: 12,
  },
  easing: {
    standard: [0.16, 1, 0.3, 1] as const,
    easeOut: "easeOut" as const,
  },
  stagger: {
    loose: 0.1,
    base: 0.08,
  },
};

export function entranceVariants(
  delay: number = motionTokens.delay.none,
  distance: number = motionTokens.distance.base,
  duration: number = motionTokens.duration.smooth
): Variants {
  return {
    initial: {
      opacity: 0,
      y: distance,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay,
        ease: motionTokens.easing.standard,
      },
    },
  };
}

export function listVariants(
  delay: number = motionTokens.delay.none,
  stagger: number = motionTokens.stagger.loose
): Variants {
  return {
    initial: {},
    visible: {
      transition: {
        delayChildren: delay,
        staggerChildren: stagger,
      },
    },
  };
}

export const itemVariants: Variants = {
  initial: {
    opacity: 0,
    y: motionTokens.distance.base,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.smooth,
      ease: motionTokens.easing.standard,
    },
  },
};

export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: motionTokens.duration.smooth,
      ease: motionTokens.easing.standard,
    },
  },
};
