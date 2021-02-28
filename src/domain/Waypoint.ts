import { LatLng } from "leaflet";

export abstract class AbstractWaypoint implements IWaypoint {
  public latLng;

  constructor(latLng: LatLng) {
    this.latLng = latLng;
  }
}

export class Waypoint extends AbstractWaypoint {
  static fromLatLng(latLng: LatLng) {
    return new Waypoint(latLng);
  }
}

export interface IWaypoint {
  latLng: LatLng;
}
