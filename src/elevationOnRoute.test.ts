import { LatLng } from "leaflet";
import { Route, Waypoint } from "./domain";
import { elevationOnRoute } from "./elevationOnRoute";
import { openElevationApiElevationService } from "./ElevationService/openElevationApiElevationService";

describe("elevationOnRoute", () => {
  it("should return something", async () => {
    expect(
      (
        await elevationOnRoute({
          elevationService: openElevationApiElevationService,
        })(
          new Route({
            waypoints: [
              Waypoint.create({ latLng: new LatLng(43, -10) }),
              Waypoint.create({ latLng: new LatLng(43, -10.1) }),
            ],
          }),
        )
      ).elevations,
    ).toEqual([0, 0, 0, 0, 0]);
  });
});
