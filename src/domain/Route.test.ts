import { LatLng } from "leaflet";
import { Route } from "./Route";
import { Waypoint } from "./Waypoint";
import { waypointFactory } from "./Waypoint.factory";

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
    const wp0 = wp(0);
    const wp1 = wp(1);
    const wp2 = wp(2);
    const wp3 = wp(3);
    const route = Route.create({
      waypoints: [wp0, wp1, wp2, wp3],
    });

    expect(route.removeWaypoint(2).waypoints).toEqual([wp0, wp1, wp3]);
  });
  it("should remove first waypoint properly", () => {
    const wp0 = wp(0);
    const wp1 = wp(1);
    const wp2 = wp(2);
    const wp3 = wp(3);

    const route = Route.create({
      waypoints: [wp0, wp1, wp2, wp3],
    });

    expect(route.removeWaypoint(0).waypoints).toEqual([wp1, wp2, wp3]);
  });
});

const wp = (lat: number): Waypoint => {
  return waypointFactory({ latLng: new LatLng(lat, 0) });
};
