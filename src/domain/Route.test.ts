import { LatLng } from "leaflet";
import { Route } from "./Route";
import { Waypoint } from "./Waypoint";

describe("Route", () => {
  it("should add a waypoint properly", () => {
    const route = Route.create().addWaypoint({
      waypoint: Waypoint.fromLatLng(new LatLng(0, 0)),
    });

    expect(route.waypoints).toHaveLength(1);
  });
  it("should remove a waypoint properly", () => {
    const route = Route.create({
      waypoints: [Waypoint.fromLatLng(new LatLng(0, 0))],
    });

    expect(route.removeWaypoint(0).waypoints).toHaveLength(0);
  });

  it("should remove a waypoint in the middle properly", () => {
    const route = Route.create({
      waypoints: [wp(0), wp(1), wp(2), wp(3), wp(4), wp(5)],
    });

    expect(route.removeWaypoint(4).waypoints).toEqual([
      wp(0),
      wp(1),
      wp(2),
      wp(3),
      wp(5),
    ]);
  });
  it("should remove first waypoint properly", () => {
    const route = Route.create({
      waypoints: [wp(0), wp(1), wp(2), wp(3)],
    });

    expect(route.removeWaypoint(0).waypoints).toEqual([wp(1), wp(2), wp(3)]);
  });
});

const wp = (lat: number): Waypoint => {
  return Waypoint.fromLatLng(new LatLng(lat, 0));
};
