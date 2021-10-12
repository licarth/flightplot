import CheapRuler from "cheap-ruler";
import { Reader } from "fp-ts/lib/Reader";
import _ from "lodash";
import { toPoint } from "./components/Map/FlightPlanningLayer";
import { Route } from "./domain";
import { ElevationService } from "./ElevationService/ElevationService";

const ruler = new CheapRuler(43, "nauticalmiles");

export type ElevationAtPoint = {
  elevations: number[];
  distancesFromStartInNm: number[];
};

export const elevationOnRoute: Reader<
  { elevationService: ElevationService },
  (route: Route) => Promise<ElevationAtPoint>
> =
  ({ elevationService }) =>
  async (route: Route) => {
    const line = route.waypoints.map((w) => toPoint(w.latLng));
    const definitionInNm = 0.25; // elevation every 1 Nm.
    const numberOfPoints = Math.floor(route.totalDistance / definitionInNm);
    const distancesFromStartInNm = [
      ..._.range(0, numberOfPoints).map((i) => i * definitionInNm),
      route.totalDistance,
    ];
    const latLngs = distancesFromStartInNm.map((d) => ruler.along(line, d));

    return {
      elevations: await elevationService.getElevationsForLatLngs(
        latLngs.map(([lng, lat]) => ({ lat, lng })),
      ),
      distancesFromStartInNm,
    };
  };