import type { Camera, SceneNode, Style, Transform } from "../types.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const XHTML_NS = "http://www.w3.org/1999/xhtml";

type MathRendererName = "katex" | "mathjax";
const MAX_BASELINE_OFFSET_EM = 0.45;
const MANIM_TEXT_FONT_FAMILY = "Inter, DejaVu Sans, Arial, sans-serif";
const MANIM_BACKGROUND_COLOR = "#000000";

const DEFAULT_CAMERA: Camera = { x: 0, y: 0, scale: 1, rotation: 0, target: { x: 0, y: 0 }, padding: 0, mode: "center" };

interface KatexGlobal {
  render: (latex: string, element: HTMLElement, options?: { throwOnError?: boolean; displayMode?: boolean }) => void;
}

interface MathJaxGlobal {
  tex2chtml?: (latex: string, options?: { display?: boolean }) => Node;
  tex2svg?: (latex: string, options?: { display?: boolean }) => Node;
  typesetPromise?: (elements?: HTMLElement[]) => Promise<unknown>;
}

export function buildCameraTransform(
  camera: Camera,
  width = 1280,
  height = 720,
): string {
  const centerX = width / 2;
  const centerY = height / 2;
  const targetX = camera.target?.x ?? 0;
  const targetY = camera.target?.y ?? 0;
  const padding = camera.padding ?? 0;
  const mode = camera.mode ?? "center";
  const fitScale = mode === "frame-fit" ? Math.max(0.0001, camera.scale * ((Math.min(width, height) - padding * 2) / Math.min(width, height))) : camera.scale;
  const focusX = mode === "center" ? 0 : targetX;
  const focusY = mode === "center" ? 0 : targetY;
  return [
    `translate(${centerX + camera.x} ${centerY + camera.y})`,
    `rotate(${camera.rotation})`,
    `scale(${fitScale})`,
    `translate(${-focusX} ${-focusY})`,
  ].join(" ");
}

export class SvgRenderer {
  private readonly svg: SVGSVGElement;
  private readonly width: number;
  private readonly height: number;
  private readonly nodeById = new Map<string, SceneNode>();
  private readonly baselineCache = new Map<string, number>();
  private currentDefs: SVGDefsElement | null = null;
  private gradientIndex = 0;

  constructor(container: Element, width = 1280, height = 720) {
    this.width = width;
    this.height = height;
    this.svg = document.createElementNS(SVG_NS, "svg");
    this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    this.svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", "100%");
    this.svg.style.display = "block";
    this.svg.style.background = MANIM_BACKGROUND_COLOR;
    container.replaceChildren(this.svg);
  }

  render(nodes: SceneNode[], camera: Camera = DEFAULT_CAMERA): void {
    this.nodeById.clear();
    this.gradientIndex = 0;
    this.currentDefs = document.createElementNS(SVG_NS, "defs");
    for (const node of nodes) this.indexNode(node);
    const root = document.createElementNS(SVG_NS, "g");
    this.applyCameraTransform(root, camera);
    root.replaceChildren(...nodes.map((node) => this.renderNode(node)));
    if (this.currentDefs.childNodes.length > 0) this.svg.replaceChildren(this.currentDefs, root);
    else this.svg.replaceChildren(root);
    this.currentDefs = null;
  }

  private renderNode(node: SceneNode): SVGElement {
    const element = this.createElement(node);
    element.dataset.nodeId = node.id;
    this.applyTransform(element, node.transform);
    this.applyStyle(element, node.style);
    this.applyDrawProgress(element, node);
    for (const child of node.children ?? []) element.append(this.renderNode(child));
    return element;
  }

