import { openElevationApiElevationService } from "./openElevationApiElevationService";

describe("openElevationApiElevationService", () => {
  it("should return correct elevation for 2 points in the sea", async () => {
    const res = await openElevationApiElevationService.getElevationsForLatLngs([
      { lat: 46, lng: -10 },
    ]);
    expect(res).toEqual([0]);
  });
});
