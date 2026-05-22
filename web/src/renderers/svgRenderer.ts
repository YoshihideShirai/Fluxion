import type { Camera, SceneNode, Style, Transform } from "../types.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const XHTML_NS = "http://www.w3.org/1999/xhtml";

type MathRendererName = "katex" | "mathjax";

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
  const targetX = camera.target?.x ?? centerX;
  const targetY = camera.target?.y ?? centerY;
  const padding = camera.padding ?? 0;
  const mode = camera.mode ?? "center";
  const fitScale = mode === "frame-fit" ? Math.max(0.0001, camera.scale * ((Math.min(width, height) - padding * 2) / Math.min(width, height))) : camera.scale;
  const anchorX = mode === "center" ? centerX : targetX;
  const anchorY = mode === "center" ? centerY : targetY;
  return [
    `translate(${centerX + camera.x} ${centerY + camera.y})`,
    `rotate(${camera.rotation})`,
    `translate(${anchorX} ${anchorY})`,
    `scale(${fitScale})`,
    `translate(${-anchorX} ${-anchorY})`,
  ].join(" ");
}

export class SvgRenderer {
  private readonly svg: SVGSVGElement;
  private readonly width: number;
  private readonly height: number;
  private readonly nodeById = new Map<string, SceneNode>();

  constructor(container: Element, width = 1280, height = 720) {
    this.width = width;
    this.height = height;
    this.svg = document.createElementNS(SVG_NS, "svg");
    this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    this.svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", "100%");
    this.svg.style.display = "block";
    this.svg.style.background = "#0f172a";
    container.replaceChildren(this.svg);
  }

  render(nodes: SceneNode[], camera: Camera = DEFAULT_CAMERA): void {
    this.nodeById.clear();
    for (const node of nodes) this.indexNode(node);
    const root = document.createElementNS(SVG_NS, "g");
    this.applyCameraTransform(root, camera);
    root.replaceChildren(...nodes.map((node) => this.renderNode(node)));
    this.svg.replaceChildren(root);
  }

  private renderNode(node: SceneNode): SVGElement {
    const element = this.createElement(node);
    element.dataset.nodeId = node.id;
    this.applyTransform(element, node.transform);
    this.applyStyle(element, node.style);
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
        const text = document.createElementNS(SVG_NS, "text");
        text.textContent = label;
        text.setAttribute("x", String(d.anchor.x));
        text.setAttribute("y", String(d.anchor.y));
        text.setAttribute("font-size", String(Number(node.geometry.labelSize ?? 24)));
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", String(node.geometry.labelColor ?? "#ffffff"));
        text.setAttribute("stroke", "none");
        group.append(text);
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
      return el;
    }
    if (node.type === "text") {
      const el = document.createElementNS(SVG_NS, "text");
      el.textContent = node.text ?? "";
      el.setAttribute("font-size", String(node.geometry.fontSize ?? 32));
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
    const curvature = this.clamp(Number(node.geometry.curvature ?? 0.22), 0.08, 0.6);
    const tip = this.clamp(Number(node.geometry.tip ?? 0.35), 0.12, 0.75);
    const dir = String(node.geometry.direction ?? "down");
    if (dir === "up" || dir === "down") return this.buildHorizontalBrace(b, dir, buff, curvature, tip, node);
    return this.buildVerticalBrace(b, dir === "left" ? "left" : "right", buff, curvature, tip, node);
  }

