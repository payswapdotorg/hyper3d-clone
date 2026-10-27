import { describe, it, expect } from "vitest";
import {
  addView,
  canAddView,
  engineSlots,
  nextFreeDirection,
  removeView,
  tierAllowsViews,
  viewCount,
  type DirectionState,
} from "./direction-picker";

const view = (n: string) => ({ dataUrl: `data:image/png;base64,${n}`, name: `${n}.png` });

function fillAll(): DirectionState {
  return {
    front: view("f"),
    back: view("b"),
    left: view("l"),
    right: view("r"),
  };
}

describe("direction-picker (multiview state)", () => {
  it("starts empty and skippable — engineSlots all null, single-image flow unaffected", () => {
    const state: DirectionState = {};
    expect(viewCount(state)).toBe(0);
    expect(canAddView(state)).toBe(true);
    expect(engineSlots(state)).toEqual([null, null, null, null]);
  });

  it("nextFreeDirection walks the 11-label reading order and stops at the 4-view cap", () => {
    let state: DirectionState = {};
    const order: string[] = [];
    for (let i = 0; i < 4; i++) {
      const dir = nextFreeDirection(state);
      expect(dir).not.toBeNull();
      order.push(dir as string);
      const added = addView(state, dir as string, view(`v${i}`));
      expect(added.ok).toBe(true);
      state = added.ok ? added.state : state;
    }
    // Reading order per VIEW_DIRECTIONS: FL, F, FR, L, … — the cap (4) hits first.
    expect(order).toEqual(["front-left", "front", "front-right", "left"]);
    expect(canAddView(state)).toBe(false);
    // With every direction occupied (hand-built, past the addView cap),
    // there is no free direction left.
    const all: DirectionState = {};
    for (const dir of [
      "front-left", "front", "front-right", "left", "up",
      "right", "back-left", "back", "back-right", "down", "unknown",
    ] as const) {
      all[dir] = view(dir);
    }
    expect(nextFreeDirection(all)).toBeNull();
  });

  it("addView stores the view in the requested direction", () => {
    const added = addView({}, "back", view("b"));
    expect(added.ok).toBe(true);
    if (added.ok) {
      expect(added.state.back?.name).toBe("b.png");
      expect(viewCount(added.state)).toBe(1);
    }
  });

  it("addView rejects an occupied direction with an explicit reason", () => {
    const first = addView({}, "front", view("f1"));
    const second = addView(first.state, "front", view("f2"));
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.reason).toBe("occupied");
  });

  it("caps at 4 extra views — the fifth add is rejected as full", () => {
    const full = fillAll();
    expect(canAddView(full)).toBe(false);
    const fifth = addView(full, "front", view("x"));
    expect(fifth.ok).toBe(false);
    if (!fifth.ok) expect(fifth.reason).toBe("full");
  });

  it("removeView frees the slot for re-add", () => {
    const state = fillAll();
    const after = removeView(state, "left");
    expect(after.left).toBeUndefined();
    expect(viewCount(after)).toBe(3);
    const readd = addView(after, "left", view("left2"));
    expect(readd.ok).toBe(true);
  });

  it("engineSlots returns the exact F/B/L/R order with null holes", () => {
    const state = addView(addView({}, "right", view("r")).state, "front", view("f")).state;
    const slots = engineSlots(state);
    expect(slots).toHaveLength(4);
    expect(slots[0]?.name).toBe("f.png");
    expect(slots[1]).toBeNull();
    expect(slots[2]).toBeNull();
    expect(slots[3]?.name).toBe("r.png");
  });

  it("multiview is a quality-tier affordance only — the step is hidden on fast", () => {
    expect(tierAllowsViews("quality")).toBe(true);
    expect(tierAllowsViews("fast")).toBe(false);
  });
});
