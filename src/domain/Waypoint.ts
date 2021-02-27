import { LatLng } from "leaflet";

export type Waypoint =
  | AbstractWaypoint
  | IntermediateWaypoint
  | ArrivalWaypoint;

export abstract class AbstractWaypoint implements IWaypoint {
  public latLng;

  constructor(latLng: LatLng) {
    this.latLng = latLng;
  }

}

export class DepartureWaypoint extends AbstractWaypoint {}
export class IntermediateWaypoint extends AbstractWaypoint {}
export class ArrivalWaypoint extends AbstractWaypoint {}

export interface IWaypoint {
  latLng: LatLng;
}