  private createElement(node: SceneNode): SVGElement {
    if (node.type === "brace") {
      const group = document.createElementNS(SVG_NS, "g");
      const el = document.createElementNS(SVG_NS, "path");
      const d = this.buildBracePath(node);
      el.setAttribute("d", d.path);
      group.append(el);

      const label = String(node.geometry.label ?? "").trim();
      if (label) {
        const renderer = String(node.geometry.labelRenderer ?? "text");
        if (renderer === "katex" || renderer === "mathjax") {
          const fontSize = Number(node.geometry.labelSize ?? 24);
          const mathNode: SceneNode = {
            id: `${node.id}:label`,
            type: "math",
            transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
            style: { fill: String(node.geometry.labelColor ?? "#ffffff") },
            geometry: {
              fontSize,
              w: Number(node.geometry.labelW ?? Math.max(fontSize * 4, label.length * fontSize * 0.75)),
              h: Number(node.geometry.labelH ?? fontSize * 2.5),
            },
            children: [],
            latex: label,
            renderer,
          };
          const math = this.createMathElement(mathNode);
          math.setAttribute("transform", `translate(${d.anchor.x} ${d.anchor.y})`);
          group.append(math);
        } else {
          const text = document.createElementNS(SVG_NS, "text");
          text.textContent = label;
          text.setAttribute("x", String(d.anchor.x));
          text.setAttribute("y", String(d.anchor.y));
          text.setAttribute("font-size", String(Number(node.geometry.labelSize ?? 24)));
          text.setAttribute("font-family", MANIM_TEXT_FONT_FAMILY);
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("dominant-baseline", "middle");
          text.setAttribute("fill", String(node.geometry.labelColor ?? "#ffffff"));
          text.setAttribute("stroke", "none");
          group.append(text);
        }
      }
      return group;
    }
    if (node.type === "circle") {
      const el = document.createElementNS(SVG_NS, "circle");
      el.setAttribute("r", String(node.geometry.r));
      return el;
    }
    if (node.type === "rect") {
      const el = document.createElementNS(SVG_NS, "rect");
      const width = Number(node.geometry.w);
      const height = Number(node.geometry.h);
      el.setAttribute("x", String(-width / 2));
      el.setAttribute("y", String(-height / 2));
      el.setAttribute("width", String(width));
      el.setAttribute("height", String(height));
      return el;
    }
    if (node.type === "image") {
      return this.createImageElement(node);
    }
    if (node.type === "triangle") {
      const el = document.createElementNS(SVG_NS, "path");
      const w = Number(node.geometry.w ?? 100);
      const h = Number(node.geometry.h ?? 90);
      const halfW = w / 2;
      const halfH = h / 2;
      el.setAttribute("d", `M 0 ${-halfH} L ${halfW} ${halfH} L ${-halfW} ${halfH} Z`);
      return el;
    }
    if (node.type === "line") {
      const el = document.createElementNS(SVG_NS, "line");
      for (const key of ["x1", "y1", "x2", "y2"] as const) el.setAttribute(key, String(node.geometry[key]));
      return el;
    }
    if (node.type === "path") {
      const el = document.createElementNS(SVG_NS, "path");
      el.setAttribute("d", String(node.geometry.d ?? ""));
      if (node.geometry.fillRule) el.setAttribute("fill-rule", String(node.geometry.fillRule));
      return el;
    }
    if (node.type === "text") {
      const el = document.createElementNS(SVG_NS, "text");
      el.textContent = this.writeProgressText(node);
      el.setAttribute("font-size", String(node.geometry.fontSize ?? 32));
      el.setAttribute("font-family", MANIM_TEXT_FONT_FAMILY);
      el.setAttribute("text-anchor", "middle");
      el.setAttribute("dominant-baseline", "middle");
      return el;
    }
    if (node.type === "math") {
      if ((node.children ?? []).length > 0)
        return document.createElementNS(SVG_NS, "g");
      return this.createMathElement(node);
    }
    return document.createElementNS(SVG_NS, "g");
  }

