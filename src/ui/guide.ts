import type { Phase, RegionId } from "@/engine/types";

export type GuideState = {
  phase: Phase;
  hovered: RegionId | null;
  inside: boolean;
};

export function actionGuide({ phase, hovered, inside }: GuideState): string {
  if (phase === "touch" || phase === "transform" || phase === "enter") {
    return "Stay. The drawing is opening.";
  }
  if (phase === "explore") {
    return "Drag to look around. Return when you are ready.";
  }
  if (phase === "return") {
    return "The world is closing back into the drawing.";
  }
  if (hovered === "cowl") {
    return "The helmet can open. Touch to enter.";
  }
  if (hovered === "plates") {
    return "The plates respond. Touch to enter through the helmet.";
  }
  if (hovered === "forward") {
    return "A threshold. Touch to enter through the helmet.";
  }
  if (inside) {
    return "Touch to enter the world inside.";
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
  if (hovered === "cowl" || (inside && !hovered)) return "enter";
  if (hovered) return "notice";
  if (inside) return "touch";
  return "idle";
}
