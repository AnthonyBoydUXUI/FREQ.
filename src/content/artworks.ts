import catalogJson from "@/content/generated/catalog.json";
import armorStrokes from "@/content/generated/armor-strokes.json";
import type { RegionId, Vec2 } from "@/engine/types";

export type ArtworkId = "armor" | "facet" | "signal";

export type RegionRecord = {
  id: RegionId;
  label: string;
  role: "helmet" | "structure" | "threshold";
  polygon: Vec2[];
  mask: string;
  meaning: string;
  sonic: string;
  accessibleLabel: string;
};

export type ArtworkRecord = {
  id: ArtworkId;
  title: string;
  hero: boolean;
  width: number;
  height: number;
  paths: {
    archival: string;
    display: string;
    depth: string;
    paper: string;
    linework: string;
    shadows: string;
  };
  alt: string;
};

const REGION_COPY: Record<
  RegionId,
  Omit<RegionRecord, "id" | "label" | "role" | "polygon" | "mask">
> = {
  cowl: {
    meaning:
      "The vaulted upper form. A helmet, a roof, a nave waiting inside a single curve.",
    sonic: "Low architectural tone. Metal under paper.",
    accessibleLabel:
      "Cowl. The vaulted upper form of the drawing. Activate to open the helmet and enter the world inside the mark.",
  },
  plates: {
    meaning: "Overlapping plates and rivets. Structure that could become streets.",
    sonic: "Dense hatching. Dry graphite grain.",
    accessibleLabel:
      "Plates. Segmented armor in the center of the drawing. The surface lifts, but this region does not yet open a world.",
  },
  forward: {
    meaning: "The blunt forward node. A threshold, not yet a door.",
    sonic: "Quieter paper. A held breath.",
    accessibleLabel:
      "Forward node. The rounded front of the drawing. It responds to attention, but the world opens through the cowl.",
  },
};

type Catalog = {
  audio: Record<string, string>;
  artworks: Array<{
    id: ArtworkId;
    title: string;
    hero: boolean;
    width: number;
    height: number;
    paths: ArtworkRecord["paths"];
    regions?: Record<
      RegionId,
      {
        id: RegionId;
        label: string;
        role: RegionRecord["role"];
        polygon: number[][];
        mask: string;
      }
    >;
  }>;
};

const catalog = catalogJson as Catalog;

export const audioPaths = catalog.audio;

const ALT: Record<ArtworkId, string> = {
  armor:
    "Original hand drawing of an armored mechanical form on wrinkled tracing paper, with a vaulted cowl, overlapping plates, and a blunt forward node.",
  facet:
    "Original hand drawing of a faceted helmet-like head with horn-like protrusions on wrinkled tracing paper.",
  signal:
    "Original hand drawing of a mechanical head in profile with a hatched crown and segmented neck on translucent paper.",
};

export const artworks: ArtworkRecord[] = catalog.artworks.map((artwork) => ({
  id: artwork.id,
  title: artwork.title,
  hero: artwork.hero,
  width: artwork.width,
  height: artwork.height,
  paths: artwork.paths,
  alt: ALT[artwork.id],
}));

export const heroArtwork = artworks.find((item) => item.hero)!;

const armorRegions = catalog.artworks.find((item) => item.id === "armor")?.regions;

if (!armorRegions) {
  throw new Error("Armor regions are missing from the generated catalog.");
}

export const regions: RegionRecord[] = (Object.keys(armorRegions) as RegionId[]).map(
  (id) => {
    const source = armorRegions[id];
    return {
      id,
      label: source.label,
      role: source.role,
      polygon: source.polygon as unknown as Vec2[],
      mask: source.mask,
      ...REGION_COPY[id],
    };
  },
);

export const regionById = Object.fromEntries(
  regions.map((region) => [region.id, region]),
) as Record<RegionId, RegionRecord>;

export type StrokePoint = { x: number; y: number; d: number };

export const graphiteStrokes = armorStrokes as StrokePoint[];

export const worldGraph = {
  version: 1,
  nodes: [
    {
      id: "armor.encounter",
      artworkId: "armor" as const,
      kind: "encounter" as const,
    },
    {
      id: "armor.cowl.nave",
      artworkId: "armor" as const,
      regionId: "cowl" as const,
      kind: "world" as const,
    },
    {
      id: "facet.territory",
      artworkId: "facet" as const,
      kind: "latent" as const,
    },
    {
      id: "signal.territory",
      artworkId: "signal" as const,
      kind: "latent" as const,
    },
  ],
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
  ],
};

function rot90cw(uv: Vec2[]): Vec2[] {
  return uv.map(([u, v]) => [1 - v, u]);
}

export const cowlPanels: { id: string; uv: Vec2[] }[] = [
  {
    id: "crown",
    uv: rot90cw([
      [0.06, 0.38],
      [0.22, 0.34],
      [0.24, 0.52],
      [0.06, 0.56],
    ]),
  },
  {
    id: "left-plate",
    uv: rot90cw([
      [0.04, 0.48],
      [0.18, 0.5],
      [0.16, 0.72],
      [0.04, 0.7],
    ]),
  },
  {
    id: "right-plate",
    uv: rot90cw([
      [0.2, 0.36],
      [0.36, 0.42],
      [0.3, 0.62],
      [0.18, 0.54],
    ]),
  },
  {
    id: "visor",
    uv: rot90cw([
      [0.1, 0.5],
      [0.26, 0.48],
      [0.24, 0.66],
      [0.1, 0.68],
    ]),
  },
  {
    id: "nape",
    uv: rot90cw([
      [0.08, 0.64],
      [0.28, 0.62],
      [0.26, 0.76],
      [0.08, 0.76],
    ]),
  },
];
