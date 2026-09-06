import { describe, expect, it } from "vitest";
import { actionGuide, cursorIntent } from "@/ui/guide";

describe("actionGuide", () => {
  it("tells a still visitor to approach and touch", () => {
    expect(actionGuide({ phase: "encounter", hovered: null, inside: false })).toBe(
      "Move over the drawing. Touch it to enter.",
    );
  });

  it("confirms a touch on the sheet will enter", () => {
    expect(actionGuide({ phase: "encounter", hovered: null, inside: true })).toBe(
      "Touch to enter the world inside.",
    );
  });

  it("names the helmet as the door when it is under the pointer", () => {
    expect(actionGuide({ phase: "approach", hovered: "cowl", inside: true })).toBe(
      "The helmet can open. Touch to enter.",
    );
  });

  it("keeps plates as a response, not a second world", () => {
    expect(actionGuide({ phase: "response", hovered: "plates", inside: true })).toContain(
      "Touch to enter through the helmet.",
    );
  });

  it("explains how to move once inside", () => {
    expect(actionGuide({ phase: "explore", hovered: null, inside: false })).toBe(
      "Drag to look around. Return when you are ready.",
    );
  });
});

describe("cursorIntent", () => {
  it("invites a click on the sheet and the helmet", () => {
    expect(cursorIntent({ phase: "encounter", hovered: null, inside: true })).toBe("enter");
    expect(cursorIntent({ phase: "approach", hovered: "cowl", inside: true })).toBe("enter");
  });

  it("becomes a look cursor inside the world", () => {
    expect(cursorIntent({ phase: "explore", hovered: null, inside: false })).toBe("look");
  });
});
