import { aircraftCollection } from '../Aircraft';
import type { Waypoint } from '../Waypoint';
import { latLngWaypointFactory } from '../Waypoint/LatLngWaypoint.factory';
import { OldRoute } from './OldRoute';

describe('Route', () => {
    it('should add a waypoint properly', () => {
        const route = OldRoute.create().addWaypoint({
            waypoint: latLngWaypointFactory(),
        });

        expect(route.waypoints).toHaveLength(1);
    });
    it('should remove a waypoint properly', () => {
        const route = OldRoute.create({
            waypoints: [latLngWaypointFactory()],
        });

        expect(route.removeWaypoint(0).waypoints).toHaveLength(0);
    });

    it('should remove a waypoint in the middle properly', () => {
        const wp0 = wp(0);
        const wp1 = wp(1);
        const wp2 = wp(2);
        const wp3 = wp(3);
        const route = OldRoute.create({
            waypoints: [wp0, wp1, wp2, wp3],
        });

        expect(route.removeWaypoint(2).waypoints).toEqual([wp0, wp1, wp3]);
    });
    it('should remove first waypoint properly', () => {
        const wp0 = wp(0);
        const wp1 = wp(1);
        const wp2 = wp(2);
        const wp3 = wp(3);

        const route = OldRoute.create({
            waypoints: [wp0, wp1, wp2, wp3],
        });

        expect(route.removeWaypoint(0).waypoints).toEqual([wp1, wp2, wp3]);
    });
});

const wp = (lat: number): Waypoint => {
    return latLngWaypointFactory({ latLng: { lat, lng: 0 } });
};

describe('Route.verticalProfile()', () => {
    it('should return correct climb calculations', () => {
        const wp0 = wp(0);
        const wp1 = wp(1).clone({ altitude: 1000 });
        const route = OldRoute.create({
            waypoints: [wp0, wp1],
        });

        expect(route.verticalProfile({ aircraft: aircraftCollection[0] })).toHaveLength(3);
    });
});
