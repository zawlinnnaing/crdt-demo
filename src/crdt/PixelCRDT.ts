import { CRDT } from "./CRDT";
import { LWWMap } from "./LWWMap";
import { Coordinate } from "./types";

export type HexColor = string;

export type DrawInfo = {
  from: Coordinate;
  to: Coordinate;
  color: HexColor;
};

export class PixelCRDT
  implements CRDT<LWWMap<DrawInfo>["state"], LWWMap<DrawInfo>["value"]>
{
  readonly id: string;
  lwwMap: LWWMap<DrawInfo>;

  constructor(id: string) {
    this.id = id;
    this.lwwMap = new LWWMap(id, {});
  }

  static key(drawInfo: DrawInfo): string {
    return `${drawInfo.from.x}-${drawInfo.from.y}->${drawInfo.to.x}-${drawInfo.to.y}`;
  }

  set(drawInfo: DrawInfo) {
    const key = PixelCRDT.key(drawInfo);
    this.lwwMap.set(key, drawInfo);
  }

  merge(remoteState: LWWMap<DrawInfo>["state"]): void {
    this.lwwMap.merge(remoteState);
  }

  delete(drawInfo: DrawInfo) {
    this.lwwMap.delete(PixelCRDT.key(drawInfo));
  }

  get state() {
    return this.lwwMap.state;
  }

  get value() {
    return this.lwwMap.value;
  }
}
