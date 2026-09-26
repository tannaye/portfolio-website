/** Motion language: one place for every curve and duration. */
export const ease = {
  /** Default for reveals: fast start, long settle. */
  outExpo: [0.16, 1, 0.3, 1] as const,
  /** Symmetric, for things that move across the screen (curtains, sliders). */
  inOutQuart: [0.65, 0, 0.35, 1] as const,
  soft: [0.22, 1, 0.36, 1] as const,
};

export const duration = {
  hover: 0.25,
  reveal: 0.9,
  slow: 1.2,
};

export const spring = {
  magnetic: { stiffness: 180, damping: 14, mass: 0.2 },
  gentle: { stiffness: 120, damping: 20, mass: 0.6 },
};

export const stagger = (i: number, step = 0.08, base = 0) => base + i * step;
