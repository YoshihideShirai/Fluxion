import type { Camera, FluxionDocument } from "../types.js";
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


function cloneCamera(camera: Camera | undefined): Camera {
  return { x: camera?.x ?? 0, y: camera?.y ?? 0, scale: camera?.scale ?? 1, rotation: camera?.rotation ?? 0 };
}
