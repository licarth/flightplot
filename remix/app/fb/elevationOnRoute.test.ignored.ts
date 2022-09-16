import { Route, Waypoint } from '../domain';
import { elevationOnRoute } from './elevationOnRoute';
import { openElevationApiElevationService } from './ElevationService/openElevationApiElevationService';

describe.skip('elevationOnRoute', () => {
    it('should return something', async () => {
        expect(
            (
                await elevationOnRoute({
                    elevationService: openElevationApiElevationService,
                })(
                    new Route({
                        waypoints: [
                            Waypoint.create({
                                latLng: { lat: 43, lng: -10 },
                                altitude: null,
                                name: null,
                            }),
                            Waypoint.create({
                                latLng: { lat: 43, lng: -10.1 },
                                altitude: null,
                                name: null,
                            }),
                        ],
                    }),
                )
            ).elevations,
        ).toEqual([0, 0, 0, 0, 0]);
    });
});
