import type { Camera, SceneNode, Style, Transform } from "../types.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const XHTML_NS = "http://www.w3.org/1999/xhtml";

type MathRendererName = "katex" | "mathjax";

const DEFAULT_CAMERA: Camera = { x: 0, y: 0, scale: 1, rotation: 0 };

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
  return [
    `translate(${centerX + camera.x} ${centerY + camera.y})`,
    `rotate(${camera.rotation})`,
    `scale(${camera.scale})`,
    `translate(${-centerX} ${-centerY})`,
  ].join(" ");
}

export class SvgRenderer {
  private readonly svg: SVGSVGElement;
  private readonly width: number;
  private readonly height: number;

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
