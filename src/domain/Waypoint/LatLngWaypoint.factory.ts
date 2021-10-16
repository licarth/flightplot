import { v4 as uuidv4 } from "uuid";
import { toWaypointId, WaypointProps } from "./Waypoint";
import { LatLngWaypoint } from "./LatLngWaypoint";

export const WaypointIdFactory = (id = uuidv4()) => toWaypointId(id);

export const latLngWaypointFactory = ({
  id = WaypointIdFactory(),
  name = "waypointName",
  latLng = { lat: 43, lng: 0 },
}: Partial<WaypointProps> = {}) => LatLngWaypoint.create({ id, name, latLng });
