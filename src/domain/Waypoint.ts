import { LatLng } from "leaflet";

export abstract class AbstractWaypoint implements IWaypoint {
  public latLng;
  public name;

  constructor({ latLng, name }: { latLng: LatLng; name: string | null }) {
    this.latLng = latLng;
    this.name = name;
  }
}

export class Waypoint extends AbstractWaypoint {
  static fromLatLng(latLng: LatLng) {
    return new Waypoint({ latLng, name: null });
  }
}

export interface IWaypoint {
  latLng: LatLng;
}
