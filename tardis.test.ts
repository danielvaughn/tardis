import { expect, test, describe } from "bun:test";
import { Tardis } from "./tardis";

describe("Tardis", () => {
  test("should be able to perform array insertions", () => {
    const data = {
      items: [{ id: 1, name: "Item 1" }],
    };
    const tardis = new Tardis(data, 1000, () => {});

    tardis.do("insert", ["items", 1], { id: 2, name: "Item 2" });

    expect(data.items[1]).toEqual({ id: 2, name: "Item 2" });
  });

  test("should be able to undo array insertions", () => {
    const data = {
      items: [{ id: 1, name: "Item 1" }],
    };
    const tardis = new Tardis(data, 1000, () => {});

    tardis.do("insert", ["items", 1], { id: 2, name: "Item 2" });
    tardis.undo();

    expect(data.items.length).toBe(1);
  });

  test("should be able to redo array insertions", () => {
    const data = {
      items: [{ id: 1, name: "Item 1" }],
    };
    const tardis = new Tardis(data, 1000, () => {});

    tardis.do("insert", ["items", 1], { id: 2, name: "Item 2" });
    tardis.undo();
    tardis.redo();

    expect(data.items[1]).toEqual({ id: 2, name: "Item 2" });
  });

  test("should handle update operations against objects", () => {
    const data = {
      user: { name: "John", age: 30 },
    };
    const tardis = new Tardis(data, 1000, () => {});

    tardis.do("update", ["user", "name"], "Jane");

    expect(data.user.name).toBe("Jane");
  });

  test("should be able to undo update operations against objects", () => {
    const data = {
      user: { name: "John", age: 30 },
    };
    const tardis = new Tardis(data, 1000, () => {});

    tardis.do("update", ["user", "name"], "Jane");
    tardis.undo();

    expect(data.user.name).toBe("John");
  });

  test("should be able to redo update operations against objects", () => {
    const data = {
      user: { name: "John", age: 30 },
    };
    const tardis = new Tardis(data, 1000, () => {});

    tardis.do("update", ["user", "name"], "Jane");
    tardis.undo();
    tardis.redo();

    expect(data.user.name).toBe("Jane");
  });

  test("should be able to perform array updates", () => {
    const data = {
      items: ["a", "b", "c", "d"],
    };
    const tardis = new Tardis(data, 1000, () => {});

    tardis.do("update", ["items", 2], "z");

    expect(data.items).toEqual(["a", "b", "z", "d"]);
  });

  test("should be able to undo array updates", () => {
    const data = {
      items: ["a", "b", "c", "d"],
    };
    const tardis = new Tardis(data, 1000, () => {});

    tardis.do("update", ["items", 2], "z");
    tardis.undo();

    expect(data.items).toEqual(["a", "b", "c", "d"]);
  });

  test("should be able to redo array updates", () => {
    const data = {
      items: ["a", "b", "c", "d"],
    };
    const tardis = new Tardis(data, 1000, () => {});

    tardis.do("update", ["items", 2], "z");
    tardis.undo();
    tardis.redo();

    expect(data.items).toEqual(["a", "b", "z", "d"]);
  });

  test("should be able to perform array deletions", () => {
    const data = {
      tags: ["one", "two", "three"],
    };
    const tardis = new Tardis(data, 1000, () => {});

    tardis.do("delete", ["tags", 1]);

    expect(data.tags).toEqual(["one", "three"]);
  });

  test("should be able to undo array deletions", () => {
    const data = {
      tags: ["one", "two", "three"],
    };
    const tardis = new Tardis(data, 1000, () => {});

    tardis.do("delete", ["tags", 1]);
    tardis.undo();

    expect(data.tags).toEqual(["one", "two", "three"]);
  });

  test("should be able to redo array deletions", () => {
    const data = {
      tags: ["one", "two", "three"],
    };
    const tardis = new Tardis(data, 1000, () => {});

    tardis.do("delete", ["tags", 1]);
    tardis.undo();
    tardis.redo();

    expect(data.tags).toEqual(["one", "three"]);
  });
});
