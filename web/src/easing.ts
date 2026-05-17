import type { EasingName } from "./types.js";

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function ease(name: EasingName, t: number): number {
  const x = clamp01(t);
  if (name === "linear") return x;
  if (name === "smooth" || name === "easeInOut") return x * x * (3 - 2 * x);
  if (name === "easeIn") return x * x;
  if (name === "easeOut") return 1 - (1 - x) * (1 - x);
  return x;
}

export function interpolate(from: unknown, to: unknown, t: number): unknown {
  if (typeof from === "number" && typeof to === "number") {
    return from + (to - from) * t;
  }
  return t < 1 ? from : to;
}
