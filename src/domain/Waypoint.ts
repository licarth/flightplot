import { LatLng } from "leaflet";
import { v4 as uuidv4 } from "uuid";
import { Opaque } from "./Opaque";

export type WaypointId = Opaque<string, "UUID">;
export const toWaypointId = (id: string) => id as WaypointId;

export type WaypointProps = {
  latLng: LatLng;
  name?: string;
  id: WaypointId;
};

export class Waypoint {
  private _latLng;
  public name;
  private _id: WaypointId;

  constructor({ latLng, name, id }: WaypointProps) {
    this._latLng = latLng;
    this.name = name;
    this._id = id;
  }

  static create(props: WaypointProps) {
    return new Waypoint(props);
  }

  clone({
    id = this._id,
    latLng = this._latLng,
    name = this.name,
  }: Partial<WaypointProps> = {}) {
    return new Waypoint({
      latLng,
      name,
      id,
    });
  }

  static fromLatLng(latLng: LatLng) {
    return new Waypoint({ latLng, id: toWaypointId(uuidv4()) });
  }

  get latLng() {
    return this._latLng;
  }

  get id() {
    return this._id;
  }

  set latLng(latLng: LatLng) {
    this._latLng = latLng;
  }
}
