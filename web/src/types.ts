export type NodeType = "group" | "circle" | "rect" | "triangle" | "line" | "path" | "text" | "math" | "brace" | "image" | "cameraView";

export interface Transform {
  x: number;
  y: number;
  scale: number;
  scaleX?: number;
  scaleY?: number;
  rotation: number;
  opacity: number;
}

export interface Camera {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  target?: { x: number; y: number };
  padding?: number;
  mode?: "center" | "target" | "frame-fit";
}

export type InterpolatableGeometryValue = number | string | number[] | boolean;

export interface Style {
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
  strokeLinecap?: "butt" | "round" | "square";
  strokeLinejoin?: "miter" | "round" | "bevel";
}

export interface PlotMetadata {
  range?: [number, number];
  samples?: number;
}

export interface SurfaceFaceMetadata {
  row: number;
  col: number;
  depth: number;
  height?: number;
  shade?: number;
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
  metadata?: {
    plot?: PlotMetadata;
    surfaceFace?: SurfaceFaceMetadata;
  };
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

export interface SetExpressionOperation extends BaseOperation {
  op: "setExpr";
  id: string;
  path: string;
  expr: string;
}

export interface BindExpressionOperation extends BaseOperation {
  op: "bindExpr";
  id: string;
  path: string;
  expr: string;
  duration?: number;
  deps?: string[];
}

export interface BindPathOperation extends BaseOperation {
  op: "bindPath";
  id: string;
  path: string;
  pathType?: "parametric" | "arc";
  radius?: number;
  samples: number;
  tMinExpr: string;
  tMaxExpr: string;
  xExpr: string;
  yExpr: string;
  close?: boolean;
  smoothing?: "linear" | "smooth";
  sampling?: "fixed" | "frame";
  sampleStep?: number;
  deps?: string[];
}

export interface SetValueOperation extends BaseOperation {
  op: "setValue";
  id: string;
  value: number;
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

export interface AnimateValueOperation extends BaseOperation {
  op: "animateValue";
  id: string;
  from: number;
  to: number;
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

export interface FollowCameraOperation extends BaseOperation {
  op: "followCamera";
  id: string;
  frameId?: string;
  duration?: number;
}

export type TimelineOperation =
  | CreateOperation
  | DeleteOperation
  | SetOperation
  | SetExpressionOperation
  | BindExpressionOperation
  | BindPathOperation
  | SetValueOperation
  | AnimateOperation
  | AnimateValueOperation
  | EffectOperation
  | FollowCameraOperation;

export interface ValueTracker {
  id: string;
  initial: number;
}

export interface FluxionDocument {
  version: "0.1";
  width: number;
  height: number;
  fps: number;
  duration?: number;
  camera: Camera;
  nodes: SceneNode[];
  values?: ValueTracker[];
  timeline: TimelineOperation[];
}

export type DiffOperation =
  | Omit<CreateOperation, "t">
  | Omit<DeleteOperation, "t">
  | Omit<SetOperation, "t">
  | Omit<SetExpressionOperation, "t">
  | Omit<BindExpressionOperation, "t">
  | Omit<BindPathOperation, "t">;
  

export interface DiffStream {
  seq?: number;
  ops?: DiffOperation[];
}
