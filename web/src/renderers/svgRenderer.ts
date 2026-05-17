import type { SceneNode, Style, Transform } from "../types.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export class SvgRenderer {
  private readonly svg: SVGSVGElement;

  constructor(container: Element, width = 1280, height = 720) {
    this.svg = document.createElementNS(SVG_NS, "svg");
    this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", "100%");
    this.svg.style.background = "#0f172a";
    container.replaceChildren(this.svg);
  }

  render(nodes: SceneNode[]): void {
    this.svg.replaceChildren(...nodes.map((node) => this.renderNode(node)));
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
    if (node.type === "line") {
      const el = document.createElementNS(SVG_NS, "line");
      for (const key of ["x1", "y1", "x2", "y2"] as const) el.setAttribute(key, String(node.geometry[key]));
      return el;
    }
    if (node.type === "text" || node.type === "math") {
      const el = document.createElementNS(SVG_NS, "text");
      el.textContent = node.text ?? node.latex ?? "";
      el.setAttribute("font-size", String(node.geometry.fontSize ?? 32));
      el.setAttribute("text-anchor", "middle");
      el.setAttribute("dominant-baseline", "middle");
      return el;
    }
    return document.createElementNS(SVG_NS, "g");
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
