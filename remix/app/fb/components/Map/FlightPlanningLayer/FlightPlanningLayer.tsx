import type { Line } from 'cheap-ruler';
import CheapRuler from 'cheap-ruler';
import { Fragment, useEffect, useState } from 'react';
import { Circle, Polyline, useMap, useMapEvent } from 'react-leaflet';
import type { Route, Waypoint } from '../../../domain';
import type { LatLngWaypoint } from '../../../domain/Waypoint';
import { AerodromeWaypoint, AerodromeWaypointType } from '../../../domain/Waypoint';
import type { LatLng } from '../../../LatLng';
import type { useRoute } from '../../useRoute';
import { preventDefault } from '../preventDefault';
import { AerodromeWaypointMarker } from './AerodromeWaypointMarker';
import type { WaypointType } from './LatLngWaypointMarker';
import { LatLngWaypointMarker } from './LatLngWaypointMarker';

const ruler = new CheapRuler(43, 'nauticalmiles');

export const FlightPlanningLayer = ({
    routeContext,
}: {
    routeContext: ReturnType<typeof useRoute>;
}) => {
    const {
        route: routeFromContext,
        addSameWaypointAgain,
        replaceWaypoint,
        removeWaypoint,
        addLatLngWaypoint,
    } = routeContext;

    const route = routeFromContext!; // See parent component

    useMapEvent('click', (e) => {
        addLatLngWaypoint({ latLng: e.latlng });
    });

    const leafletMap = useMap();
    const routeId = route.id.toString();
    useEffect(() => {
        route.waypoints.length > 0 &&
            leafletMap.flyToBounds(route.leafletBoundingBox, {
                maxZoom: 11,
                animate: false,
                padding: [100, 100],
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leafletMap, routeId]);

    type TemporaryWaypoint = {
        waypointBefore?: Waypoint;
        waypoint: Waypoint;
        waypointAfter?: Waypoint;
    };

    const [temporaryWaypoint, setTemporaryWaypoint] = useState<TemporaryWaypoint | null>(null);

    const waypointType = (w: Waypoint, i: number): WaypointType => {
        if (AerodromeWaypoint.isAerodromeWaypoint(w)) {
            if (w.waypointType === AerodromeWaypointType.RUNWAY) {
                return i === 0 ? 'departure' : 'arrival';
            }
        }
        return 'intermediate';
    };

    return (
        <>
            {route.waypoints.map((w, i) => (
                <Fragment key={`wp-${i}-${w.id}`}>
                    {isLatLngWaypoint(w) && (
                        <LatLngWaypointMarker
                            key={`wpmarker-${w.id}`}
                            label={w.name ? w.name : undefined}
                            waypointNumber={i}
                            type={waypointType(w, i)}
                            position={w.latLng}
                            onDelete={() => removeWaypoint(i)}
                            onClick={() => addSameWaypointAgain(i)}
                            onDragEnd={(latLng) => {
                                setTemporaryWaypoint(null);
                                return replaceWaypoint({
                                    waypointPosition: i,
                                    newWaypoint: w.clone({ latLng }),
                                });
                            }}
                            setName={(name) => {
                                replaceWaypoint({
                                    waypointPosition: i,
                                    newWaypoint: w.clone({ name }),
                                });
                            }}
                            onDrag={(latLng) => {
                                return setTemporaryWaypoint({
                                    waypoint: w.clone({ latLng }),
                                    waypointAfter: route.waypoints[i + 1],
                                    waypointBefore: route.waypoints[i - 1],
                                });
                            }}
                        />
                    )}
                    {AerodromeWaypoint.isAerodromeWaypoint(w) && (
                        <AerodromeWaypointMarker
                            key={`waypoint-${w.id}`}
                            label={w.name}
                            onDelete={() => removeWaypoint(i)}
                            onClick={() => addSameWaypointAgain(i)}
                            waypointNumber={i}
                            type={waypointType(w, i)}
                            position={w.latLng}
                        />
                    )}
                    {route.waypoints[i + 1] && (
                        <Polyline
                            color={'#000000a2'}
                            weight={10}
                            lineCap={'square'}
                            eventHandlers={{
                                click: (e) => {
                                    preventDefault(e);
                                    return addLatLngWaypoint({
                                        latLng: pointToLeafletLatLng(
                                            ruler.pointOnLine(
                                                toLine([
                                                    route.waypoints[i].latLng,
                                                    route.waypoints[i + 1].latLng,
                                                ]),
                                                toCheapRulerPoint(e.latlng),
                                            ).point,
                                        ),
                                        position: i + 1,
                                    });
                                },
                            }}
                            positions={createLineForRouteSegment(route, i)}
                        />
                    )}
                    {temporaryWaypoint && (
                        <>
                            <Circle
                                key={`circle-temporary`}
                                fill={false}
                                center={temporaryWaypoint.waypoint.latLng}
                                radius={1000 * 2.5 * 1.852}
                                pathOptions={{
                                    color: 'black',
                                    dashArray: '20',
                                }}
                                fillOpacity={0}
                            />
                            {temporaryWaypoint.waypointBefore && (
                                <Polyline
                                    color={'black'}
                                    dashArray="20"
                                    lineCap={'square'}
                                    positions={lineBetweenWaypoints(
                                        temporaryWaypoint.waypointBefore,
                                        temporaryWaypoint.waypoint,
                                    )}
                                />
                            )}
                            {temporaryWaypoint.waypointAfter && (
                                <Polyline
                                    color={'black'}
                                    dashArray="20"
                                    lineCap={'square'}
                                    positions={lineBetweenWaypoints(
                                        temporaryWaypoint.waypoint,
                                        temporaryWaypoint.waypointAfter,
                                    )}
                                />
                            )}
                        </>
                    )}
                </Fragment>
            ))}
        </>
    );
};

export function createLineForRouteSegment(route: Route, segmentNumber: number) {
    const waypoint1 = route.waypoints[segmentNumber];
    const waypoint2 = route.waypoints[segmentNumber + 1];
    return lineBetweenWaypoints(waypoint1, waypoint2);
}

const lineBetweenWaypoints = (waypoint1: Waypoint, waypoint2: Waypoint) => {
    const pointA = toCheapRulerPoint(waypoint1.latLng);
    const pointB = toCheapRulerPoint(waypoint2.latLng);
    const aLine = [pointA, pointB];
    const lineDistance = ruler.lineDistance(aLine);

    if (lineDistance > 5) {
        const line = ruler.lineSliceAlong(2.6, lineDistance - 2.6, aLine);
        return [
            { lat: line[0][1], lng: line[0][0] },
            { lat: line[1][1], lng: line[1][0] },
        ];
    } else return [];
};

export const pointToLeafletLatLng = ([x, y]: [number, number]) => ({
    lat: y,
    lng: x,
});

export const toCheapRulerPoint = (latLng: LatLng): [number, number] => [latLng.lng, latLng.lat];

export const toLine = (latLngs: Array<LatLng>): Line =>
    latLngs.map((latLng) => [latLng.lng, latLng.lat]);

export const isLatLngWaypoint = (w: any): w is LatLngWaypoint => {
    return w._latLng !== undefined;
};
