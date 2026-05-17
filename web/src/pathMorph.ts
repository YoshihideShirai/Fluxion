export interface Point {
  x: number;
  y: number;
}

interface Cursor {
  current: Point;
  subpathStart: Point;
  points: Point[];
  closed: boolean;
}

const RESAMPLED_POINT_COUNT = 32;
const LINE_SAMPLE_STEPS = 8;
const QUADRATIC_SAMPLE_STEPS = 12;
const CUBIC_SAMPLE_STEPS = 16;

export function interpolateResampledPath(from: string, to: string, t: number): string | undefined {
  const fromSample = samplePath(from);
  const toSample = samplePath(to);
  if (!fromSample || !toSample) return undefined;

  const fromPoints = resamplePoints(fromSample.points, RESAMPLED_POINT_COUNT);
  const toPoints = resamplePoints(toSample.points, RESAMPLED_POINT_COUNT);
  if (!fromPoints || !toPoints) return undefined;

  const points = fromPoints.map((point, index): Point => {
    const toPoint = toPoints[index]!;
    return {
      x: point.x + (toPoint.x - point.x) * t,
      y: point.y + (toPoint.y - point.y) * t,
    };
  });

  return formatPolylinePath(points, fromSample.closed && toSample.closed);
}

function samplePath(path: string): { points: Point[]; closed: boolean } | undefined {
  const tokens = path.match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/giu);
  if (!tokens || tokens.join("") !== path.replace(/[\s,]+/gu, "")) return undefined;

  const cursor: Cursor = {
    current: { x: 0, y: 0 },
    subpathStart: { x: 0, y: 0 },
    points: [],
    closed: false,
  };

  let index = 0;
  let isFirstCommand = true;
  while (index < tokens.length) {
    const command = tokens[index++]!;
    if (!/^[mlcqz]$/iu.test(command)) return undefined;
    if (isFirstCommand && !/^m$/iu.test(command)) return undefined;
    isFirstCommand = false;

    const values: number[] = [];
    while (index < tokens.length && !/^[a-z]$/iu.test(tokens[index]!)) {
      const value = Number(tokens[index++]!);
      if (!Number.isFinite(value)) return undefined;
      values.push(value);
    }

    if (!applySampleCommand(cursor, command, values)) return undefined;
  }

  return cursor.points.length >= 2 ? { points: cursor.points, closed: cursor.closed } : undefined;
}

function applySampleCommand(cursor: Cursor, command: string, values: number[]): boolean {
  const normalized = command.toLowerCase();
  const relative = command === command.toLowerCase();

  if (normalized === "z") {
    if (values.length !== 0) return false;
    if (samePoint(cursor.current, cursor.subpathStart)) return true;
    appendLine(cursor, cursor.subpathStart, LINE_SAMPLE_STEPS);
    cursor.current = cursor.subpathStart;
    cursor.closed = true;
    return true;
  }

  const arity = normalized === "c" ? 6 : normalized === "q" ? 4 : 2;
  if (values.length === 0 || values.length % arity !== 0) return false;

  for (let offset = 0; offset < values.length; offset += arity) {
    if (normalized === "m") {
      const target = resolvePoint(cursor.current, values[offset]!, values[offset + 1]!, relative);
      if (offset === 0) {
        cursor.current = target;
        cursor.subpathStart = target;
        appendMove(cursor, target);
      } else {
        appendLine(cursor, target, LINE_SAMPLE_STEPS);
        cursor.current = target;
      }
      continue;
    }

    if (normalized === "l") {
      const target = resolvePoint(cursor.current, values[offset]!, values[offset + 1]!, relative);
      appendLine(cursor, target, LINE_SAMPLE_STEPS);
      cursor.current = target;
      continue;
    }

    if (normalized === "q") {
      const control = resolvePoint(cursor.current, values[offset]!, values[offset + 1]!, relative);
      const target = resolvePoint(cursor.current, values[offset + 2]!, values[offset + 3]!, relative);
      appendQuadratic(cursor, control, target, QUADRATIC_SAMPLE_STEPS);
      cursor.current = target;
      continue;
    }

    if (normalized === "c") {
      const control1 = resolvePoint(cursor.current, values[offset]!, values[offset + 1]!, relative);
      const control2 = resolvePoint(cursor.current, values[offset + 2]!, values[offset + 3]!, relative);
      const target = resolvePoint(cursor.current, values[offset + 4]!, values[offset + 5]!, relative);
      appendCubic(cursor, control1, control2, target, CUBIC_SAMPLE_STEPS);
      cursor.current = target;
      continue;
    }
  }

  return true;
}

