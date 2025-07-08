# Tardis

TypeScript library for efficient time-travel against any JSON-serializable object.
Named after Doctor Who, a being who can travel through time and take any form.

## About

Most undo/redo libraries simply treat your application state as immutable,
opting to copy the entire state on every change.
This works, but is highly inefficient, and isn't viable for large amounts of data.

The other way is to only record the change, but this is harder to implement.

The Tardis approach is fairly simple - point it to the exact location in your data that you want to change,
then specify how you want to change it.
This requires a bit more thought up-front,
but the benefit is that you don't need to think about how to unwind state.

## How to use

1. Define your state

```ts
const data = {
  items: [{ id: 1, name: "Item 1" }],
};
```

2. Create a new Tardis instance

```ts
const tardis = new Tardis(data);
```

3. Perform an operation against your data

```ts
// append a new item to the items array
tardis.do("insert", ["items", 1], { id: 2, name: "Item 2" });
```

4. You can now undo/redo this change

```ts
tardis.undo();
tardis.redo();
```

## Other operations

Tardis allows 3 operations: `insert`, `update`, and `delete`.

```ts
// update
const data = {
  user: { name: "John", age: 30 },
};
const tardis = new Tardis(data);

tardis.do("update", ["user", "name"], "Jane"); // data.user.name is now "Jane"
```

```ts
// delete
const data = {
  tags: ["a", "b", "c"],
};
const tardis = new Tardis(data);

tardis.do("delete", ["tags", 1]); // data.tags is now ["a", "c"]
```

## Current state

I originally built this as an internal module for [Matry](https://github.com/matry),
but will likely discard it for an XML-based approach.
It's a neat idea, I just don't have a current use for it and will probably not continue investing in it.

Feel free to fork!

## Getting started

To install dependencies:

```bash
bun install
```

To run:

```bash
bun test
```
