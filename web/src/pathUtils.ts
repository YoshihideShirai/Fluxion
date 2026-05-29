export interface PathPoint {
  x: number;
  y: number;
}

export function pointsToSvgPath(
  points: PathPoint[],
  options: { close?: boolean; smooth?: boolean } = {},
): string {
  if (points.length === 0) return "";
  if (!options.smooth || points.length < 3) {
    const head = `M ${points[0]!.x} ${points[0]!.y}`;
    return [head, ...points.slice(1).map((point) => `L ${point.x} ${point.y}`), ...(options.close ? ["Z"] : [])].join(" ");
  }

  if (options.close) {
    const segments: string[] = [`M ${points[0]!.x} ${points[0]!.y}`];
    for (let index = 0; index < points.length; index += 1) {
      const { c1, c2, next } = closedCatmullRomSegment(points, index);
      segments.push(`C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${next.x} ${next.y}`);
    }
    segments.push("Z");
    return segments.join(" ");
  }

  const segments: string[] = [`M ${points[0]!.x} ${points[0]!.y}`];
  for (let index = 0; index < points.length - 1; index += 1) {
    const { c1, c2, next } = catmullRomSegment(points, index);
    segments.push(`C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${next.x} ${next.y}`);
  }
  return segments.join(" ");
}

export function sampleSmoothPathPoints(points: PathPoint[], samplesPerSegment = 8): PathPoint[] {
  if (points.length < 3) return [...points];
  const subdivisions = Math.max(1, Math.round(samplesPerSegment));
  const samples: PathPoint[] = [{ ...points[0]! }];
  for (let index = 0; index < points.length - 1; index += 1) {
    const { current, c1, c2, next } = catmullRomSegment(points, index);
    for (let step = 1; step <= subdivisions; step += 1) {
      samples.push(cubicPoint(current, c1, c2, next, step / subdivisions));
    }
  }
  return samples;
}

export function curvesToClosedAreaPath(upperPoints: PathPoint[], lowerPoints: PathPoint[]): string {
  if (upperPoints.length === 0 || lowerPoints.length === 0) return "";
  const commands = openCurveCommands(upperPoints, true);
  const lowerStart = lowerPoints[0]!;
  commands.push(`L ${lowerStart.x} ${lowerStart.y}`);
  commands.push(...openCurveCommands(lowerPoints, false));
  commands.push("Z");
  return commands.join(" ");
}

function openCurveCommands(points: PathPoint[], includeMove: boolean): string[] {
  if (points.length === 0) return [];
  if (points.length < 3) {
    return [
      ...(includeMove ? [`M ${points[0]!.x} ${points[0]!.y}`] : []),
      ...points.slice(includeMove ? 1 : 0).map((point) => `L ${point.x} ${point.y}`),
    ];
  }

  const commands = includeMove ? [`M ${points[0]!.x} ${points[0]!.y}`] : [];
  for (let index = 0; index < points.length - 1; index += 1) {
    const { c1, c2, next } = catmullRomSegment(points, index);
    commands.push(`C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${next.x} ${next.y}`);
  }
  return commands;
}

function closedCatmullRomSegment(
  points: PathPoint[],
  index: number,
): { c1: PathPoint; c2: PathPoint; next: PathPoint } {
  const count = points.length;
  const previous = points[(index - 1 + count) % count]!;
  const current = points[index]!;
  const next = points[(index + 1) % count]!;
  const afterNext = points[(index + 2) % count]!;
  return {
    c1: {
      x: current.x + (next.x - previous.x) / 6,
      y: current.y + (next.y - previous.y) / 6,
    },
    c2: {
      x: next.x - (afterNext.x - current.x) / 6,
      y: next.y - (afterNext.y - current.y) / 6,
    },
    next,
  };
}

function catmullRomSegment(
  points: PathPoint[],
  index: number,
): { current: PathPoint; c1: PathPoint; c2: PathPoint; next: PathPoint } {
  const previous = points[Math.max(0, index - 1)]!;
  const current = points[index]!;
  const next = points[index + 1]!;
  const afterNext = points[Math.min(points.length - 1, index + 2)]!;
  const c1 = {
    x: current.x + (next.x - previous.x) / 6,
    y: current.y + (next.y - previous.y) / 6,
  };
  const c2 = {
    x: next.x - (afterNext.x - current.x) / 6,
    y: next.y - (afterNext.y - current.y) / 6,
  };
  return { current, c1, c2, next };
}

function cubicPoint(p0: PathPoint, c1: PathPoint, c2: PathPoint, p1: PathPoint, t: number): PathPoint {
  const mt = 1 - t;
  return {
    x: mt ** 3 * p0.x + 3 * mt ** 2 * t * c1.x + 3 * mt * t ** 2 * c2.x + t ** 3 * p1.x,
    y: mt ** 3 * p0.y + 3 * mt ** 2 * t * c1.y + 3 * mt * t ** 2 * c2.y + t ** 3 * p1.y,
  };
}

export function arcToSvgPath(
  radius: number,
  startAngle: number,
  endAngle: number,
  options: { close?: boolean } = {},
): string {
  if (!Number.isFinite(radius) || radius <= 0) return "";
  if (!Number.isFinite(startAngle) || !Number.isFinite(endAngle)) return "";

  const totalAngle = endAngle - startAngle;
  const segmentCount = Math.max(1, Math.ceil(Math.abs(totalAngle) / (Math.PI / 2)));
  const delta = totalAngle / segmentCount;
  const start = {
    x: radius * Math.cos(startAngle),
    y: radius * Math.sin(startAngle),
  };
  const segments = [`M ${start.x} ${start.y}`];

  for (let index = 0; index < segmentCount; index += 1) {
    const a0 = startAngle + delta * index;
    const a1 = a0 + delta;
    const p0 = { x: radius * Math.cos(a0), y: radius * Math.sin(a0) };
    const p1 = { x: radius * Math.cos(a1), y: radius * Math.sin(a1) };
    const tangentScale = (4 / 3) * Math.tan(delta / 4);
    const c1 = {
      x: p0.x + tangentScale * -radius * Math.sin(a0),
      y: p0.y + tangentScale * radius * Math.cos(a0),
    };
    const c2 = {
      x: p1.x - tangentScale * -radius * Math.sin(a1),
      y: p1.y - tangentScale * radius * Math.cos(a1),
    };
    segments.push(`C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p1.x} ${p1.y}`);
  }

  if (options.close) segments.push("Z");
  return segments.join(" ");
}
