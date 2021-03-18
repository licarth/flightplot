import CheapRuler from "cheap-ruler";
import { toPoint } from "../components/Map/FlightPlanningLayer";
import { Waypoint } from "./Waypoint";

export class Route {
  readonly waypoints: ReadonlyArray<Waypoint>;

  constructor({ waypoints }: { waypoints: Waypoint[] }) {
    this.waypoints = [...waypoints];
  }

  addWaypoint({
    position = this.waypoints.length + 1,
    waypoint,
  }: {
    position?: number;
    waypoint: Waypoint;
  }): Route {
    return new Route({
      waypoints: [
        ...this.waypoints.slice(0, position),
        waypoint,
        ...this.waypoints.slice(position, this.waypoints.length),
      ],
    });
  }

  removeWaypoint(waypointPostion: number): Route {
    const newWaypoints = [...this.waypoints];
    newWaypoints.splice(waypointPostion, 1);
    return new Route({
      waypoints: newWaypoints,
    });
  }

  replaceWaypoint({
    waypointPosition,
    newWaypoint,
  }: {
    waypointPosition: number;
    newWaypoint: Waypoint;
  }): Route {
    const newWaypoints = [...this.waypoints];

    newWaypoints[waypointPosition] = newWaypoint;
    return new Route({
      waypoints: newWaypoints,
    });
  }

  static create({ waypoints = [] }: { waypoints?: Array<Waypoint> } = {}) {
    return new Route({ waypoints });
  }

  get length() {
    return this.waypoints.length === 0 ? 0 : this.waypoints.length - 1;
  }

  get departure() {
    return this.waypoints.length > 0 ? this.waypoints[0] : undefined;
  }

  get legs() {
    const legs = [];
    for (let i = 0; i < this.waypoints.length; i++) {
      if (this.length > i) {
        const departureWaypoint = this.waypoints[i];
        const arrivalWaypoint = this.waypoints[i + 1];
        const ruler = new CheapRuler(
          (departureWaypoint.latLng.lat + arrivalWaypoint.latLng.lat) / 2,
          "nauticalmiles",
        );
        const line = [
          toPoint(departureWaypoint.latLng),
          toPoint(arrivalWaypoint.latLng),
        ];
        const distanceInNm = ruler.lineDistance(line);
        legs.push({
          trueHdg:
            (360 +
              ruler.bearing(
                toPoint(departureWaypoint.latLng),
                toPoint(arrivalWaypoint.latLng),
              )) %
            360,
          distanceInNm,
          durationInMinutes: distanceInNm * 0.55,
          departureWaypoint,
          arrivalWaypoint,
        });
      }
    }
    return legs;
  }
}
