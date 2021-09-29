import { LatLng } from "leaflet";
import { Aerodrome } from "ts-aerodata-france";
import { v4 as uuidv4 } from "uuid";
import { Opaque } from "../Opaque";
import { AerodromeWaypoint, AerodromeWaypointId } from "./AerodromeWaypoint";
import { LatLngWaypoint } from "./LatLngWaypoint";

export type WaypointId = Opaque<string, "UUID"> | AerodromeWaypointId;

export const toWaypointId = (id: string) => id as WaypointId;

export type WaypointProps = {
  latLng: LatLng;
  name?: string;
  id: WaypointId;
};

export interface Waypoint {
  latLng: LatLng;
  name?: string;
  id: WaypointId;
}

export namespace Waypoint {
  export const create = (props: Omit<WaypointProps, "id">) => {
    return new LatLngWaypoint({ ...props, id: toWaypointId(uuidv4()) });
  };
  export const fromAerodrome = (aerodrome: Aerodrome) => {
    return new AerodromeWaypoint(aerodrome);
  };
}
