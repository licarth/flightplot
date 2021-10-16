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
              Waypoint.create({ latLng: {lat: 43, lng: -10} }),
              Waypoint.create({ latLng: {lat: 43, lng: -10.1} }),
            ],
          }),
        )
      ).elevations,
    ).toEqual([0, 0, 0, 0, 0]);
  });
});
