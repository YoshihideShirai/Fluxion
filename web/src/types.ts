export type NodeType = "group" | "circle" | "rect" | "line" | "path" | "text" | "math";

export interface Transform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
}

export type InterpolatableGeometryValue = number | string | number[] | boolean;

export interface Style {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface SceneNode {
  id: string;
  type: NodeType;
  transform: Transform;
  style: Style;
  geometry: Record<string, InterpolatableGeometryValue>;
  children: SceneNode[];
  text?: string;
  latex?: string;
  renderer?: string;
}

export type EasingName = "linear" | "smooth" | "easeInOut" | "easeIn" | "easeOut" | string;

export interface BaseOperation {
  t: number;
  op: string;
}

export interface CreateOperation extends BaseOperation {
  op: "create";
  node: SceneNode;
}

export interface DeleteOperation extends BaseOperation {
  op: "delete";
  id: string;
}

export interface SetOperation extends BaseOperation {
  op: "set";
  id: string;
  path: string;
  value: unknown;
}

export interface AnimateOperation extends BaseOperation {
  op: "animate";
  id: string;
  path: string;
  from: unknown;
  to: unknown;
  duration: number;
  easing: EasingName;
}

export interface EffectOperation extends BaseOperation {
  op: "effect";
  id: string;
  effect: "fadeIn" | "fadeOut" | "create" | "write" | string;
  duration: number;
  easing: EasingName;
}

export type TimelineOperation = CreateOperation | DeleteOperation | SetOperation | AnimateOperation | EffectOperation;

export interface FluxionDocument {
  version: "0.1";
  width: number;
  height: number;
  fps: number;
  duration?: number;
  nodes: SceneNode[];
  timeline: TimelineOperation[];
}

export type DiffOperation =
  | Omit<CreateOperation, "t">
  | Omit<DeleteOperation, "t">
  | Omit<SetOperation, "t">;

export interface DiffStream {
  seq?: number;
  ops?: DiffOperation[];
}
