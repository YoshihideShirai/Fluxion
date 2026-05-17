import { Player } from "./runtime/player.js";
import { SvgRenderer } from "./renderers/svgRenderer.js";
import type { VanimDocument } from "./types.js";

export async function loadVanim(url: string): Promise<VanimDocument> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
  return (await response.json()) as VanimDocument;
}

export async function mountFluxion(container: Element, url: string): Promise<Player> {
  const documentData = await loadVanim(url);
  return mountFluxionDocument(container, documentData);
}

export function mountFluxionDocument(container: Element, documentData: VanimDocument): Player {
  const renderer = new SvgRenderer(container, documentData.width, documentData.height);
  const player = new Player(documentData, renderer);
  player.seek(0);
  return player;
}

if (typeof window !== "undefined") {
  Object.assign(window, { mountFluxion, mountFluxionDocument });
}
