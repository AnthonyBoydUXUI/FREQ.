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

export type GuideCopy = {
  do: string;
  hint: string | null;
};

export function actionGuide(state: GuideState): string {
  return guideCopy(state).do;
}

export function guideCopy({
  phase,
  hovered,
  inside,
  artworkId = "armor",
  pendingTravelId,
  dailyCaption,
}: GuideState): GuideCopy {
  if (pendingTravelId) {
    return {
      do: `Wait. The next picture is opening: ${artworkById[pendingTravelId].title}.`,
      hint: "You are leaving this world and going into another drawing.",
    };
  }
  if (phase === "touch" || phase === "transform" || phase === "enter") {
    return {
      do: "Wait. The picture is opening.",
      hint: "Stay with it. You are going inside the drawing.",
    };
  }
  if (phase === "explore") {
    const next = artworkById[nextArtworkId(artworkId)].title;
    return {
      do: "Slide to look around. Press Go back when you want the picture again.",
      hint: `You can also press Next picture to open ${next}.`,
    };
  }
  if (phase === "return") {
    return {
      do: "Wait. You are coming back to the picture.",
      hint: null,
    };
  }
  if (hovered && regionById[hovered]) {
    const region = regionById[hovered];
    return {
      do: region.approach,
      hint: region.meaning,
    };
  }
  if (inside) {
    return {
      do: "You are on the picture. Touch it to go inside.",
      hint: stillHint(dailyCaption),
    };
  }
  return {
    do: "Touch the picture to go inside. There is a world in the drawing.",
    hint: stillHint(dailyCaption),
  };
}

function stillHint(dailyCaption?: string) {
  const sides = "The small pictures on the sides open too.";
  return dailyCaption ? `${dailyCaption} ${sides}` : sides;
}

export function sheetInvite({
  phase,
  hovered,
}: GuideState): string | null {
  if (
    phase === "touch" ||
    phase === "transform" ||
    phase === "enter" ||
    phase === "explore" ||
    phase === "return"
  ) {
    return null;
  }
  if (hovered && isPortalRegion(hovered)) {
    return "Touch here to go in";
  }
  if (hovered) {
    return "Touch here too";
  }
  return "Touch to go inside";
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
