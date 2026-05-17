import { interpolateResampledPath } from "./pathMorph.js";
import type { EasingName } from "./types.js";

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface PathSegment {
  command: string;
  values: number[];
}

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
  const x = clamp01(t);

  if (typeof from === "number" && typeof to === "number") {
    return interpolateNumber(from, to, x);
  }

  if (typeof from === "string" && typeof to === "string") {
    const color = interpolateColor(from, to, x);
    if (color !== undefined) return color;

    const path = interpolatePath(from, to, x);
    if (path !== undefined) return path;
  }

  if (isNumberArray(from) && isNumberArray(to) && from.length === to.length) {
    return from.map((value, index) => interpolateNumber(value, to[index]!, x));
  }

  return stepInterpolate(from, to, x);
}

function interpolateNumber(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function stepInterpolate(from: unknown, to: unknown, t: number): unknown {
  return t < 1 ? from : to;
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
}

function interpolateColor(from: string, to: string, t: number): string | undefined {
  const fromColor = parseColor(from);
  const toColor = parseColor(to);
  if (!fromColor || !toColor) return undefined;

  const color: RgbaColor = {
    r: Math.round(interpolateNumber(fromColor.r, toColor.r, t)),
    g: Math.round(interpolateNumber(fromColor.g, toColor.g, t)),
    b: Math.round(interpolateNumber(fromColor.b, toColor.b, t)),
    a: interpolateNumber(fromColor.a, toColor.a, t),
  };

  if (color.a >= 1) return `rgb(${color.r}, ${color.g}, ${color.b})`;
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${formatNumber(color.a)})`;
}

function parseColor(value: string): RgbaColor | undefined {
  const color = value.trim();
  return parseHexColor(color) ?? parseRgbColor(color);
}

function parseHexColor(color: string): RgbaColor | undefined {
  const match = /^#([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/iu.exec(color);
  if (!match) return undefined;

  const hex = match[1]!;
  const channels =
    hex.length <= 4
      ? [...hex].map((digit) => Number.parseInt(`${digit}${digit}`, 16))
      : (hex.match(/[\da-f]{2}/giu) ?? []).map((pair) => Number.parseInt(pair, 16));

  const [r, g, b, alpha] = channels;
  if (r === undefined || g === undefined || b === undefined) return undefined;

  return {
    r,
    g,
    b,
    a: alpha === undefined ? 1 : alpha / 255,
  };
}

function parseRgbColor(color: string): RgbaColor | undefined {
  const match = /^rgba?\((.*)\)$/iu.exec(color);
  if (!match) return undefined;

  const components = match[1]!
    .trim()
    .replace(/\s*\/\s*/u, ",")
    .split(/[\s,]+/u)
    .filter(Boolean);
  if (components.length !== 3 && components.length !== 4) return undefined;

  const r = parseRgbChannel(components[0]!);
  const g = parseRgbChannel(components[1]!);
  const b = parseRgbChannel(components[2]!);
  const a = components[3] === undefined ? 1 : parseAlphaChannel(components[3]);
  if (r === undefined || g === undefined || b === undefined || a === undefined) return undefined;

  return { r, g, b, a };
}

function parseRgbChannel(component: string): number | undefined {
  if (component.endsWith("%")) {
    const percentage = Number.parseFloat(component);
    if (!Number.isFinite(percentage)) return undefined;
    return clamp(Math.round((percentage / 100) * 255), 0, 255);
  }

  const value = Number.parseFloat(component);
  if (!Number.isFinite(value)) return undefined;
  return clamp(Math.round(value), 0, 255);
}

function parseAlphaChannel(component: string): number | undefined {
  if (component.endsWith("%")) {
    const percentage = Number.parseFloat(component);
    if (!Number.isFinite(percentage)) return undefined;
    return clamp(percentage / 100, 0, 1);
  }

  const value = Number.parseFloat(component);
  if (!Number.isFinite(value)) return undefined;
  return clamp(value, 0, 1);
}

function interpolatePath(from: string, to: string, t: number): string | undefined {
  const fromPath = parsePath(from);
  const toPath = parsePath(to);
  if (!fromPath || !toPath || fromPath.length !== toPath.length) return interpolateResampledPath(from, to, t);

  const segments = fromPath.map((fromSegment, index): PathSegment | undefined => {
    const toSegment = toPath[index]!;
    if (fromSegment.command !== toSegment.command || fromSegment.values.length !== toSegment.values.length) return undefined;

    return {
      command: fromSegment.command,
      values: fromSegment.values.map((value, valueIndex) => interpolateNumber(value, toSegment.values[valueIndex]!, t)),
    };
  });

  if (segments.some((segment) => segment === undefined)) return interpolateResampledPath(from, to, t);
  return (segments as PathSegment[])
    .map((segment) => [segment.command, ...segment.values.map(formatNumber)].join(" "))
    .join(" ");
}

function parsePath(path: string): PathSegment[] | undefined {
  const tokens = path.match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/giu);
  if (!tokens || tokens.join("") !== path.replace(/[\s,]+/gu, "")) return undefined;

  const segments: PathSegment[] = [];
  let index = 0;
  while (index < tokens.length) {
    const command = tokens[index++]!;
    if (!isPathCommand(command)) return undefined;

    const values: number[] = [];
    while (index < tokens.length && !/^[a-z]$/iu.test(tokens[index]!)) {
      const value = Number(tokens[index++]!);
      if (!Number.isFinite(value)) return undefined;
      values.push(value);
    }

    if (!hasValidPathCommandArity(command, values.length)) return undefined;
    segments.push({ command, values });
  }

  return segments.length > 0 && /^m$/iu.test(segments[0]!.command) ? segments : undefined;
}

function isPathCommand(command: string): boolean {
  return /^[achlmqstvz]$/iu.test(command);
}

function hasValidPathCommandArity(command: string, valueCount: number): boolean {
  const arity = pathCommandArity(command);
  return arity === 0 ? valueCount === 0 : valueCount > 0 && valueCount % arity === 0;
}

function pathCommandArity(command: string): number {
  const normalized = command.toLowerCase();
  if (normalized === "h" || normalized === "v") return 1;
  if (normalized === "m" || normalized === "l" || normalized === "t") return 2;
  if (normalized === "s" || normalized === "q") return 4;
  if (normalized === "c") return 6;
  if (normalized === "a") return 7;
  return 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function formatNumber(value: number): string {
  return Number(value.toFixed(4)).toString();
}
