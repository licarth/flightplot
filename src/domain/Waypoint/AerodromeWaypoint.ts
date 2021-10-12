import { LatLng } from "leaflet";
import {
  Aerodrome,
  AltitudeInFeet,
  IcaoCode,
  LatLng as SiaLatLng,
} from "ts-aerodata-france";
import { toLatLng } from "../../components/Map/LeafletMap";
import { Waypoint } from "./Waypoint";

export type AerodromeWaypointId = IcaoCode;

export enum AerodromeWaypointType {
  OVERFLY = "OVERFLY",
  RUNWAY = "RUNWAY",
}

export class AerodromeWaypoint implements Waypoint {
  private readonly _aerodrome;
  readonly waypointType;

  constructor({
    aerodrome,
    waypointType,
  }: {
    aerodrome: Aerodrome;
    waypointType: AerodromeWaypointType;
  }) {
    this._aerodrome = aerodrome;
    this.waypointType = waypointType;
  }

  get latLng() {
    const aerodromeLatLng = this._aerodrome.latLng;
    const res = toLeafletLatLng(aerodromeLatLng);
    return res;
  }

  get name() {
    return IcaoCode.getValue(this._aerodrome.icaoCode);
  }

  get id() {
    return this._aerodrome.icaoCode;
  }

  get aerodrome() {
    return this._aerodrome;
  }

  get altitude() {
    return AltitudeInFeet.getValue(this.aerodrome.aerodromeAltitude);
  }

  static isAerodromeWaypoint(waypoint: any): waypoint is AerodromeWaypoint {
    return waypoint._aerodrome !== undefined;
  }
}

export const toLeafletLatLng = (aerodromeLatLng: SiaLatLng): LatLng => {
  const latLng = toLatLng(aerodromeLatLng);
  const res = new LatLng(latLng.lat, latLng.lng);
  return res;
};
