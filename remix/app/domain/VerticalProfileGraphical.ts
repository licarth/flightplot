import type { LineString } from '@turf/turf';
import * as turf from '@turf/turf';
import type { Airspace, Latitude, Longitude } from 'ts-aerodata-france';
import type { LatLng } from './LatLng';
import type { OldRoute } from './Route';

type Props = { airspaces: Airspace[]; route: OldRoute };

export const toArrayCoords = (
    latLng: LatLng | { lat: Latitude; lng: Longitude },
): [number, number] => [Number(latLng.lng), Number(latLng.lat)];

const airspaceAsPolygon = (airspace: Airspace) => {
    return turf.polygon([airspace.geometry.map((latlng) => toArrayCoords(latlng))]);
};

export const routeAirspaceOverlapsGraphical = ({ airspaces, route }: Props) => {
    if (route.length < 1) return [];
    const overlaps = airspaces.flatMap(airspaceAsPolygon).flatMap((airspacePolygon) => {
        return route.legs.map(({ departureWaypoint, arrivalWaypoint }) => {
            const routeLinePart = turf.lineString([
                toArrayCoords(departureWaypoint.latLng),
                toArrayCoords(arrivalWaypoint.latLng),
            ]);
            const oo: LineString[] = [];
            let split = turf.lineSplit(routeLinePart, airspacePolygon);
            let oddPair: number;
            const isFirstPointInPolygon = turf.booleanPointInPolygon(
                routeLinePart.geometry.coordinates[0],
                airspacePolygon,
            );
            if (isFirstPointInPolygon) {
                oddPair = 0;
            } else {
                oddPair = 1;
            }
            if (split.features.length > 0) {
                orderFeatures(
                    split.features,
                    arrivalWaypoint.latLng.lng - departureWaypoint.latLng.lng,
                ).forEach((splitedPart, i) => {
                    if ((i + oddPair) % 2 === 0) {
                        oo.push(splitedPart.geometry);
                    }
                });
            } else if (isFirstPointInPolygon) {
                oo.push(routeLinePart.geometry);
            }
            return oo;
        });
    });
    return overlaps;
};

function orderFeatures(
    features: turf.helpers.Feature<turf.helpers.LineString, turf.helpers.Properties>[],
    arg1: number,
) {
    return features.sort(
        (a, b) => arg1 * (a.geometry.coordinates[0][0] - b.geometry.coordinates[0][0]),
    );
}
