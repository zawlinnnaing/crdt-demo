import { CRDT } from "./CRDT";

export interface LWWState<T> {
  peerId: string;
  timestamp: number;
  value: T;
}

export class LWWRegister<V> implements CRDT<LWWState<V>, V> {
  readonly id: string;
  state: LWWState<V>;

  constructor(id: string, state: LWWState<V>) {
    this.id = id;
    this.state = state;
  }

  set(value: V) {
    this.state.timestamp += 1;
    this.state.value = value;
  }

  get value() {
    return this.state.value;
  }

  merge(remoteState: LWWState<V>) {
    if (this.state.timestamp > remoteState.timestamp) {
      return;
    }
    if (
      this.state.timestamp === remoteState.timestamp &&
      this.state.peerId > remoteState.peerId
    ) {
      return;
    }
    this.state = remoteState;
  }
}
