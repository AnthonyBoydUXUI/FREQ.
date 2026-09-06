import catalogJson from "@/content/generated/catalog.json";
import armorStrokes from "@/content/generated/armor-strokes.json";
import facetStrokes from "@/content/generated/facet-strokes.json";
import signalStrokes from "@/content/generated/signal-strokes.json";
import type { ArtworkId, RegionId, Vec2 } from "@/engine/types";
import { polygonBounds } from "@/semantic/hitTest";

export type ImageUvRect = {
  u0: number;
  v0: number;
  u1: number;
  v1: number;
};

export type RegionRole = "helmet" | "structure" | "threshold";

export type RegionRecord = {
  id: RegionId;
  artworkId: ArtworkId;
  label: string;
  role: RegionRole;
  polygon: Vec2[];
  mask: string;
  meaning: string;
  sonic: string;
  accessibleLabel: string;
  approach: string;
  portal: boolean;
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
  portalId: RegionId;
  worldName: string;
};

const REGION_COPY: Record<
  RegionId,
  Omit<RegionRecord, "id" | "label" | "role" | "polygon" | "mask" | "artworkId" | "portal">
> = {
  cowl: {
    meaning:
      "The vaulted upper form. A helmet, a roof, a nave waiting inside a single curve.",
    sonic: "Low architectural tone. Metal under paper.",
    accessibleLabel:
      "Helmet. Touch the helmet to open the picture and go inside the drawing.",
    approach: "Touch the helmet. This is the way in.",
  },
  plates: {
    meaning: "Overlapping plates and rivets. Structure that could become streets.",
    sonic: "Dense hatching. Dry graphite grain.",
    accessibleLabel:
      "Armor plates. You can touch here too. The picture will still open.",
    approach: "You can touch here too. The picture will still open.",
  },
  forward: {
    meaning: "The blunt forward node. A threshold, not yet a door.",
    sonic: "Quieter paper. A held breath.",
    accessibleLabel:
      "Front of the drawing. You can touch here too. The picture will still open.",
    approach: "You can touch here too. The picture will still open.",
  },
  visor: {
    meaning: "The dark band across the faceted head. A slit that can become a room.",
    sonic: "A thinner metallic edge. Paper folded once.",
    accessibleLabel:
      "Visor. Touch this dark band to open the picture and go inside.",
    approach: "Touch this dark band. This is the way in.",
  },
  horns: {
    meaning: "Antenna-like horns. Structure above the visor, not a second door.",
    sonic: "Dry points of graphite. A scratch more than a tone.",
    accessibleLabel:
      "Horns. You can touch here too. The picture will still open.",
    approach: "You can touch here too. The picture will still open.",
  },
  harness: {
    meaning: "Layered plates of the torso. A harness that could become a floor.",
    sonic: "Heavier hatching. Graphite laid in rows.",
    accessibleLabel:
      "Harness. You can touch here too. The picture will still open.",
    approach: "You can touch here too. The picture will still open.",
  },
  crown: {
    meaning: "Jagged strokes at the top of the head. A crown that can become a vault.",
    sonic: "Quick vertical grain. Paper catching at the edge.",
    accessibleLabel:
      "Crown. Touch the jagged top to open the picture and go inside.",
    approach: "Touch the jagged top. This is the way in.",
  },
  mask: {
    meaning: "The banded covering over the face. A mask that remains a mask.",
    sonic: "Horizontal hatching. A held vowel.",
    accessibleLabel:
      "Mask. You can touch here too. The picture will still open.",
    approach: "You can touch here too. The picture will still open.",
  },
  strap: {
    meaning: "The strap and collar plates. A threshold along the neck.",
    sonic: "Quieter paper under the jaw.",
    accessibleLabel:
      "Strap. You can touch here too. The picture will still open.",
    approach: "You can touch here too. The picture will still open.",
  },
};

