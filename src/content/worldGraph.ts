import type { ArtworkId, RegionId } from "@/engine/types";
import { isArtworkId } from "@/engine/types";

export type GraphKind = "encounter" | "world";

export type GraphNode = {
  id: string;
  artworkId: ArtworkId;
  regionId?: RegionId;
  kind: GraphKind;
  title: string;
};

export type GraphEdge = {
  from: string;
  to: string;
  via: string;
  transition: "helmet-open" | "collapse" | "travel";
};

export const TERRITORY_ORDER: ArtworkId[] = ["armor", "facet", "signal"];

export const worldGraph = {
  version: 2,
  nodes: [
    {
      id: "armor.encounter",
      artworkId: "armor" as const,
      kind: "encounter" as const,
      title: "Armor",
    },
    {
      id: "armor.cowl.nave",
      artworkId: "armor" as const,
      regionId: "cowl" as const,
      kind: "world" as const,
      title: "Nave",
    },
    {
      id: "facet.encounter",
      artworkId: "facet" as const,
      kind: "encounter" as const,
      title: "Facet",
    },
    {
      id: "facet.visor.chamber",
      artworkId: "facet" as const,
      regionId: "visor" as const,
      kind: "world" as const,
      title: "Chamber",
    },
    {
      id: "signal.encounter",
      artworkId: "signal" as const,
      kind: "encounter" as const,
      title: "Signal",
    },
    {
      id: "signal.crown.relay",
      artworkId: "signal" as const,
      regionId: "crown" as const,
      kind: "world" as const,
      title: "Relay",
    },
  ] satisfies GraphNode[],
  edges: [
    {
      from: "armor.encounter",
      to: "armor.cowl.nave",
      via: "cowl",
      transition: "helmet-open",
    },
    {
      from: "armor.cowl.nave",
      to: "armor.encounter",
      via: "origin-mural",
      transition: "collapse",
    },
    {
      from: "armor.cowl.nave",
      to: "facet.encounter",
      via: "far-mark",
      transition: "travel",
    },
    {
      from: "facet.encounter",
      to: "facet.visor.chamber",
      via: "visor",
      transition: "helmet-open",
    },
    {
      from: "facet.visor.chamber",
      to: "facet.encounter",
      via: "origin-mural",
      transition: "collapse",
    },
    {
      from: "facet.visor.chamber",
      to: "signal.encounter",
      via: "far-mark",
      transition: "travel",
    },
    {
      from: "signal.encounter",
      to: "signal.crown.relay",
      via: "crown",
      transition: "helmet-open",
    },
    {
      from: "signal.crown.relay",
      to: "signal.encounter",
      via: "origin-mural",
      transition: "collapse",
    },
    {
      from: "signal.crown.relay",
      to: "armor.encounter",
      via: "far-mark",
      transition: "travel",
    },
  ] satisfies GraphEdge[],
};

export function encounterNodeId(artworkId: ArtworkId): string {
  return `${artworkId}.encounter`;
}

export function worldNodeId(artworkId: ArtworkId): string {
  const node = worldGraph.nodes.find(
    (item) => item.artworkId === artworkId && item.kind === "world",
  );
  if (!node) throw new Error(`Missing world node for ${artworkId}`);
  return node.id;
}

export function nextArtworkId(artworkId: ArtworkId): ArtworkId {
  const index = TERRITORY_ORDER.indexOf(artworkId);
  return TERRITORY_ORDER[(index + 1) % TERRITORY_ORDER.length];
}

export function previousArtworkId(artworkId: ArtworkId): ArtworkId {
  const index = TERRITORY_ORDER.indexOf(artworkId);
  return TERRITORY_ORDER[(index + TERRITORY_ORDER.length - 1) % TERRITORY_ORDER.length];
}

export function travelTarget(fromWorldNodeId: string): ArtworkId | null {
  const edge = worldGraph.edges.find(
    (item) => item.from === fromWorldNodeId && item.transition === "travel",
  );
  if (!edge) return null;
  const node = worldGraph.nodes.find((item) => item.id === edge.to);
  return node?.artworkId ?? null;
}

export function parseArtworkParam(value: string | undefined | null): ArtworkId | null {
  if (!value) return null;
  return isArtworkId(value) ? value : null;
}

export function worldTitle(artworkId: ArtworkId): string {
  return (
    worldGraph.nodes.find((item) => item.artworkId === artworkId && item.kind === "world")
      ?.title ?? "World"
  );
}