function appendMove(cursor: Cursor, point: Point): void {
  if (cursor.points.length === 0) cursor.points.push(point);
}

function appendLine(cursor: Cursor, target: Point, steps: number): void {
  const start = cursor.current;
  for (let step = 1; step <= steps; step += 1) {
    const t = step / steps;
    cursor.points.push({
      x: start.x + (target.x - start.x) * t,
      y: start.y + (target.y - start.y) * t,
    });
  }
}

function appendQuadratic(cursor: Cursor, control: Point, target: Point, steps: number): void {
  const start = cursor.current;
  for (let step = 1; step <= steps; step += 1) {
    const t = step / steps;
    const mt = 1 - t;
    cursor.points.push({
      x: mt * mt * start.x + 2 * mt * t * control.x + t * t * target.x,
      y: mt * mt * start.y + 2 * mt * t * control.y + t * t * target.y,
    });
  }
}

function appendCubic(cursor: Cursor, control1: Point, control2: Point, target: Point, steps: number): void {
  const start = cursor.current;
  for (let step = 1; step <= steps; step += 1) {
    const t = step / steps;
    const mt = 1 - t;
    cursor.points.push({
      x: mt * mt * mt * start.x + 3 * mt * mt * t * control1.x + 3 * mt * t * t * control2.x + t * t * t * target.x,
      y: mt * mt * mt * start.y + 3 * mt * mt * t * control1.y + 3 * mt * t * t * control2.y + t * t * t * target.y,
    });
  }
}

function resamplePoints(points: Point[], count: number): Point[] | undefined {
  if (points.length < 2 || count < 2) return undefined;

  const distances = [0];
  for (let index = 1; index < points.length; index += 1) {
    distances.push(distances[index - 1]! + distance(points[index - 1]!, points[index]!));
  }

  const totalLength = distances[distances.length - 1]!;
  if (totalLength <= 0) return undefined;

  const resampled: Point[] = [];
  let segmentIndex = 1;
  for (let sampleIndex = 0; sampleIndex < count; sampleIndex += 1) {
    const targetDistance = (totalLength * sampleIndex) / (count - 1);
    while (segmentIndex < distances.length - 1 && distances[segmentIndex]! < targetDistance) {
      segmentIndex += 1;
    }

    const startDistance = distances[segmentIndex - 1]!;
    const endDistance = distances[segmentIndex]!;
    const localT = endDistance === startDistance ? 0 : (targetDistance - startDistance) / (endDistance - startDistance);
    const start = points[segmentIndex - 1]!;
    const end = points[segmentIndex]!;
    resampled.push({
      x: start.x + (end.x - start.x) * localT,
      y: start.y + (end.y - start.y) * localT,
    });
  }

  return resampled;
}

function formatPolylinePath(points: Point[], closed: boolean): string {
  const [first, ...rest] = points;
  if (!first) return "";
  const commands = [`M ${formatNumber(first.x)} ${formatNumber(first.y)}`];
  commands.push(...rest.map((point) => `L ${formatNumber(point.x)} ${formatNumber(point.y)}`));
  if (closed) commands.push("Z");
  return commands.join(" ");
}

function resolvePoint(current: Point, x: number, y: number, relative: boolean): Point {
  return relative ? { x: current.x + x, y: current.y + y } : { x, y };
}

function distance(from: Point, to: Point): number {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

function samePoint(from: Point, to: Point): boolean {
  return from.x === to.x && from.y === to.y;
}

function formatNumber(value: number): string {
  return Number(value.toFixed(4)).toString();
}
