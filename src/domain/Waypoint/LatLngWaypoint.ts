import { LatLng } from "leaflet";
import { Waypoint, WaypointId, WaypointProps } from "./Waypoint";

export class LatLngWaypoint implements Waypoint {
  protected _latLng;
  public name;
  public altitude?: number | null;
  private _id: WaypointId;

  constructor({ latLng, name, id, altitude }: WaypointProps) {
    this._latLng = latLng;
    this.name = name;
    this.altitude = altitude;
    this._id = id;
  }

  static create(props: WaypointProps) {
    return new LatLngWaypoint(props);
  }

  clone({
    id = this._id,
    latLng = this._latLng,
    name = this.name,
    altitude = this.altitude,
  }: Partial<WaypointProps> = {}) {
    return new LatLngWaypoint({
      latLng,
      name,
      id,
      altitude,
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