type CatalogRegion = {
  id: RegionId;
  label: string;
  role: RegionRole;
  polygon: number[][];
  mask: string;
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
    regions: Partial<Record<RegionId, CatalogRegion>>;
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

const PORTAL_ID: Record<ArtworkId, RegionId> = {
  armor: "cowl",
  facet: "visor",
  signal: "crown",
};

const WORLD_NAME: Record<ArtworkId, string> = {
  armor: "Nave",
  facet: "Chamber",
  signal: "Relay",
};

export const artworks: ArtworkRecord[] = catalog.artworks.map((artwork) => ({
  id: artwork.id,
  title: artwork.title,
  hero: artwork.hero,
  width: artwork.width,
  height: artwork.height,
  paths: artwork.paths,
  alt: ALT[artwork.id],
  portalId: PORTAL_ID[artwork.id],
  worldName: WORLD_NAME[artwork.id],
}));

export const artworkById = Object.fromEntries(
  artworks.map((artwork) => [artwork.id, artwork]),
) as Record<ArtworkId, ArtworkRecord>;

export const heroArtwork = artworks.find((item) => item.hero)!;

function regionsFromCatalog(artwork: Catalog["artworks"][number]): RegionRecord[] {
  const source = artwork.regions;
  if (!source) {
    throw new Error(`Regions are missing from the generated catalog for ${artwork.id}.`);
  }
  return (Object.keys(source) as RegionId[]).map((id) => {
    const region = source[id];
    if (!region) throw new Error(`Missing region ${id} on ${artwork.id}`);
    return {
      id,
      artworkId: artwork.id,
      label: region.label,
      role: region.role,
      polygon: region.polygon as unknown as Vec2[],
      mask: region.mask,
      portal: region.role === "helmet",
      ...REGION_COPY[id],
    };
  });
}

export const allRegions: RegionRecord[] = catalog.artworks.flatMap(regionsFromCatalog);

export const regionById = Object.fromEntries(
  allRegions.map((region) => [region.id, region]),
) as Record<RegionId, RegionRecord>;

export function regionsFor(artworkId: ArtworkId): RegionRecord[] {
  return allRegions.filter((region) => region.artworkId === artworkId);
}

export function portalFor(artworkId: ArtworkId): RegionRecord {
  const portal = regionsFor(artworkId).find((region) => region.portal);
  if (!portal) throw new Error(`No portal region for ${artworkId}`);
  return portal;
}

export function isPortalRegion(id: RegionId | null | undefined): boolean {
  if (!id) return false;
  return regionById[id]?.portal === true;
}

export type StrokePoint = { x: number; y: number; d: number };

const STROKES: Record<ArtworkId, StrokePoint[]> = {
  armor: armorStrokes as StrokePoint[],
  facet: facetStrokes as StrokePoint[],
  signal: signalStrokes as StrokePoint[],
};

export function strokesFor(artworkId: ArtworkId): StrokePoint[] {
  return STROKES[artworkId];
}

/** @deprecated Armor-only alias kept for older tests; prefer strokesFor. */
export const graphiteStrokes = STROKES.armor;

function rot90cw(uv: Vec2[]): Vec2[] {
  return uv.map(([u, v]) => [1 - v, u]);
}

const ARMOR_COWL_PANELS: { id: string; uv: Vec2[] }[] = [
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

export function panelsFromPolygon(polygon: readonly Vec2[]): { id: string; uv: Vec2[] }[] {
  const box = polygonBounds(polygon);
  const mx = (box.minX + box.maxX) / 2;
  const my = (box.minY + box.maxY) / 2;
  return [
    {
      id: "nw",
      uv: [
        [box.minX, box.minY],
        [mx, box.minY],
        [mx, my],
        [box.minX, my],
      ],
    },
    {
      id: "ne",
      uv: [
        [mx, box.minY],
        [box.maxX, box.minY],
        [box.maxX, my],
        [mx, my],
      ],
    },
    {
      id: "sw",
      uv: [
        [box.minX, my],
        [mx, my],
        [mx, box.maxY],
        [box.minX, box.maxY],
      ],
    },
    {
      id: "se",
      uv: [
        [mx, my],
        [box.maxX, my],
        [box.maxX, box.maxY],
        [mx, box.maxY],
      ],
    },
  ];
}

export function portalPanels(artworkId: ArtworkId): { id: string; uv: Vec2[] }[] {
  if (artworkId === "armor") return ARMOR_COWL_PANELS;
  return panelsFromPolygon(portalFor(artworkId).polygon);
}

/** @deprecated Armor-only alias; prefer portalPanels("armor"). */
export const cowlPanels = ARMOR_COWL_PANELS;

export type InteriorLayout = {
  floor: ImageUvRect;
  left: ImageUvRect;
  right: ImageUvRect;
  vault: ImageUvRect;
  tape: ImageUvRect;
  scale: number;
};

export const interiors: Record<ArtworkId, InteriorLayout> = {
  armor: {
    floor: { u0: 0.24, v0: 0.3, u1: 0.8, v1: 0.9 },
    left: { u0: 0.0, v0: 0.02, u1: 0.36, v1: 0.6 },
    right: { u0: 0.64, v0: 0.08, u1: 1.0, v1: 0.82 },
    vault: { u0: 0.18, v0: 0.02, u1: 0.74, v1: 0.38 },
    tape: { u0: 0.05, v0: 0.62, u1: 0.95, v1: 1.0 },
    scale: 2.55,
  },
  facet: {
    floor: { u0: 0.16, v0: 0.48, u1: 0.68, v1: 0.94 },
    left: { u0: 0.04, v0: 0.18, u1: 0.4, v1: 0.62 },
    right: { u0: 0.48, v0: 0.16, u1: 0.92, v1: 0.55 },
    vault: { u0: 0.3, v0: 0.04, u1: 0.78, v1: 0.32 },
    tape: { u0: 0.08, v0: 0.7, u1: 0.96, v1: 1.0 },
    scale: 2.55,
  },
  signal: {
    floor: { u0: 0.16, v0: 0.5, u1: 0.86, v1: 0.92 },
    left: { u0: 0.04, v0: 0.02, u1: 0.42, v1: 0.36 },
    right: { u0: 0.38, v0: 0.24, u1: 0.88, v1: 0.62 },
    vault: { u0: 0.08, v0: 0.0, u1: 0.48, v1: 0.28 },
    tape: { u0: 0.1, v0: 0.72, u1: 0.96, v1: 1.0 },
    scale: 2.55,
  },
};

export { worldGraph } from "@/content/worldGraph";
