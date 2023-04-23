import { UUID } from '../Uuid';
import { AerodromeWpt } from './AerodromeWpt';
import { AltitudeInFeet } from './AltHeightFl';
import { LatLngWpt } from './LatLngWpt';
import { Route } from './Route';
import { VfrWpt } from './VfrWpt';
import { VorWpt } from './VorWpt';

describe('Route', () => {
    it('should be correctly encoded', () => {
        const result = Route.codec('string').encode(
            Route.factory({
                waypoints: [
                    new AerodromeWpt({
                        icaoCode: 'LFMT',
                        altHeightFl: AltitudeInFeet.of(1000),
                        waypointType: 'OVERFLY',
                    }),
                    new VorWpt({
                        ident: 'FJR',
                        altHeightFl: AltitudeInFeet.of(1000),
                    }),
                    new VfrWpt({
                        icaoCode: 'LFMT',
                        ident: 'SW',
                        altHeightFl: AltitudeInFeet.of(1000),
                    }),
                    new LatLngWpt({
                        id: UUID.generatev4(),
                        name: 'Test',
                        latLng: {
                            lat: 0,
                            lng: 0,
                        },
                        altHeightFl: AltitudeInFeet.of(1000),
                    }),
                ],
            }),
        );

        expect(result).toMatchObject({
            _tag: 'Route',
            _version: 1,
            id: expect.any(String),
            title: 'Route Title',
            waypoints: [
                {
                    _tag: 'AerodromeWpt',
                    _version: 1,
                    icaoCode: 'LFMT',
                    altHeightFl: {
                        _tag: 'AltitudeInFeet',
                        _version: 1,
                        altitudeInFeet: 1000,
                    },
                },
                {
                    _tag: 'VorWpt',
                    _version: 1,
                    ident: 'FJR',
                    altHeightFl: {
                        _tag: 'AltitudeInFeet',
                        _version: 1,
                        altitudeInFeet: 1000,
                    },
                },
                {
                    _tag: 'VfrWpt',
                    _version: 1,
                    icaoCode: 'LFMT',
                    ident: 'SW',
                    altHeightFl: {
                        _tag: 'AltitudeInFeet',
                        _version: 1,
                        altitudeInFeet: 1000,
                    },
                },
                {
                    _tag: 'LatLngWpt',
                    _version: 1,
                    id: expect.any(String),
                    name: 'Test',
                    latLng: {
                        lat: 0,
                        lng: 0,
                    },
                    altHeightFl: {
                        _tag: 'AltitudeInFeet',
                        _version: 1,
                        altitudeInFeet: 1000,
                    },
                },
            ],
            printAreas: [],
        });
    });
});
