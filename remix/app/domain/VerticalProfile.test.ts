import type { Airspace, Latitude, Longitude } from 'ts-aerodata-france';
import { AirspaceClass, AirspaceType, Altitude, Height } from 'ts-aerodata-france';
import { routeAirspaceOverlaps } from './AirspaceIntersection/routeAirspaceOverlaps';
import { OldRoute } from './Route';
import { latLngWaypointFactory } from './Waypoint';

const lat = (lat: number) => lat as unknown as Latitude; // Workaround
const lng = (lng: number) => lng as unknown as Longitude; // Workaround

describe('VerticalProfile', () => {
    it('should return proper data when staying within 1 airspace', () => {
        const airspaces: Airspace[] = [
            {
                type: AirspaceType.CTR,
                airspaceClass: AirspaceClass.D,
                lowerLimit: new Height(0),
                higherLimit: new Altitude(1000),
                geometry: [
                    [0, 0],
                    [0, 1],
                    [1, 1],
                    [1, 0],
                    [0, 0],
                ].map((c) => ({ lat: lat(c[0]), lng: lng(c[1]) })),
                name: 'CTR IMAGINAIRE',
            },
        ];
        const route = OldRoute.factory({
            waypoints: [
                latLngWaypointFactory({ latLng: { lat: 0.1, lng: 0.1 } }),
                latLngWaypointFactory({ latLng: { lat: 0.3, lng: 0.3 } }),
            ],
        });

        expect(
            routeAirspaceOverlaps({
                route,
                airspaces,
            }),
        ).toEqual([{ airspace: airspaces[0], segments: [[0, route.totalDistance]] }]);
    });
    it('should return proper data when staying within 1 airspace with 2 legs', () => {
        const airspaces: Airspace[] = [
            {
                type: AirspaceType.CTR,
                airspaceClass: AirspaceClass.D,
                lowerLimit: new Height(0),
                higherLimit: new Altitude(1000),
                geometry: [
                    [0, 0],
                    [0, 1],
                    [1, 1],
                    [1, 0],
                    [0, 0],
                ].map((c) => ({ lat: lat(c[0]), lng: lng(c[1]) })),
                name: 'CTR IMAGINAIRE',
            },
        ];
        const route = OldRoute.factory({
            waypoints: [
                latLngWaypointFactory({ latLng: { lat: 0.1, lng: 0.1 } }),
                latLngWaypointFactory({ latLng: { lat: 0.2, lng: 0.2 } }),
                latLngWaypointFactory({ latLng: { lat: 0.3, lng: 0.3 } }),
            ],
        });

        expect(
            routeAirspaceOverlaps({
                route,
                airspaces,
            }),
        ).toEqual([{ airspace: airspaces[0], segments: [[0, route.totalDistance]] }]);
    });
    it('should return proper data when entering 1 airspace with 1 leg', () => {
        const airspaces: Airspace[] = [
            {
                type: AirspaceType.CTR,
                airspaceClass: AirspaceClass.D,
                lowerLimit: new Height(0),
                higherLimit: new Altitude(1000),
                geometry: [
                    [0, 0],
                    [0, 1],
                    [1, 1],
                    [1, 0],
                    [0, 0],
                ].map((c) => ({ lat: lat(c[0]), lng: lng(c[1]) })),
                name: 'CTR IMAGINAIRE',
            },
        ];
        const route = OldRoute.factory({
            waypoints: [
                latLngWaypointFactory({ latLng: { lat: -0.1, lng: -0.1 } }),
                latLngWaypointFactory({ latLng: { lat: 0.1, lng: 0.1 } }),
            ],
        });

        expect(
            routeAirspaceOverlaps({
                route,
                airspaces,
            }),
        ).toEqual([
            {
                airspace: airspaces[0],
                segments: [[route.totalDistance / 2, route.totalDistance]],
            },
        ]);
    });
});
