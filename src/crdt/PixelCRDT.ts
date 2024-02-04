import { CRDT } from "./CRDT";
import { LWWMap } from "./LWWMap";

export type HexColor = string;

export class PixelCRDT
  implements CRDT<LWWMap<HexColor>["state"], LWWMap<HexColor>["value"]>
{
  readonly id: string;
  lwwMap: LWWMap<HexColor>;

  constructor(id: string) {
    this.id = id;
    this.lwwMap = new LWWMap(id, {});
  }

  static key(x: number, y: number): string {
    return `${x}-${y}`;
  }

  set(x: number, y: number, value: HexColor) {
    const key = PixelCRDT.key(x, y);
    this.lwwMap.set(key, value);
  }

  get(x: number, y: number): HexColor {
    return this.lwwMap.get(PixelCRDT.key(x, y)) ?? "#ffffff";
  }

  merge(remoteState: LWWMap<HexColor>["state"]): void {
    this.lwwMap.merge(remoteState);
  }

  delete(x: number, y: number) {
    this.lwwMap.delete(PixelCRDT.key(x, y));
  }

  get state() {
    return this.lwwMap.state;
  }

  get value() {
    return this.lwwMap.value;
  }
}