  private createImageElement(node: SceneNode): SVGElement {
    const group = document.createElementNS(SVG_NS, "g");
    const width = Number(node.geometry.w ?? 100);
    const height = Number(node.geometry.h ?? 100);
    const pixels = this.parseImagePixels(String(node.geometry.data ?? ""));
    if (pixels.length === 0 || pixels[0]?.length === 0) {
      const fallback = document.createElementNS(SVG_NS, "rect");
      fallback.setAttribute("x", String(-width / 2));
      fallback.setAttribute("y", String(-height / 2));
      fallback.setAttribute("width", String(width));
      fallback.setAttribute("height", String(height));
      fallback.setAttribute("fill", "none");
      group.append(fallback);
      return group;
    }

    const rows = pixels.length;
    const cols = Math.max(...pixels.map((row) => row.length));
    const cellW = width / cols;
    const cellH = height / rows;
    pixels.forEach((row, rowIndex) => {
      for (let colIndex = 0; colIndex < cols; colIndex += 1) {
        const value = row[colIndex] ?? row[row.length - 1] ?? 0;
        const rect = document.createElementNS(SVG_NS, "rect");
        rect.setAttribute("x", String(-width / 2 + colIndex * cellW));
        rect.setAttribute("y", String(-height / 2 + rowIndex * cellH));
        rect.setAttribute("width", String(cellW + 0.02));
        rect.setAttribute("height", String(cellH + 0.02));
        rect.setAttribute("fill", this.pixelToColor(value));
        rect.setAttribute("stroke", "none");
        group.append(rect);
      }
    });
    return group;
  }

  private parseImagePixels(data: string): number[][] {
    return data
      .split(";")
      .map((row) =>
        row
          .split(",")
          .map((value) => Number(value.trim()))
          .filter((value) => Number.isFinite(value)),
      )
      .filter((row) => row.length > 0);
  }

  private pixelToColor(value: number): string {
    const gray = Math.max(0, Math.min(255, Math.round(value)));
    const hex = gray.toString(16).padStart(2, "0");
    return `#${hex}${hex}${hex}`;
  }

  private indexNode(node: SceneNode): void {
    this.nodeById.set(node.id, node);
    for (const child of node.children ?? []) this.indexNode(child);
  }

  private buildBracePath(node: SceneNode): { path: string; anchor: { x: number; y: number } } {
    const targetId = String(node.geometry.target ?? "");
    const target = this.nodeById.get(targetId);
    if (!target) return { path: "M 0 0", anchor: { x: 0, y: 0 } };
    const b = this.getApproxBounds(target);
    const buff = Math.max(0, Number(node.geometry.buff ?? 8));
    const sharpness = this.clamp(Number(node.geometry.sharpness ?? 2), 0.1, 8);
    const curvature = this.clamp(Number(node.geometry.curvature ?? (0.2 + 0.04 / sharpness)), 0.08, 0.6);
    const tip = this.clamp(Number(node.geometry.tip ?? (0.48 / Math.sqrt(sharpness))), 0.12, 0.75);
    const dir = String(node.geometry.direction ?? "down");
    if (target.type === "line" && (dir === "perpendicular" || dir === "normal" || dir === "line")) {
      return this.buildLineBrace(target, buff, curvature, tip, sharpness, node);
    }
    if (dir === "up" || dir === "down") return this.buildHorizontalBrace(b, dir, buff, curvature, tip, sharpness, node);
    return this.buildVerticalBrace(b, dir === "left" ? "left" : "right", buff, curvature, tip, sharpness, node);
  }

  private buildLineBrace(
    target: SceneNode,
    buff: number,
    curvature: number,
    tip: number,
    sharpness: number,
    node: SceneNode,
  ): { path: string; anchor: { x: number; y: number } } {
    const tx = Number(target.transform.x ?? 0);
    const ty = Number(target.transform.y ?? 0);
    const start = { x: tx + Number(target.geometry.x1 ?? 0), y: ty + Number(target.geometry.y1 ?? 0) };
    const end = { x: tx + Number(target.geometry.x2 ?? 0), y: ty + Number(target.geometry.y2 ?? 0) };
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    if (length < 1) return { path: "M 0 0", anchor: start };

    const ux = dx / length;
    const uy = dy / length;
    const nx = uy;
    const ny = -ux;
    const baseStart = { x: start.x + nx * buff, y: start.y + ny * buff };
    const baseEnd = { x: end.x + nx * buff, y: end.y + ny * buff };
    const { path, tipPoint, tipDepth } = this.buildBraceRibbon(baseStart, baseEnd, { x: nx, y: ny }, curvature, tip, sharpness);
    const gap = this.braceLabelGap(tipDepth, length, node);
    return { path, anchor: { x: tipPoint.x + nx * gap, y: tipPoint.y + ny * gap } };
  }

