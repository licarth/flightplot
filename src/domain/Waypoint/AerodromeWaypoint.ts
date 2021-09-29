import { LatLng } from "leaflet";
import { Aerodrome, IcaoCode, LatLng as SiaLatLng } from "ts-aerodata-france";
import { toLatLng } from "../../components/Map/LeafletMap";
import { Waypoint } from "./Waypoint";

export type AerodromeWaypointId = IcaoCode;

export class AerodromeWaypoint implements Waypoint {
  private readonly _aerodrome;

  constructor(aerodrome: Aerodrome) {
    this._aerodrome = aerodrome;
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

  static isAerodromeWaypoint(waypoint: any): waypoint is AerodromeWaypoint {
    return waypoint._aerodrome !== undefined;
  }
}

export const toLeafletLatLng = (aerodromeLatLng: SiaLatLng): LatLng => {
  const latLng = toLatLng(aerodromeLatLng);
  const res = new LatLng(latLng.lat, latLng.lng);
  return res;
};