  private buildHorizontalBrace(
    b: { minX: number; maxX: number; minY: number; maxY: number },
    dir: "up" | "down",
    buff: number,
    curvature: number,
    tip: number,
    node: SceneNode,
  ): { path: string; anchor: { x: number; y: number } } {
    const length = Math.max(1, b.maxX - b.minX);
    const y = dir === "up" ? b.minY - buff : b.maxY + buff;
    const sign = dir === "up" ? -1 : 1;
    const center = (b.minX + b.maxX) / 2;
    const control = this.clamp(length * curvature, 10, 64);
    const tipDepth = this.clamp(length * tip * 0.32, 12, Math.max(18, length * 0.75));
    const cpInset = this.clamp(control * 0.45, 6, control);
    const path = [
      `M ${b.minX} ${y}`,
      `C ${b.minX + cpInset} ${y} ${center - control} ${y + sign * tipDepth} ${center} ${y + sign * tipDepth}`,
      `C ${center + control} ${y + sign * tipDepth} ${b.maxX - cpInset} ${y} ${b.maxX} ${y}`,
    ].join(" ");
    const anchor = this.computeBraceLabelAnchor(
      { x: center, y: y + sign * tipDepth },
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
    node: SceneNode,
  ): { path: string; anchor: { x: number; y: number } } {
    const length = Math.max(1, b.maxY - b.minY);
    const x = dir === "left" ? b.minX - buff : b.maxX + buff;
    const sign = dir === "left" ? -1 : 1;
    const center = (b.minY + b.maxY) / 2;
    const control = this.clamp(length * curvature, 10, 64);
    const tipDepth = this.clamp(length * tip * 0.32, 12, Math.max(18, length * 0.75));
    const cpInset = this.clamp(control * 0.45, 6, control);
    const path = [
      `M ${x} ${b.minY}`,
      `C ${x} ${b.minY + cpInset} ${x + sign * tipDepth} ${center - control} ${x + sign * tipDepth} ${center}`,
      `C ${x + sign * tipDepth} ${center + control} ${x} ${b.maxY - cpInset} ${x} ${b.maxY}`,
    ].join(" ");
    const anchor = this.computeBraceLabelAnchor(
      { x: x + sign * tipDepth, y: center },
      sign,
      tipDepth,
      length,
      node,
      false,
    );
    return { path, anchor };
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
    const rawOffset = Number(node.geometry.labelOffset ?? 0);
    const stretch = this.clamp(targetLength / 220, 0.65, 2.4);
    const baseGap = tipDepth * 0.65 + 8 + stretch * 4;
    const gap = Math.max(0, baseGap + rawOffset * stretch);
    const axisShift = this.clamp(targetLength * 0.28, 18, 90);
    const shiftSign = alignment === "start" ? -1 : alignment === "end" ? 1 : 0;
    if (horizontal) return { x: tipPoint.x + shiftSign * axisShift, y: tipPoint.y + outwardSign * gap };
    return { x: tipPoint.x + outwardSign * gap, y: tipPoint.y + shiftSign * axisShift };
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
      return { minX: x + Number(node.geometry.x1 ?? 0), maxX: x + Number(node.geometry.x2 ?? 0), minY: y + Number(node.geometry.y1 ?? 0), maxY: y + Number(node.geometry.y2 ?? 0) };
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

    foreignObject.setAttribute("x", String(-width / 2));
    foreignObject.setAttribute("y", String(-height / 2));
    foreignObject.setAttribute("width", String(width));
    foreignObject.setAttribute("height", String(height));

    const container = document.createElementNS(XHTML_NS, "div") as HTMLDivElement;
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.fontSize = `${fontSize}px`;
    container.style.color = node.style.fill ?? "#ffffff";
    container.style.overflow = "visible";
    container.dataset.mathRenderer = this.normalizeMathRenderer(node.renderer);

    foreignObject.append(container);
    group.append(foreignObject);
    this.renderLatex(container, latex, this.normalizeMathRenderer(node.renderer));
    return group;
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
    element.setAttribute(
      "transform",
      `translate(${transform.x} ${transform.y}) rotate(${transform.rotation}) scale(${transform.scale})`,
    );
    element.setAttribute("opacity", String(transform.opacity));
  }

  private applyStyle(element: SVGElement, style: Style): void {
    element.setAttribute("fill", style.fill ?? "none");
    element.setAttribute("stroke", style.stroke ?? "none");
    element.setAttribute("stroke-width", String(style.strokeWidth ?? 0));
  }
}
