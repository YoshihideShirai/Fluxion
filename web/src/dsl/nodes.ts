import type { Camera, NodeType, SceneNode, Style, Transform } from "../types.js";
import { DslCompileError } from "./errors.js";
import { expandMathTokens } from "./mathTokens.js";
import { parseBoolean, parseNumber } from "./syntax.js";

const DEFAULT_STYLE: Style = {
  fill: "#ffffff",
  stroke: "none",
  strokeWidth: 0,
};

export function createBaseNode(id: string, type: NodeType): SceneNode {
  return {
    id,
    type,
    transform: defaultTransform(),
    style: { ...DEFAULT_STYLE },
    geometry: defaultGeometry(type),
    children: [],
  };
}

export function defaultCamera(): Camera {
  return { x: 0, y: 0, scale: 1, rotation: 0, target: { x: 0, y: 0 }, padding: 0, mode: "center" };
}

export function applyNodeOption(
  node: SceneNode,
  key: string,
  value: string,
  lineNumber: number,
): void {
  if (key === "at") {
    const [x, y] = value
      .split(",")
      .map((item) => parseNumber(item, lineNumber));
    if (
      x === undefined ||
      y === undefined ||
      Number.isNaN(x) ||
      Number.isNaN(y)
    ) {
      throw new DslCompileError("Expected at x,y.", lineNumber);
    }
    node.transform.x = x;
    node.transform.y = y;
    return;
  }

  if (["x", "y", "scale", "scaleX", "scaleY", "rotation", "opacity"].includes(key)) {
    node.transform[key as keyof Transform] = parseNumber(value, lineNumber);
    return;
  }

  if (key === "fill" || key === "stroke") {
    node.style[key] = value;
    return;
  }

  if (key === "strokeWidth" || key === "fillOpacity" || key === "strokeOpacity") {
    node.style[key] = parseNumber(value, lineNumber);
    return;
  }

  if (key === "expandTokens") {
    node.geometry.expandTokens = parseBoolean(value, lineNumber);
    if (node.geometry.expandTokens) expandMathTokens(node, lineNumber);
    else node.children = [];
    return;
  }

  if (key === "renderer") {
    if (value !== "katex" && value !== "mathjax")
      throw new DslCompileError(
        "Expected renderer to be 'katex' or 'mathjax'.",
        lineNumber,
      );
    node.renderer = value;
    return;
  }

  if (key === "size" || key === "fontSize") {
    node.geometry.fontSize = parseNumber(value, lineNumber);
    return;
  }
  if (key === "target") {
    node.geometry.target = value;
    return;
  }
  if (key === "direction") {
    if (!["up", "down", "left", "right", "perpendicular", "normal", "line"].includes(value))
      throw new DslCompileError("Brace direction must be one of up/down/left/right/perpendicular/normal/line.", lineNumber);
    node.geometry.direction = value;
    return;
  }
  if (["buff", "sharpness", "curvature", "tip", "labelOffset", "labelW", "labelH"].includes(key)) {
    node.geometry[key] = parseNumber(value, lineNumber);
    return;
  }
  if (key === "labelRenderer") {
    if (!["text", "katex", "mathjax"].includes(value))
      throw new DslCompileError("Brace labelRenderer must be one of text/katex/mathjax.", lineNumber);
    node.geometry.labelRenderer = value;
    return;
  }
  if (key === "labelAlignment") {
    if (!["start", "center", "end"].includes(value))
      throw new DslCompileError("Brace labelAlignment must be one of start/center/end.", lineNumber);
    node.geometry.labelAlignment = value;
    return;
  }
  if (key === "label") {
    node.geometry.label = value;
    return;
  }
  if (key === "labelSize") {
    node.geometry.labelSize = parseNumber(value, lineNumber);
    return;
  }
  if (key === "labelColor") {
    node.geometry.labelColor = value;
    return;
  }
  if (key === "fillRule") {
    if (value !== "nonzero" && value !== "evenodd")
      throw new DslCompileError("Expected fillRule to be 'nonzero' or 'evenodd'.", lineNumber);
    node.geometry.fillRule = value;
    return;
  }

  if (["r", "w", "h", "x1", "y1", "x2", "y2"].includes(key)) {
    node.geometry[key] = parseNumber(value, lineNumber);
    return;
  }

  if (key === "d") {
    node.geometry.d = value;
    return;
  }

  if (key === "data" || key === "sampling") {
    node.geometry[key] = value;
    return;
  }

  throw new DslCompileError(`Unknown node option '${key}'.`, lineNumber);
}

export function cameraPropertyPath(property: string): string {
  if (isCameraProperty(property)) return `camera.${property}`;
  return property;
}

export function isCameraProperty(property: string | undefined): boolean {
  return ["x", "y", "scale", "rotation", "padding", "mode", "target.x", "target.y"].includes(property ?? "");
}

export function propertyPath(property: string): string {
  if (["x", "y", "scale", "scaleX", "scaleY", "rotation", "opacity"].includes(property))
    return `transform.${property}`;
  if (["fill", "fillOpacity", "stroke", "strokeOpacity", "strokeWidth"].includes(property))
    return `style.${property}`;
  if (
    ["r", "w", "h", "fontSize", "x1", "y1", "x2", "y2", "d", "data", "sampling", "target", "direction", "buff", "sharpness", "curvature", "tip", "label", "labelSize", "labelColor", "labelOffset", "labelAlignment", "labelRenderer", "labelW", "labelH", "fillRule"].includes(property)
  )
    return `geometry.${property}`;
  if (property === "renderer") return "renderer";
  if (property === "text") return "text";
  return property;
}

function defaultTransform(): Transform {
  return { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 };
}

function defaultGeometry(type: NodeType): Record<string, number | string> {
  if (type === "circle") return { r: 40 };
  if (type === "rect") return { w: 100, h: 80 };
  if (type === "triangle") return { w: 100, h: 90 };
  if (type === "line") return { x1: 0, y1: 0, x2: 100, y2: 0 };
  if (type === "path") return { d: "" };
  if (type === "text") return { fontSize: 32 };
  if (type === "math") return { fontSize: 36 };
  if (type === "brace")
    return { target: "", direction: "down", buff: 8, sharpness: 2, label: "", labelSize: 24, labelColor: "#ffffff", labelRenderer: "text" };
  if (type === "image") return { w: 100, h: 100, data: "", sampling: "nearest" };
  return {};
}
