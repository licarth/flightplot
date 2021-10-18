import CheapRuler from "cheap-ruler";
import { pipe } from "fp-ts/lib/function";
import * as Codec from "io-ts/lib/Codec";
import * as Decoder from "io-ts/lib/Decoder";
import { AiracData } from "ts-aerodata-france";
import { LatLng } from "../LatLng";
import { Aircraft } from "./Aircraft";
import { boundingBox } from "./boundingBox";
import { AerodromeWaypoint, AerodromeWaypointType } from "./Waypoint";
import { Waypoint, waypointCodec } from "./Waypoint/Waypoint";

type VerticalProfile = {
  distance: number;
  altitudeInFeet: number;
  routeWaypoint: Waypoint | null;
  routeIndex: number | null;
  name: string | null;
}[];

export class Route {
  readonly waypoints: ReadonlyArray<Waypoint>;

  constructor({ waypoints }: { waypoints: Waypoint[] }) {
    this.waypoints = [...waypoints];
  }

  static empty = () => new Route({ waypoints: [] });

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

  moveWaypoint(currentWaypointPosition: number, newWaypointPosition: number) {
    const newWaypoints = [...this.waypoints];
    const f = newWaypoints.splice(currentWaypointPosition, 1)[0];
    newWaypoints.splice(newWaypointPosition, 0, f);
    return new Route({ waypoints: newWaypoints });
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
        curr.altitude !== null && curr.altitude !== undefined
          ? [...prev, curr.altitude]
          : [...prev, prev[prev.length - 1] || 0],
      [] as number[],
    );
  }

  get leafletBoundingBox() {
    return boundingBox(this.waypoints.map(({ latLng }) => latLng));
  }

  verticalProfile({ aircraft }: { aircraft: Aircraft }): VerticalProfile {
    const verticalProfile: VerticalProfile = [];
    const alts = this.inferredAltitudes;
    for (let i = 0; i < this.legs.length; i++) {
      const {
        departureWaypoint,
        arrivalWaypoint,
        distanceInNm,
        startingPointInNm,
      } = this.legs[i];
      verticalProfile.push({
        distance: startingPointInNm,
        altitudeInFeet: alts[i],
        name: departureWaypoint.name,
        routeWaypoint: departureWaypoint,
        routeIndex: i,
      });

      const heightDiff = alts[i + 1] - alts[i];
      if (heightDiff > 0) {
        //Climb
        const firstTerm = Math.pow(
          knotsToMetersPerSecond(aircraft.climbKIAS) /
            feetPerMinToMetersPerSecond(aircraft.climbRateFeetMin),
          2,
        );
        const horizontalDistanceInNm = metersInNauticalMiles(
          Math.sqrt(Math.pow(heightDiff, 2) * (firstTerm - 1)),
        );
        if (horizontalDistanceInNm < distanceInNm) {
          verticalProfile.push({
            distance: startingPointInNm + horizontalDistanceInNm,
            altitudeInFeet: alts[i + 1],
            name: "T/C",
            routeWaypoint: null,
            routeIndex: null,
          });
        }
      } else if (heightDiff < 0) {
        //Descent
        const firstTerm = Math.pow(
          knotsToMetersPerSecond(aircraft.cruiseKIAS) /
            feetPerMinToMetersPerSecond(aircraft.descentRateFeetMin),
          2,
        );
        const horizontalDistanceInNm = metersInNauticalMiles(
          Math.sqrt(Math.pow(-heightDiff, 2) * (firstTerm - 1)),
        );
        if (horizontalDistanceInNm < distanceInNm) {
          verticalProfile.push({
            distance: startingPointInNm + distanceInNm - horizontalDistanceInNm,
            altitudeInFeet: alts[i],
            name: "T/D",
            routeWaypoint: null,
            routeIndex: null,
          });
        }
      }
      if (i === this.legs.length - 1) {
        verticalProfile.push({
          distance: startingPointInNm + distanceInNm,
          altitudeInFeet: alts[i + 1],
          name: arrivalWaypoint.name,
          routeWaypoint: arrivalWaypoint,
          routeIndex: i + 1,
        });
      }
    }
    return verticalProfile;
  }

  splitOnTouchAndGos(): Route[] {
    const routes: Route[] = [];
    let route = Route.empty();
    for (const waypoint of this.waypoints) {
      if (
        AerodromeWaypoint.isAerodromeWaypoint(waypoint) &&
        waypoint.waypointType === AerodromeWaypointType.RUNWAY &&
        route.waypoints.length > 0
      ) {
        routes.push(route.addWaypoint({ waypoint }));
        route = Route.empty().addWaypoint({ waypoint });
      } else {
        route = route.addWaypoint({ waypoint });
      }
    }
    if (route.waypoints.length > 1) {
      routes.push(route);
    }
    return routes;
  }

  static codec = (airacData: AiracData) =>
    Codec.make(
      pipe(
        Codec.array(waypointCodec(airacData)),
        Decoder.compose<Array<Waypoint>, Route>({
          decode: (waypoints) => Decoder.success(new Route({ waypoints })),
        }),
      ),
      {
        encode: ({ waypoints }) =>
          Codec.array(waypointCodec(airacData)).encode([...waypoints]),
      },
    );
}

export const toPoint = (latLng: LatLng): [number, number] => [
  latLng.lng,
  latLng.lat,
];

const knotsToMetersPerSecond = (v: number) => (v * 1852) / 3600;
const feetPerMinToMetersPerSecond = (v: number) => v / 60 / 3.28;
const metersInNauticalMiles = (d: number) => d / 1852;
