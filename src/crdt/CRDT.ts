export interface CRDT<S, V> {
  value: V;
  state: S;
  merge(remoteState: S): void;
}
