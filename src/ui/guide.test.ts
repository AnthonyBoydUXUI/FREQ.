import { describe, expect, it } from "vitest";
import { actionGuide, cursorIntent, guideCopy, sheetInvite } from "@/ui/guide";

describe("actionGuide", () => {
  it("tells a still visitor to touch the picture and that a world is inside", () => {
    expect(actionGuide({ phase: "encounter", hovered: null, inside: false })).toBe(
      "Touch the picture to go inside. There is a world in the drawing.",
    );
  });

  it("confirms a touch on the sheet will enter", () => {
    expect(actionGuide({ phase: "encounter", hovered: null, inside: true })).toBe(
      "You are on the picture. Touch it to go inside.",
    );
  });

  it("names the helmet as the way in when it is under the pointer", () => {
    expect(actionGuide({ phase: "approach", hovered: "cowl", inside: true })).toBe(
      "Touch the helmet. This is the way in.",
    );
  });

  it("keeps plates as a way in through the same picture, not a second world", () => {
    expect(actionGuide({ phase: "response", hovered: "plates", inside: true })).toBe(
      "You can touch here too. The picture will still open.",
    );
  });

  it("names the visor on Facet", () => {
    expect(
      actionGuide({ phase: "approach", hovered: "visor", inside: true, artworkId: "facet" }),
    ).toBe("Touch this dark band. This is the way in.");
  });

  it("explains how to move once inside, and names the next picture as something you can open", () => {
    const copy = guideCopy({ phase: "explore", hovered: null, inside: false });
    expect(copy.do).toContain("Slide to look around");
    expect(copy.do).toContain("Go back");
    expect(copy.hint).toContain("Next picture");
    expect(copy.hint).toContain("Facet");
  });
});

describe("guideCopy", () => {
  it("keeps analog meaning on hover instead of replacing it with a tutorial", () => {
    const copy = guideCopy({ phase: "approach", hovered: "cowl", inside: true });
    expect(copy.hint).toMatch(/helmet/i);
    expect(copy.hint).toMatch(/nave/i);
  });

  it("names the side pictures so they are not decoration", () => {
    const copy = guideCopy({
      phase: "encounter",
      hovered: null,
      inside: false,
      dailyCaption: "Today the helmet feels slightly more open.",
    });
    expect(copy.hint).toContain("Today the helmet feels slightly more open.");
    expect(copy.hint).toContain("small pictures on the sides");
  });
});

describe("sheetInvite", () => {
  it("puts the verb on the drawing itself", () => {
    expect(sheetInvite({ phase: "encounter", hovered: null, inside: false })).toBe(
      "Touch to go inside",
    );
    expect(sheetInvite({ phase: "encounter", hovered: null, inside: true })).toBe("Touch now");
    expect(sheetInvite({ phase: "approach", hovered: "cowl", inside: true })).toBe(
      "Touch here to go in",
    );
  });

  it("leaves the drawing once the world is open", () => {
    expect(sheetInvite({ phase: "explore", hovered: null, inside: false })).toBeNull();
    expect(sheetInvite({ phase: "transform", hovered: null, inside: true })).toBeNull();
  });
});

describe("cursorIntent", () => {
  it("invites a click on the sheet and the helmet", () => {
    expect(cursorIntent({ phase: "encounter", hovered: null, inside: true })).toBe("enter");
    expect(cursorIntent({ phase: "approach", hovered: "cowl", inside: true })).toBe("enter");
    expect(cursorIntent({ phase: "approach", hovered: "visor", inside: true })).toBe("enter");
  });

  it("becomes a look cursor inside the world", () => {
    expect(cursorIntent({ phase: "explore", hovered: null, inside: false })).toBe("look");
  });
});
