import { v4 as uuidv4 } from 'uuid';
import { LatLngWaypoint } from './LatLngWaypoint';
import type { WaypointProps } from './Waypoint';

export const WaypointIdFactory = (id = uuidv4()) => `${id}`;

export const latLngWaypointFactory = ({
    id = WaypointIdFactory(),
    name = '',
    latLng = { lat: 43, lng: 0 },
    altitude = null,
}: Partial<WaypointProps> = {}) => LatLngWaypoint.create({ id, name, latLng, altitude });
