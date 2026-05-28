import type { Camera, FluxionDocument } from "../types.js";
import type { SceneNode } from "../types.js";
import type { SvgRenderer } from "../renderers/svgRenderer.js";
import { SceneGraph } from "./sceneGraph.js";
import { applyTimelineAt } from "./timeline.js";

interface PlayOptions {
  from?: number;
  loop?: boolean;
  onTick?: (seconds: number) => void;
  onStop?: () => void;
}

export class Player {
  private readonly document: FluxionDocument;
  private readonly renderer: SvgRenderer;
  private readonly duration: number;
  private currentTime = 0;
  private startedAt = 0;
  private animationFrame: number | null = null;

  constructor(documentData: FluxionDocument, renderer: SvgRenderer) {
    this.document = documentData;
    this.renderer = renderer;
    this.duration = documentData.duration ?? Math.max(0, ...documentData.timeline.map((op) => op.t + ("duration" in op ? op.duration : 0)));
  }

  get durationSeconds(): number {
    return this.duration;
  }

  get currentSeconds(): number {
    return this.currentTime;
  }

  seek(seconds: number): void {
    this.currentTime = clamp(seconds, 0, this.duration);
    const graph = new SceneGraph(hasCreateOperations(this.document) ? [] : this.document.nodes);
    const camera = cloneCamera(this.document.camera);
    applyTimelineAt(graph, this.document.timeline, this.currentTime, this.document.values, camera);
    applyTargetTraces(graph, this.document, this.currentTime);
    this.renderer.render(graph.all(), camera);
  }

  play(options: PlayOptions = {}): void {
    this.stop();
    const from = clamp(options.from ?? this.currentTime, 0, this.duration);
    this.startedAt = performance.now() - from * 1000;
    const tick = (): void => {
      let seconds = (performance.now() - this.startedAt) / 1000;
      if (options.loop) seconds %= Math.max(this.duration, 0.001);
      else if (seconds >= this.duration) {
        this.seek(this.duration);
        options.onTick?.(this.duration);
        this.stop();
        options.onStop?.();
        return;
      }
      this.seek(seconds);
      options.onTick?.(this.currentTime);
      this.animationFrame = requestAnimationFrame(tick);
    };
    tick();
  }

  stop(): void {
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
  }
}

function clamp(value: number, min: number, max: number): number {
  if (max <= min) return min;
  return Math.min(max, Math.max(min, value));
}

function hasCreateOperations(documentData: FluxionDocument): boolean {
  return documentData.timeline.some((op) => op.op === "create");
}

export function applyTargetTraces(graph: SceneGraph, documentData: FluxionDocument, seconds: number): void {
  for (const node of flattenNodes(graph.all())) {
    const targetId = typeof node.geometry.tracedTarget === "string" ? node.geometry.tracedTarget : undefined;
    if (!targetId) continue;
    const start = Number(node.geometry.traceStart ?? 0);
    const samples = Math.max(2, Math.round(Number(node.geometry.traceSamples ?? 96)));
    const d = buildTargetTracePath(documentData, targetId, start, seconds, samples);
    if (d) graph.setPathData(node.id, d);
  }
}

function buildTargetTracePath(
  documentData: FluxionDocument,
  targetId: string,
  start: number,
  end: number,
  samples: number,
): string {
  const to = Math.max(start, end);
  const effectiveSamples = Math.min(samples, 512);
  const points: Array<{ x: number; y: number }> = [];
  for (let index = 0; index < effectiveSamples; index += 1) {
    const alpha = effectiveSamples === 1 ? 0 : index / (effectiveSamples - 1);
    const time = start + (to - start) * alpha;
    const sampleGraph = new SceneGraph(hasCreateOperations(documentData) ? [] : documentData.nodes);
    const camera = cloneCamera(documentData.camera);
    applyTimelineAt(sampleGraph, documentData.timeline, time, documentData.values, camera);
    const target = sampleGraph.get(targetId);
    if (!target) continue;
    points.push({ x: target.transform.x, y: target.transform.y });
  }
  if (points.length === 0) return "";
  const head = `M ${points[0]!.x} ${points[0]!.y}`;
  return [head, ...points.slice(1).map((point) => `L ${point.x} ${point.y}`)].join(" ");
}

function flattenNodes(nodes: SceneNode[]): SceneNode[] {
  return nodes.flatMap((node) => [node, ...flattenNodes(node.children ?? [])]);
}

function cloneCamera(camera: Camera | undefined): Camera {
  const cloned: Camera = {
    x: camera?.x ?? 0,
    y: camera?.y ?? 0,
    scale: camera?.scale ?? 1,
    rotation: camera?.rotation ?? 0,
  };
  if (camera?.target) cloned.target = { ...camera.target };
  if (camera?.padding !== undefined) cloned.padding = camera.padding;
  if (camera?.mode !== undefined) cloned.mode = camera.mode;
  return cloned;
}
