import type { ArtworkId, Phase, RegionId } from "@/engine/types";
import { isPortalRegion, regionById, artworkById } from "@/content/artworks";
import { nextArtworkId } from "@/content/worldGraph";

export type GuideState = {
  phase: Phase;
  hovered: RegionId | null;
  inside: boolean;
  artworkId?: ArtworkId;
  pendingTravelId?: ArtworkId | null;
  dailyCaption?: string;
};

export function actionGuide({
  phase,
  hovered,
  inside,
  artworkId = "armor",
  pendingTravelId,
  dailyCaption,
}: GuideState): string {
  if (pendingTravelId) {
    return `The world is closing. ${artworkById[pendingTravelId].title} is waiting.`;
  }
  if (phase === "touch" || phase === "transform" || phase === "enter") {
    return "Stay. The drawing is opening.";
  }
  if (phase === "explore") {
    return `Drag to look around. The far mark opens ${artworkById[nextArtworkId(artworkId)].title}. Return closes this world.`;
  }
  if (phase === "return") {
    return "The world is closing back into the drawing.";
  }
  if (hovered && regionById[hovered]) {
    return regionById[hovered].approach;
  }
  if (inside) {
    return "Touch to enter the world inside.";
  }
  if (dailyCaption) {
    return `${dailyCaption} Move over the drawing.`;
  }
  return "Move over the drawing. Touch it to enter.";
}

export function cursorIntent({
  phase,
  hovered,
  inside,
}: GuideState): "idle" | "touch" | "notice" | "enter" | "look" {
  if (phase === "explore") return "look";
  if (phase === "touch" || phase === "transform" || phase === "enter") return "enter";
  if (isPortalRegion(hovered) || (inside && !hovered)) return "enter";
  if (hovered) return "notice";
  if (inside) return "touch";
  return "idle";
}
