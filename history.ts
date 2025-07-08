export class History<T> {
  private readonly limit: number;
  private currentIndex: number;
  private entries: Array<T | undefined>;
  private size: number;

  constructor(limit: number) {
    if (!limit) {
      throw new Error("A valid history limit must be provided");
    }
    this.limit = limit;
    this.entries = new Array(limit);
    this.currentIndex = -1;
    this.size = 0;
  }

  private isOutOfBounds(direction: "inc" | "dec"): boolean {
    if (direction === "inc") {
      return this.currentIndex >= this.size - 1;
    } else {
      return this.currentIndex < 0;
    }
  }

  add(item: T) {
    if (this.currentIndex < this.size - 1) {
      this.size = this.currentIndex + 1;
    }

    if (this.size === this.limit) {
      for (let i = 0; i < this.limit - 1; i++) {
        this.entries[i] = this.entries[i + 1];
      }
      this.entries[this.limit - 1] = item;
    } else {
      this.entries[this.size] = item;
      this.size++;
    }
    this.currentIndex = Math.min(this.size - 1, this.limit - 1);
  }

  shift(direction: "inc" | "dec") {
    if (this.isOutOfBounds(direction)) {
      return null;
    }

    if (direction === "inc") {
      this.currentIndex++;
      return this.entries[this.currentIndex] as T;
    } else {
      const entry = this.entries[this.currentIndex] as T;
      this.currentIndex--;
      return entry;
    }
  }

  peek(direction: "inc" | "dec") {
    if (this.isOutOfBounds(direction)) {
      return null;
    }

    return this.entries[
      direction === "inc" ? this.currentIndex + 1 : this.currentIndex
    ] as T;
  }
}
