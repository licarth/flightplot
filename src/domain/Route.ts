import CheapRuler from "cheap-ruler";
import { toPoint } from "../components/Map/FlightPlanningLayer";
import { Waypoint } from "./Waypoint/Waypoint";

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

  get arrival() {
    return this.waypoints.length > 1
      ? this.waypoints[this.waypoints.length - 1]
      : undefined;
  }

  get totalDistance() {
    return this.waypoints.length > 1
      ? this.legs.reduce((p, c) => p + c.distanceInNm, 0)
      : 0;
  }

  get totalDurationInMinutes() {
    return this.waypoints.length > 1
      ? this.legs.reduce((p, c) => p + c.durationInMinutes, 0)
      : 0;
  }

  get legs() {
    const legs = [];
    let startingPointInNm = 0;
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
          startingPointInNm,
          distanceInNm,
          durationInMinutes: distanceInNm * 0.55,
          departureWaypoint,
          arrivalWaypoint,
        });
        startingPointInNm = startingPointInNm + distanceInNm;
      }
    }
    return legs;
  }

  get boundingBox(): [number, number, number, number] {
    const lats: number[] = [];
    const lngs: number[] = [];

    for (let i = 0; i < this.waypoints.length; i++) {
      const w = this.waypoints[i];
      lats.push(w.latLng.lat);
      lngs.push(w.latLng.lng);
    }

    // calc the min and max lng and lat
    const minlat = Math.min(...lats);
    const maxlat = Math.max(...lats);
    const minlng = Math.min(...lngs);
    const maxlng = Math.max(...lngs);

    // create a bounding rectangle that can be used in leaflet
    return [minlng, minlat, maxlng, maxlat];
  }

  get inferredAltitudes() {
    return this.waypoints.reduce(
      (prev, curr) =>
        !!curr.altitude
          ? [...prev, curr.altitude]
          : [...prev, prev[prev.length - 1] || 0],
      [] as number[],
    );
  }
}