  private buildHorizontalBrace(
    b: { minX: number; maxX: number; minY: number; maxY: number },
    dir: "up" | "down",
    buff: number,
    curvature: number,
    tip: number,
    sharpness: number,
    node: SceneNode,
  ): { path: string; anchor: { x: number; y: number } } {
    const length = Math.max(1, b.maxX - b.minX);
    const y = dir === "up" ? b.minY - buff : b.maxY + buff;
    const sign = dir === "up" ? -1 : 1;
    const center = (b.minX + b.maxX) / 2;
    const { path, tipPoint, tipDepth } = this.buildBraceRibbon(
      { x: b.minX, y },
      { x: b.maxX, y },
      { x: 0, y: sign },
      curvature,
      tip,
      sharpness,
    );
    const anchor = this.computeBraceLabelAnchor(
      { x: center, y: tipPoint.y },
      sign,
      tipDepth,
      length,
      node,
      true,
    );
    return { path, anchor };
  }

  private buildVerticalBrace(
    b: { minX: number; maxX: number; minY: number; maxY: number },
    dir: "left" | "right",
    buff: number,
    curvature: number,
    tip: number,
    sharpness: number,
    node: SceneNode,
  ): { path: string; anchor: { x: number; y: number } } {
    const length = Math.max(1, b.maxY - b.minY);
    const x = dir === "left" ? b.minX - buff : b.maxX + buff;
    const sign = dir === "left" ? -1 : 1;
    const center = (b.minY + b.maxY) / 2;
    const { path, tipPoint, tipDepth } = this.buildBraceRibbon(
      { x, y: b.minY },
      { x, y: b.maxY },
      { x: sign, y: 0 },
      curvature,
      tip,
      sharpness,
    );
    const anchor = this.computeBraceLabelAnchor(
      { x: tipPoint.x, y: center },
      sign,
      tipDepth,
      length,
      node,
      false,
    );
    return { path, anchor };
  }

  private buildBraceRibbon(
    start: { x: number; y: number },
    end: { x: number; y: number },
    normal: { x: number; y: number },
    curvature: number,
    tip: number,
    sharpness: number,
  ): { path: string; tipPoint: { x: number; y: number }; tipDepth: number } {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / length;
    const uy = dy / length;
    const center = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
    const tipDepth = this.clamp(length * tip * 0.34, 16, Math.max(22, length * 0.38));
    const manimTemplate = this.buildManimBraceTemplate(length, sharpness);
    const bounds = this.pathBounds(manimTemplate);
    if (bounds) {
      const yRange = Math.max(0.0001, bounds.maxY - bounds.minY);
      const xRange = Math.max(0.0001, bounds.maxX - bounds.minX);
      const p = (x: number, y: number): string => {
        const along = ((x - bounds.minX) / xRange - 0.5) * length;
        const outward = ((y - bounds.minY) / yRange) * tipDepth;
        return `${center.x + ux * along + normal.x * outward} ${center.y + uy * along + normal.y * outward}`;
      };
      return {
        path: manimTemplate
          .map((command) => {
            if (command.type === "M") return `M ${p(command.x, command.y)}`;
            if (command.type === "L") return `L ${p(command.x, command.y)}`;
            if (command.type === "C")
              return `C ${p(command.x1, command.y1)} ${p(command.x2, command.y2)} ${p(command.x, command.y)}`;
            return "Z";
          })
          .join(" "),
        tipPoint: {
          x: center.x + normal.x * tipDepth,
          y: center.y + normal.y * tipDepth,
        },
        tipDepth,
      };
    }

    const p = (along: number, outward: number): string =>
      `${center.x + ux * along + normal.x * outward} ${center.y + uy * along + normal.y * outward}`;
    const tipPoint = {
      x: center.x + normal.x * tipDepth,
      y: center.y + normal.y * tipDepth,
    };
    const thickness = this.clamp(length * (0.012 + curvature * 0.014), 4.5, 10);
    const innerThickness = thickness * 0.72;
    const tipThickness = thickness * 1.4;
    const endCurl = this.clamp(length * 0.055 / Math.sqrt(sharpness), 7, 20);

    return {
      path: [
        `M ${p(-length / 2, 0)}`,
        `C ${p(-length / 2 + endCurl, 0)} ${p(-length * 0.38, thickness)} ${p(-length * 0.22, thickness)}`,
        `C ${p(-length * 0.1, thickness)} ${p(-length * 0.08, tipDepth - tipThickness)} ${p(0, tipDepth)}`,
        `C ${p(length * 0.08, tipDepth - tipThickness)} ${p(length * 0.1, thickness)} ${p(length * 0.22, thickness)}`,
        `C ${p(length * 0.38, thickness)} ${p(length / 2 - endCurl, 0)} ${p(length / 2, 0)}`,
        `C ${p(length / 2 - endCurl, -innerThickness)} ${p(length * 0.38, -innerThickness)} ${p(length * 0.22, -innerThickness)}`,
        `C ${p(length * 0.1, -innerThickness)} ${p(length * 0.08, tipDepth - tipThickness * 2)} ${p(0, tipDepth - tipThickness)}`,
        `C ${p(-length * 0.08, tipDepth - tipThickness * 2)} ${p(-length * 0.1, -innerThickness)} ${p(-length * 0.22, -innerThickness)}`,
        `C ${p(-length * 0.38, -innerThickness)} ${p(-length / 2 + endCurl, -innerThickness)} ${p(-length / 2, 0)}`,
        "Z",
      ].join(" "),
      tipPoint,
      tipDepth,
    };
  }

