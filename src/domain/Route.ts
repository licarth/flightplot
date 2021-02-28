import { Waypoint } from "./Waypoint";

export class Route {
  readonly waypoints: ReadonlyArray<Waypoint>;

  constructor({ waypoints }: { waypoints: Waypoint[] }) {
    this.waypoints = [...waypoints];
  }

  addWaypoint(waypoint: Waypoint): Route {
    return new Route({
      waypoints: [...this.waypoints, waypoint],
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
    waypointPostion,
    newWaypoint,
  }: {
    waypointPostion: number;
    newWaypoint: Waypoint;
  }): Route {
    const newWaypoints = [...this.waypoints];

    newWaypoints[waypointPostion] = newWaypoint;
    return new Route({
      waypoints: newWaypoints,
    });
  }

  static create({ waypoints = [] }: { waypoints?: Array<Waypoint> } = {}) {
    return new Route({ waypoints });
  }
}
