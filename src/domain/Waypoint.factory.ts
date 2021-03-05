import { LatLng } from "leaflet";
import { v4 as uuidv4 } from "uuid";
import { toWaypointId, Waypoint, WaypointProps } from "./Waypoint";

export const WaypointIdFactory = (id = uuidv4()) => toWaypointId(id);

export const waypointFactory = ({
  id = WaypointIdFactory(),
  name = "waypointName",
  latLng = new LatLng(43, 0),
}: Partial<WaypointProps> = {}) => Waypoint.create({ id, name, latLng });
