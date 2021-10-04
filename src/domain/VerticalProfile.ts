import * as turf from "@turf/turf";
import CheapRuler from "cheap-ruler";
import { LatLng } from "leaflet";
import { Airspace, DangerZone, Latitude, Longitude } from "ts-aerodata-france";
import { toPoint } from "../components/Map/FlightPlanningLayer";
import { Route } from "./Route";

type Props = { airspaces: (Airspace | DangerZone)[]; route: Route };

const toArrayCoords = (
  latLng: LatLng | { lat: Latitude; lng: Longitude },
): [number, number] => [Number(latLng.lng), Number(latLng.lat)];

const airspaceAsPolygon = (airspace: Airspace | DangerZone) =>
  turf.polygon([airspace.geometry.map((latlng) => toArrayCoords(latlng))]);

type AirspaceSegmentOverlap = {
  airspace: Airspace | DangerZone;
  segments: [number, number][];
};

export const routeAirspaceOverlaps = ({ airspaces, route }: Props) => {
  if (route.length < 1) return [];
  const overlaps: AirspaceSegmentOverlap[] = airspaces
    .map((airspace) => ({
      airspacePolygon: airspaceAsPolygon(airspace),
      airspace,
    }))
    .flatMap(({ airspacePolygon, airspace }) => {
      const segments = route.legs
        .map(
          ({
            departureWaypoint,
            arrivalWaypoint,
            startingPointInNm,
            distanceInNm,
          }) => {
            const routeLinePart = turf.lineString([
              toArrayCoords(departureWaypoint.latLng),
              toArrayCoords(arrivalWaypoint.latLng),
            ]);
            const ruler = new CheapRuler(
              (departureWaypoint.latLng.lat + arrivalWaypoint.latLng.lat) / 2,
              "nauticalmiles",
            );
            const oo: [number, number][] = [];
            let split = turf.lineSplit(routeLinePart, airspacePolygon);
            let oddPair: number;
            const isFirstPointInPolygon = turf.booleanPointInPolygon(
              routeLinePart.geometry.coordinates[0],
              airspacePolygon,
            );
            if (isFirstPointInPolygon) {
              oddPair = 0;
            } else {
              oddPair = 1;
            }
            if (split.features.length > 0) {
              orderFeatures(
                split.features,
                arrivalWaypoint.latLng.lng - departureWaypoint.latLng.lng,
              ).forEach((splitedPart, i) => {
                if ((i + oddPair) % 2 === 0) {
                  const distanceToFirst = ruler.lineDistance([
                    toPoint(departureWaypoint.latLng),
                    [
                      splitedPart.geometry.coordinates[0][0],
                      splitedPart.geometry.coordinates[0][1],
                    ],
                  ]);
                  const distanceToSecond = ruler.lineDistance([
                    toPoint(departureWaypoint.latLng),
                    [
                      splitedPart.geometry.coordinates[1][0],
                      splitedPart.geometry.coordinates[1][1],
                    ],
                  ]);
                  oo.push([
                    startingPointInNm + distanceToFirst,
                    startingPointInNm + distanceToSecond,
                  ]);
                }
              });
            } else if (isFirstPointInPolygon) {
              oo.push([startingPointInNm, startingPointInNm + distanceInNm]);
            }
            return oo;
          },
        )
        .reduce((prev, curr) => {
          // Reduce consecutive legs
          const lastPrev = prev[prev.length - 1];
          return curr.length > 0 &&
            prev.length > 0 &&
            curr[0].length > 0 &&
            prev.length > 0 &&
            lastPrev[1] === curr[0][0]
            ? [
                ...prev.slice(0, -1),
                [lastPrev[0], curr[0][1]],
                ...curr.slice(1),
              ]
            : [...prev, ...curr];
        });
      return segments.length > 0 ? [{ segments, airspace }] : [];
    });
  return overlaps;
};

function orderFeatures(
  features: turf.helpers.Feature<
    turf.helpers.LineString,
    turf.helpers.Properties
  >[],
  arg1: number,
) {
  return features.sort(
    (a, b) =>
      arg1 * (a.geometry.coordinates[0][0] - b.geometry.coordinates[0][0]),
  );
}
