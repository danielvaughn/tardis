import { expect, test, describe } from "bun:test";
import { Tardis } from "./tardis";

describe("Tardis", () => {
  test("should handle undo", () => {
    const initial = {
      items: [
        {
          id: 1,
          name: "Item 1",
        },
      ],
    };

    const tardis = new Tardis(initial, 1000, () => {});
  });

  test("should append data and handle undo/redo", () => {
    const initial = {
      items: [{ id: 1, name: "Item 1" }],
    };
    const tardis = new Tardis(initial, 1000, () => {});

    tardis.do("append", ["items", 1], { id: 2, name: "Item 2" });
    expect(initial.items.length).toBe(2);
    expect(initial.items[1]).toEqual({ id: 2, name: "Item 2" });

    tardis.undo();
    expect(initial.items.length).toBe(1);
    expect(initial.items[0]).toEqual({ id: 1, name: "Item 1" });

    tardis.redo();
    expect(initial.items.length).toBe(2);
    expect(initial.items[1]).toEqual({ id: 2, name: "Item 2" });
  });

  test("should handle replace operations", () => {
    const initial = {
      user: { name: "John", age: 30 },
    };
    const tardis = new Tardis(initial, 1000, () => {});
    tardis.do("replace", ["user", "name"], "Jane");
    expect(initial.user.name).toBe("Jane");
    tardis.undo();
    expect(initial.user.name).toBe("John");
    tardis.redo();
    expect(initial.user.name).toBe("Jane");
  });

  test("should handle delete operations", () => {
    const initial = {
      tags: ["one", "two", "three"],
    };
    const tardis = new Tardis(initial, 1000, () => {});
    tardis.do("delete", ["tags", 1]);
    expect(initial.tags).toEqual(["one", "three"]);
    tardis.undo();
    expect(initial.tags).toEqual(["one", "two", "three"]);
    tardis.redo();
    expect(initial.tags).toEqual(["one", "three"]);
  });

  test("should handle nested operations", () => {
    const initial = {
      users: [{ id: 1, settings: { theme: "light" } }],
    };
    const tardis = new Tardis(initial, 1000, () => {});
    tardis.do("replace", ["users", 0, "settings", "theme"], "dark");
    expect(initial.users[0]?.settings.theme).toBe("dark");
    tardis.undo();
    expect(initial.users[0]?.settings.theme).toBe("light");
  });
});
