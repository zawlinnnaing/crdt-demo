import { CRDT } from "./CRDT";
import { LWWRegister } from "./LWWRegister";

type State<T> = {
  [key: string]: LWWRegister<T | null>["state"];
};

type Value<T> = {
  [key: string]: T;
};

export class LWWMap<T> implements CRDT<State<T>, Value<T>> {
  readonly id: string;
  private data = new Map<string, LWWRegister<T | null>>();

  constructor(id: string, state: State<T>) {
    this.id = id;

    Object.entries(state).forEach(([key, value]) => {
      this.data.set(key, new LWWRegister(id, value));
    });
  }
  merge(remoteState: State<T>): void {
    for (const [key, remote] of Object.entries(remoteState)) {
      const local = this.data.get(key);
      if (local) {
        local.merge(remote);
        continue;
      }
      this.data.set(key, new LWWRegister(this.id, remote));
    }
  }

  get(key: string): T | null {
    return this.data.get(key)?.value ?? null;
  }

  set(key: string, value: T) {
    const register = this.data.get(key);
    if (register) {
      register.set(value);
    } else {
      this.data.set(
        key,
        new LWWRegister(this.id, {
          peerId: this.id,
          timestamp: 0,
          value,
        })
      );
    }
  }

  delete(key: string) {
    this.data.get(key)?.set(null);
  }

  has(key: string): boolean {
    return !!this.data.get(key)?.value;
  }

  get value(): Value<T> {
    const value: Value<T> = {};
    for (const [key, register] of this.data.entries()) {
      if (register?.value !== null) {
        value[key] = register.value;
      }
    }
    return value;
  }

  get state(): State<T> {
    const state: State<T> = {};

    for (const [key, register] of this.data.entries()) {
      state[key] = register.state;
    }
    return state;
  }
}
