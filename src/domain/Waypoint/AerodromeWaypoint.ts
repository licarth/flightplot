import {
  Aerodrome,
  AltitudeInFeet,
  IcaoCode,
  LatLng as SiaLatLng,
} from "ts-aerodata-france";
import { LatLng, toLatLng } from "../../LatLng";
import { Waypoint } from "./Waypoint";

export type AerodromeWaypointId = IcaoCode;

export enum AerodromeWaypointType {
  OVERFLY = "OVERFLY",
  RUNWAY = "RUNWAY",
}

type AerodromeWaypointProps = {
  aerodrome: Aerodrome;
  waypointType: AerodromeWaypointType;
  altitude?: number | null;
};

export class AerodromeWaypoint implements Waypoint {
  private readonly _aerodrome;
  private _altitude?: number | null;
  readonly waypointType;

  constructor({ aerodrome, waypointType, altitude }: AerodromeWaypointProps) {
    this._aerodrome = aerodrome;
    this.waypointType = waypointType;
    this._altitude = altitude;
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
    return this.waypointType === AerodromeWaypointType.OVERFLY
      ? this._altitude
      : AltitudeInFeet.getValue(this.aerodrome.aerodromeAltitude);
  }

  set altitude(altitude: number | undefined | null) {
    this._altitude = altitude;
  }

  static isAerodromeWaypoint(waypoint: any): waypoint is AerodromeWaypoint {
    return waypoint._aerodrome !== undefined;
  }

  clone({
    aerodrome = this._aerodrome,
    waypointType = this.waypointType,
    altitude = this._altitude,
  }: Partial<AerodromeWaypointProps> = {}) {
    return new AerodromeWaypoint({
      aerodrome,
      waypointType,
      altitude,
    });
  }
}

export const toLeafletLatLng = (aerodromeLatLng: SiaLatLng): LatLng => {
  const latLng = toLatLng(aerodromeLatLng);
  const res = {lat: latLng.lat, lng: latLng.lng};
  return res;
};
