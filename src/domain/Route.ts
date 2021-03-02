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
}
