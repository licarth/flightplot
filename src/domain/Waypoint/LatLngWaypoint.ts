import { LatLng } from "leaflet";
import { Waypoint, WaypointId, WaypointProps } from "./Waypoint";

export class LatLngWaypoint implements Waypoint {
  private _latLng;
  public name;
  private _id: WaypointId;

  constructor({ latLng, name, id }: WaypointProps) {
    this._latLng = latLng;
    this.name = name;
    this._id = id;
  }

  static create(props: WaypointProps) {
    return new LatLngWaypoint(props);
  }

  clone({
    id = this._id,
    latLng = this._latLng,
    name = this.name,
  }: Partial<WaypointProps> = {}) {
    return new LatLngWaypoint({
      latLng,
      name,
      id,
    });
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
