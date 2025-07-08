import { History } from "./history.ts";

type CommandType = "insert" | "update" | "delete";

type Command = {
  batch_id: string;
  type: CommandType;
  path: Array<string | number>;
  data?: any;
};

type CommandRecord = {
  up: Command;
  down: Command;
};

export class Tardis<T> {
  private data: T;

  private history: History<CommandRecord>;
  private limit: number;
  private subscriber: (state: T) => void;

  constructor(data: T, limit: number, subscriber: (state: T) => void) {
    this.data = data;
    this.history = new History<CommandRecord>(limit);
    this.limit = limit;
    this.subscriber = subscriber;
  }

  get state() {
    return this.data;
  }

  private refFromPath(path: Array<string | number>) {
    let ref: any = this.data;

    for (let i = 0, l = path.length - 1; i < l; i++) {
      const pathSegment: string | number = path[i]!;
      ref = ref[pathSegment];
    }

    return ref;
  }

  private insert(
    path: Array<string | number>,
    data: any,
    batch_id?: string
  ): CommandRecord {
    let id = batch_id || Date.now().toString();
    let ref = this.refFromPath(path);
    let lastPathKey = path[path.length - 1];

    if (typeof lastPathKey === "string") {
      ref[lastPathKey] = data;
    } else {
      ref.splice(lastPathKey, 0, data);
    }

    return {
      up: {
        batch_id: id,
        type: "insert",
        path,
        data,
      },
      down: {
        batch_id: id,
        type: "delete",
        path,
      },
    };
  }

  private update(
    path: Array<string | number>,
    data: any,
    batch_id?: string
  ): CommandRecord {
    let id = batch_id || Date.now().toString();
    let ref = this.refFromPath(path);
    let lastPathKey = path[path.length - 1]!;
    let originalData = structuredClone(ref[lastPathKey]);

    if (typeof lastPathKey === "string") {
      ref[lastPathKey] = data;
    } else {
      ref.splice(lastPathKey, 1, data);
    }

    return {
      up: {
        batch_id: id,
        type: "update",
        path,
        data,
      },
      down: {
        batch_id: id,
        type: "update",
        path,
        data: originalData,
      },
    };
  }

  private delete(
    path: Array<string | number>,
    batch_id?: string
  ): CommandRecord {
    let id = batch_id || Date.now().toString();
    let ref = this.refFromPath(path);
    let lastPathKey = path[path.length - 1]!;
    let data = structuredClone(ref[lastPathKey]);

    if (typeof lastPathKey === "string") {
      delete ref[lastPathKey];
    } else {
      ref.splice(lastPathKey, 1);
    }

    return {
      up: {
        batch_id: id,
        type: "delete",
        path,
      },
      down: {
        batch_id: id,
        type: "insert",
        path,
        data,
      },
    };
  }

  clear(data: T) {
    this.history = new History(this.limit);
    this.data = data;
    this.subscriber(this.data);
  }

  do(
    type: CommandType,
    path: Array<string | number>,
    data?: any,
    batch_id?: string
  ) {
    let commandRecord: CommandRecord | null = null;

    switch (type) {
      case "insert":
        commandRecord = this.insert(path, data, batch_id);
        break;
      case "update":
        commandRecord = this.update(path, data, batch_id);
        break;
      case "delete":
        commandRecord = this.delete(path, batch_id);
        break;
    }

    if (commandRecord) {
      this.history.add(commandRecord);
    }
    this.subscriber(this.data);
  }

  undo() {
    const commandRecord = this.history.shift("dec") as CommandRecord | null;
    if (!commandRecord) {
      return;
    }

    const { down } = commandRecord;
    const currentBatchId = down.batch_id;

    switch (down.type) {
      case "insert":
        this.insert(down.path, down.data, down.batch_id);
        break;
      case "delete":
        this.delete(down.path, down.batch_id);
        break;
      case "update":
        this.update(down.path, down.data, down.batch_id);
        break;
      default:
        break;
    }

    let previousRecord = this.history.peek("dec") as CommandRecord | null;

    while (previousRecord && previousRecord.down.batch_id === currentBatchId) {
      this.history.shift("dec");

      const { down } = previousRecord;
      switch (down.type) {
        case "insert":
          this.insert(down.path, down.data, down.batch_id);
          break;
        case "delete":
          this.delete(down.path, down.batch_id);
          break;
        case "update":
          this.update(down.path, down.data, down.batch_id);
          break;
        default:
          break;
      }
      previousRecord = this.history.peek("dec") as CommandRecord | null;
    }

    this.subscriber(this.data);
  }

  redo() {
    const commandRecord = this.history.shift("inc") as CommandRecord | null;
    if (!commandRecord) {
      return;
    }

    const { up } = commandRecord;
    const currentBatchId = up.batch_id;

    switch (up.type) {
      case "insert":
        this.insert(up.path, up.data, up.batch_id);
        break;
      case "delete":
        this.delete(up.path, up.batch_id);
        break;
      case "update":
        this.update(up.path, up.data, up.batch_id);
        break;
      default:
        break;
    }

    let nextRecord = this.history.peek("inc") as CommandRecord | null;

    while (nextRecord && nextRecord.up.batch_id === currentBatchId) {
      this.history.shift("inc");

      const { up } = nextRecord;
      switch (up.type) {
        case "insert":
          this.insert(up.path, up.data, up.batch_id);
          break;
        case "delete":
          this.delete(up.path, up.batch_id);
          break;
        case "update":
          this.update(up.path, up.data, up.batch_id);
          break;
        default:
          break;
      }
      nextRecord = this.history.peek("inc") as CommandRecord | null;
    }

    this.subscriber(this.data);
  }
}