  private buildManimBraceTemplate(
    targetLength: number,
    sharpness: number,
  ): Array<
    | { type: "M" | "L"; x: number; y: number }
    | { type: "C"; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
    | { type: "Z" }
  > {
    const unitWidth = Math.max(0.01, targetLength / 100);
    const linear = Math.max(0, (unitWidth * sharpness - 0.90552) / 2);
    const source = [
      "m0.01216 0",
      "c-0.01152 0 -0.01216 0.0006103 -0.01216 0.01311",
      "v0.007762",
      `c0.06776 0.122 0.1799 0.1455 0.2307 0.1455`,
      `h${linear}`,
      "c0.03046 0.0003899 0.07964 0.00449 0.1246 0.02636",
      "c0.0537 0.02695 0.07418 0.05816 0.08648 0.07769",
      "c0.001562 0.002538 0.004539 0.002563 0.01098 0.002563",
      "c0.006444 0 0.009421 -0.0000247 0.01098 -0.002563",
      "c0.0123 -0.01953 0.03278 -0.05074 0.08648 -0.07769",
      "c0.04491 -0.02187 0.09409 -0.02597 0.1246 -0.02636",
      `h${linear}`,
      "c0.05077 0 0.1629 -0.02346 0.2307 -0.1455",
      "v-0.007762",
      "c-0.00000178 -0.0125 -0.0006365 -0.01311 -0.01216 -0.01311",
      "c-0.006444 0 -0.009348 0.00002448 -0.01091 0.002563",
      "c-0.0123 0.01953 -0.03278 0.05074 -0.08648 0.07769",
      "c-0.04491 0.02187 -0.09416 0.02597 -0.1246 0.02636",
      `h${-linear}`,
      "c-0.04786 0 -0.1502 0.02094 -0.2185 0.1256",
      "c-0.06833 -0.1046 -0.1706 -0.1256 -0.2185 -0.1256",
      `h${-linear}`,
      "c-0.03046 -0.0003899 -0.07972 -0.004491 -0.1246 -0.02636",
      "c-0.0537 -0.02695 -0.07418 -0.05816 -0.08648 -0.07769",
      "c-0.001562 -0.002538 -0.004467 -0.002563 -0.01091 -0.002563",
      "z",
    ].join(" ");
    return this.parseRelativeBracePath(source);
  }

  private parseRelativeBracePath(
    source: string,
  ): Array<
    | { type: "M" | "L"; x: number; y: number }
    | { type: "C"; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
    | { type: "Z" }
  > {
    const tokens = source.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+)(?:e[-+]?\d+)?/gu) ?? [];
    const commands: Array<
      | { type: "M" | "L"; x: number; y: number }
      | { type: "C"; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
      | { type: "Z" }
    > = [];
    let index = 0;
    let x = 0;
    let y = 0;
    while (index < tokens.length) {
      const command = tokens[index++];
      if (!command) break;
      if (command === "m") {
        x += Number(tokens[index++]);
        y += Number(tokens[index++]);
        commands.push({ type: "M", x, y });
        continue;
      }
      if (command === "c") {
        const x1 = x + Number(tokens[index++]);
        const y1 = y + Number(tokens[index++]);
        const x2 = x + Number(tokens[index++]);
        const y2 = y + Number(tokens[index++]);
        x += Number(tokens[index++]);
        y += Number(tokens[index++]);
        commands.push({ type: "C", x1, y1, x2, y2, x, y });
        continue;
      }
      if (command === "h") {
        x += Number(tokens[index++]);
        commands.push({ type: "L", x, y });
        continue;
      }
      if (command === "v") {
        y += Number(tokens[index++]);
        commands.push({ type: "L", x, y });
        continue;
      }
      if (command === "z" || command === "Z") {
        commands.push({ type: "Z" });
        continue;
      }
      return [];
    }
    return commands;
  }

  private pathBounds(
    commands: Array<
      | { type: "M" | "L"; x: number; y: number }
      | { type: "C"; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
      | { type: "Z" }
    >,
  ): { minX: number; maxX: number; minY: number; maxY: number } | undefined {
    const points = commands.flatMap((command) => {
      if (command.type === "M" || command.type === "L") return [{ x: command.x, y: command.y }];
      if (command.type === "C")
        return [
          { x: command.x1, y: command.y1 },
          { x: command.x2, y: command.y2 },
          { x: command.x, y: command.y },
        ];
      return [];
    });
    if (points.length === 0) return undefined;
    return {
      minX: Math.min(...points.map((point) => point.x)),
      maxX: Math.max(...points.map((point) => point.x)),
      minY: Math.min(...points.map((point) => point.y)),
      maxY: Math.max(...points.map((point) => point.y)),
    };
  }

  private computeBraceLabelAnchor(
    tipPoint: { x: number; y: number },
    outwardSign: number,
    tipDepth: number,
    targetLength: number,
    node: SceneNode,
    horizontal: boolean,
  ): { x: number; y: number } {
    const alignment = String(node.geometry.labelAlignment ?? "center").toLowerCase();
    const gap = this.braceLabelGap(tipDepth, targetLength, node);
    const axisShift = this.clamp(targetLength * 0.28, 18, 90);
    const shiftSign = alignment === "start" ? -1 : alignment === "end" ? 1 : 0;
    if (horizontal) return { x: tipPoint.x + shiftSign * axisShift, y: tipPoint.y + outwardSign * gap };
    return { x: tipPoint.x + outwardSign * gap, y: tipPoint.y + shiftSign * axisShift };
  }

  private braceLabelGap(tipDepth: number, targetLength: number, node: SceneNode): number {
    const rawOffset = Number(node.geometry.labelOffset ?? 0);
    const stretch = this.clamp(targetLength / 220, 0.65, 2.4);
    const baseGap = tipDepth * 0.52 + 10 + stretch * 3.5;
    return Math.max(0, baseGap + rawOffset * stretch);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  private getApproxBounds(node: SceneNode): { minX: number; maxX: number; minY: number; maxY: number } {
    const x = Number(node.transform.x ?? 0);
    const y = Number(node.transform.y ?? 0);
    if (node.type === "circle") {
      const r = Number(node.geometry.r ?? 40);
      return { minX: x - r, maxX: x + r, minY: y - r, maxY: y + r };
    }
    if (node.type === "line") {
      const x1 = x + Number(node.geometry.x1 ?? 0);
      const x2 = x + Number(node.geometry.x2 ?? 0);
      const y1 = y + Number(node.geometry.y1 ?? 0);
      const y2 = y + Number(node.geometry.y2 ?? 0);
      return { minX: Math.min(x1, x2), maxX: Math.max(x1, x2), minY: Math.min(y1, y2), maxY: Math.max(y1, y2) };
    }
    const w = Number(node.geometry.w ?? (Number(node.geometry.fontSize ?? 32) * 4));
    const h = Number(node.geometry.h ?? (Number(node.geometry.fontSize ?? 32) * 1.5));
    return { minX: x - w / 2, maxX: x + w / 2, minY: y - h / 2, maxY: y + h / 2 };
  }

  private createMathElement(node: SceneNode): SVGElement {
    const group = document.createElementNS(SVG_NS, "g");
    const foreignObject = document.createElementNS(SVG_NS, "foreignObject");
    const fontSize = Number(node.geometry.fontSize ?? 36);
    const latex = node.latex ?? "";
    const width = Number(node.geometry.w ?? Math.max(fontSize * 4, latex.length * fontSize * 0.65));
    const height = Number(node.geometry.h ?? fontSize * 2.5);
    const renderer = this.normalizeMathRenderer(node.renderer);
    const hasExplicitBaselineOffset = Object.hasOwn(node.geometry, "baselineOffset");
    const explicitBaselineOffset = Number(node.geometry.baselineOffset);
    const baselineOffset = hasExplicitBaselineOffset && Number.isFinite(explicitBaselineOffset)
      ? explicitBaselineOffset
      : this.getBaselineOffset(latex, renderer, fontSize);

    foreignObject.setAttribute("x", String(-width / 2));
    foreignObject.setAttribute("y", String(-height / 2 + baselineOffset));
    foreignObject.setAttribute("width", String(width * this.writeProgress(node)));
    foreignObject.setAttribute("height", String(height));

    const container = document.createElementNS(XHTML_NS, "div") as HTMLDivElement;
    container.style.width = `${width}px`;
    container.style.height = "100%";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.fontSize = `${fontSize}px`;
    container.style.color = node.style.fill ?? "#ffffff";
    container.style.overflow = "visible";
    container.dataset.mathRenderer = renderer;

    foreignObject.append(container);
    group.append(foreignObject);
    this.renderLatex(container, latex, renderer);
    return group;
  }

  private writeProgress(node: SceneNode): number {
    const value = Number(node.geometry.writeProgress ?? 1);
    if (!Number.isFinite(value)) return 1;
    return this.clamp(value, 0, 1);
  }

  private writeProgressText(node: SceneNode): string {
    const text = node.text ?? "";
    const progress = this.writeProgress(node);
    if (progress >= 1) return text;
    return text.slice(0, Math.ceil(text.length * progress));
  }

  private getBaselineOffset(latex: string, renderer: MathRendererName, fontSize: number): number {
    if (!latex || !document.body) return 0;
    if (renderer === "katex" && !(globalThis as { katex?: KatexGlobal }).katex)
      return 0;
    if (renderer === "mathjax" && !(globalThis as { MathJax?: MathJaxGlobal }).MathJax)
      return 0;

    const key = `${renderer}::${fontSize}::${latex}`;
    const cached = this.baselineCache.get(key);
    if (cached !== undefined) return cached;

    let offset = 0;
    try {
      const probe = document.createElement("span");
      probe.style.display = "inline-flex";
      probe.style.alignItems = "baseline";
      probe.style.fontSize = `${fontSize}px`;
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      probe.style.pointerEvents = "none";
      const marker = document.createElement("span");
      marker.textContent = "x";
      marker.style.display = "inline-block";
      const math = document.createElement("span");
      this.renderLatex(math, latex, renderer);
      probe.append(math, marker);
      document.body.append(probe);
      const mathRect = math.getBoundingClientRect();
      const markerRect = marker.getBoundingClientRect();
      if (mathRect.height > 0 && markerRect.height > 0) {
        offset = markerRect.bottom - mathRect.bottom;
        if (!Number.isFinite(offset)) offset = 0;
      }
      probe.remove();
    } catch {
      offset = 0;
    }

    const maxAbsOffset = Math.max(1, fontSize * MAX_BASELINE_OFFSET_EM);
    const clamped = Math.max(-maxAbsOffset, Math.min(maxAbsOffset, offset));
    this.baselineCache.set(key, clamped);
    return clamped;
  }

  private normalizeMathRenderer(renderer: string | undefined): MathRendererName {
    return renderer === "mathjax" ? "mathjax" : "katex";
  }

  private renderLatex(container: HTMLElement, latex: string, renderer: MathRendererName): void {
    if (renderer === "mathjax") {
      this.renderWithMathJax(container, latex);
      return;
    }
    this.renderWithKatex(container, latex);
  }

  private renderWithKatex(container: HTMLElement, latex: string): void {
    const katex = (globalThis as { katex?: KatexGlobal }).katex;
    if (!katex) {
      container.textContent = latex;
      return;
    }
    katex.render(latex, container, { throwOnError: false, displayMode: false });
  }

  private renderWithMathJax(container: HTMLElement, latex: string): void {
    const mathJax = (globalThis as { MathJax?: MathJaxGlobal }).MathJax;
    if (!mathJax) {
      container.textContent = latex;
      return;
    }

    if (mathJax.tex2chtml) {
      container.replaceChildren(mathJax.tex2chtml(latex, { display: false }));
      return;
    }
    if (mathJax.tex2svg) {
      container.replaceChildren(mathJax.tex2svg(latex, { display: false }));
      return;
    }

    container.textContent = `\\(${latex}\\)`;
    void mathJax.typesetPromise?.([container]);
  }

  private applyCameraTransform(element: SVGElement, camera: Camera): void {
    element.setAttribute("transform", buildCameraTransform(camera, this.width, this.height));
  }

  private applyTransform(element: SVGElement, transform: Transform): void {
    const scale = Number(transform.scale ?? 1);
    const scaleX = scale * Number(transform.scaleX ?? 1);
    const scaleY = scale * Number(transform.scaleY ?? 1);
    element.setAttribute(
      "transform",
      `translate(${transform.x} ${transform.y}) rotate(${transform.rotation}) scale(${scaleX} ${scaleY})`,
    );
    element.setAttribute("opacity", String(transform.opacity));
  }

  private applyStyle(element: SVGElement, style: Style): void {
    element.setAttribute("fill", this.resolveFill(style.fill ?? "none"));
    element.setAttribute("stroke", style.stroke ?? "none");
    element.setAttribute("stroke-width", String(style.strokeWidth ?? 0));
    if (style.fillOpacity !== undefined) element.setAttribute("fill-opacity", String(style.fillOpacity));
    if (style.strokeOpacity !== undefined) element.setAttribute("stroke-opacity", String(style.strokeOpacity));
  }

  private resolveFill(fill: string): string {
    const stops = /^linear-gradient\((.+)\)$/u.exec(fill.trim())?.[1];
    if (!stops || !this.currentDefs) return fill;
    const colors = stops
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    if (colors.length < 2) return fill;
    const id = `fluxion-gradient-${this.gradientIndex++}`;
    const gradient = document.createElementNS(SVG_NS, "linearGradient");
    gradient.setAttribute("id", id);
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "100%");
    gradient.setAttribute("y2", "0%");
    colors.forEach((color, index) => {
      const stop = document.createElementNS(SVG_NS, "stop");
      stop.setAttribute("offset", `${(index / (colors.length - 1)) * 100}%`);
      stop.setAttribute("stop-color", color);
      gradient.append(stop);
    });
    this.currentDefs.append(gradient);
    return `url(#${id})`;
  }

  private applyDrawProgress(element: SVGElement, node: SceneNode): void {
    if (!Object.hasOwn(node.geometry, "drawProgress")) return;
    const progress = this.clamp(Number(node.geometry.drawProgress), 0, 1);
    element.setAttribute("pathLength", "1");
    element.setAttribute("stroke-dasharray", "1");
    element.setAttribute("stroke-dashoffset", String(1 - progress));
    if ((node.style.fill ?? "none") !== "none" && progress < 0.999) {
      const baseFillOpacity = Number(node.style.fillOpacity ?? 1);
      const revealOpacity = this.clamp((progress - 0.72) / 0.28, 0, 1);
      element.setAttribute("fill-opacity", String(this.clamp(baseFillOpacity, 0, 1) * revealOpacity));
    }
  }
}
