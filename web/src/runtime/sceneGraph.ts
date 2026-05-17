import type { SceneNode } from "../types.js";

export class SceneGraph {
  private readonly nodes = new Map<string, SceneNode>();

  constructor(nodes: SceneNode[] = []) {
    for (const node of nodes) this.upsert(node);
  }

  upsert(node: SceneNode): void {
    this.nodes.set(node.id, structuredClone(node));
  }

  delete(id: string): void {
    this.nodes.delete(id);
  }

  get(id: string): SceneNode | undefined {
    return this.nodes.get(id);
  }

  all(): SceneNode[] {
    return [...this.nodes.values()];
  }

  setPath(id: string, path: string, value: unknown): void {
    const node = this.get(id);
    if (!node) return;

    const parts = path.split(".");
    const leaf = parts.at(-1);
    if (!leaf) return;

    let current: Record<string, unknown> = node as unknown as Record<string, unknown>;
    for (const part of parts.slice(0, -1)) {
      const next = current[part];
      if (!isRecord(next)) return;
      current = next;
    }
    current[leaf] = value;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
