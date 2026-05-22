import type { SceneNode } from "../types.js";

export class SceneGraph {
  private readonly nodes = new Map<string, SceneNode>();
  private readonly parents = new Map<string, string>();
  private roots: SceneNode[] = [];

  constructor(nodes: SceneNode[] = []) {
    for (const node of nodes) this.upsert(node);
  }

  upsert(node: SceneNode): void {
    const clone = structuredClone(node);
    const existing = this.nodes.get(node.id);
    if (!existing) {
      this.roots.push(clone);
      this.registerSubtree(clone);
      return;
    }

    const parentId = this.parents.get(node.id);
    if (parentId) {
      const parent = this.nodes.get(parentId);
      const index = parent?.children.findIndex((child) => child.id === node.id) ?? -1;
      this.unregisterSubtree(existing);
      if (parent && index >= 0) {
        parent.children[index] = clone;
        this.registerSubtree(clone, parent.id);
        return;
      }
    }

    const index = this.roots.findIndex((root) => root.id === node.id);
    this.unregisterSubtree(existing);
    if (index >= 0) this.roots[index] = clone;
    else this.roots.push(clone);
    this.registerSubtree(clone);
  }

  delete(id: string): void {
    const node = this.nodes.get(id);
    if (!node) return;

    const parentId = this.parents.get(id);
    if (parentId) {
      const parent = this.nodes.get(parentId);
      if (parent) parent.children = parent.children.filter((child) => child.id !== id);
    } else {
      this.roots = this.roots.filter((root) => root.id !== id);
    }
    this.unregisterSubtree(node);
  }

  get(id: string): SceneNode | undefined {
    return this.nodes.get(id);
  }

  all(): SceneNode[] {
    return [...this.roots];
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

  setPathData(id: string, d: string): void {
    this.setPath(id, "geometry.d", d);
  }

  private registerSubtree(node: SceneNode, parentId?: string): void {
    this.nodes.set(node.id, node);
    if (parentId) this.parents.set(node.id, parentId);
    else this.parents.delete(node.id);
    for (const child of node.children ?? []) this.registerSubtree(child, node.id);
  }

  private unregisterSubtree(node: SceneNode): void {
    this.nodes.delete(node.id);
    this.parents.delete(node.id);
    for (const child of node.children ?? []) this.unregisterSubtree(child);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
