import type { VanimDocument } from "../types.js";
import type { SvgRenderer } from "../renderers/svgRenderer.js";
import { SceneGraph } from "./sceneGraph.js";
import { applyTimelineAt } from "./timeline.js";

export class Player {
  private readonly document: VanimDocument;
  private readonly renderer: SvgRenderer;
  private readonly duration: number;
  private startedAt = 0;
  private animationFrame: number | null = null;

  constructor(documentData: VanimDocument, renderer: SvgRenderer) {
    this.document = documentData;
    this.renderer = renderer;
    this.duration = documentData.duration ?? Math.max(0, ...documentData.timeline.map((op) => op.t + ("duration" in op ? op.duration : 0)));
  }

  seek(seconds: number): void {
    const graph = new SceneGraph(this.document.nodes);
    applyTimelineAt(graph, this.document.timeline, seconds);
    this.renderer.render(graph.all());
  }

  play(): void {
    this.stop();
    this.startedAt = performance.now();
    const tick = (): void => {
      const seconds = ((performance.now() - this.startedAt) / 1000) % Math.max(this.duration, 0.001);
      this.seek(seconds);
      this.animationFrame = requestAnimationFrame(tick);
    };
    tick();
  }

  stop(): void {
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
  }
}
