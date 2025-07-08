import { expect, test, describe } from "bun:test";
import { History } from "./history"; // can keep .ts extension with Bun!

describe("History", () => {
  test("basic operations", () => {
    const history = new History<string>(5);

    // Test adding items
    history.add("A");
    history.add("B");
    history.add("C");

    // Test undo
    expect(history.shift("dec")).toBe("C");
    expect(history.shift("dec")).toBe("B");
    expect(history.shift("dec")).toBe("A");
    expect(history.shift("dec")).toBeNull();

    // Test redo
    expect(history.shift("inc")).toBe("A");
    expect(history.shift("inc")).toBe("B");
    expect(history.shift("inc")).toBe("C");

    expect(history.shift("inc")).toBeNull();
  });

  test("branching history", () => {
    const history = new History<string>(5);

    // Create initial timeline
    history.add("A");
    history.add("B");
    history.add("C");

    // Undo back to A and create new branch
    history.shift("dec");
    history.shift("dec");
    history.add("D");

    // B and C should be discarded
    expect(history.shift("inc")).toBeNull();
    expect(history.shift("dec")).toBe("D");
    expect(history.shift("dec")).toBe("A");
  });

  test("respects size limit", () => {
    const history = new History<string>(3);

    history.add("A");
    history.add("B");
    history.add("C");
    history.add("D");

    // A should be dropped, starting at B
    expect(history.shift("dec")).toBe("D");
    expect(history.shift("dec")).toBe("C");
    expect(history.shift("dec")).toBe("B");
    expect(history.shift("dec")).toBeNull();
  });
});
