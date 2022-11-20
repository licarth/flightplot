import type { Line } from 'cheap-ruler';
import CheapRuler from 'cheap-ruler';
import { Fragment, useState } from 'react';
import { Circle, Pane, Polyline, SVGOverlay, Tooltip } from 'react-leaflet';
import { toCheapRulerPoint } from '~/domain/toCheapRulerPoint';
import { VfrPointWaypoint } from '~/domain/Waypoint/VfrPointWaypoint';
import { VorPointWaypoint } from '~/domain/Waypoint/VorPointWaypoint';
import { Target as TargetIcon } from '~/generated/icons';
import type { Route, Waypoint } from '../../../../domain';
import type { LatLng } from '../../../../domain/LatLng';
import { fromtTurfPoint, toLatLng } from '../../../../domain/LatLng';
import type { LatLngWaypoint } from '../../../../domain/Waypoint';
import { AerodromeWaypoint, AerodromeWaypointType } from '../../../../domain/Waypoint';
import type { useRoute } from '../../useRoute';
import { boxAround } from '../boxAround';
import { useFixtureFocus } from '../FixtureFocusContext';
import { preventDefault } from '../preventDefault';
import { Z_INDEX_MOUSE_ADD_POINT_TOOLTIP } from '../zIndex';
import { FixtureWaypointMarker } from './FixtureWaypointMarker';
import type { WaypointType } from './LatLngWaypointMarker';
import { LatLngWaypointMarker } from './LatLngWaypointMarker';

export const FlightPlanningLayer = ({
    routeContext,
}: {
    routeContext: ReturnType<typeof useRoute>;
}) => {
    const {
        route: routeFromContext,
        replaceWaypoint,
        removeWaypoint,
        addLatLngWaypoint,
    } = routeContext;

    const route = routeFromContext!; // See parent component

    const { clickedLocation, highlightedFixture, highlightedLocation } = useFixtureFocus();

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
            {clickedLocation && !highlightedFixture && !highlightedLocation && (
                <SVGOverlay
                    key={`clicked-location-${clickedLocation.lat}-${clickedLocation.lng}`}
                    bounds={boxAround(toCheapRulerPoint(toLatLng(clickedLocation)), 10000)}
                    attributes={{ class: 'overflow-visible' }}
                    opacity={0.6}
                >
                    <TargetIcon />
                </SVGOverlay>
            )}
            {route &&
                route.waypoints.map((w, i) => (
                    <Fragment key={`wp-${i}-${w.id}`}>
                        {isLatLngWaypoint(w) && (
                            <LatLngWaypointMarker
                                key={`wpmarker-${w.id}`}
                                label={w.name ? w.name : undefined}
                                waypointNumber={i}
                                type={waypointType(w, i)}
                                position={w.latLng}
                                onDelete={() => removeWaypoint(i)}
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
                        {(AerodromeWaypoint.isAerodromeWaypoint(w) ||
                            VfrPointWaypoint.isVfrPointWaypoint(w) ||
                            VorPointWaypoint.isVorPointWaypoint(w)) && (
                            <FixtureWaypointMarker
                                key={`fixture-waypoint-${w.id}`}
                                label={w.name}
                                onDelete={() => removeWaypoint(i)}
                                waypointNumber={i}
                                type={waypointType(w, i)}
                                position={w.latLng}
                            />
                        )}
                        {route.waypoints[i + 1] && (
                            <Polyline
                                color={'#000000a2'}
                                weight={10}
                                lineCap={'butt'}
                                eventHandlers={{
                                    click: (e) => {
                                        preventDefault(e);
                                        e.originalEvent.stopPropagation();
                                        preventDefault(e);
                                        return addLatLngWaypoint({
                                            latLng: fromtTurfPoint(
                                                new CheapRuler(
                                                    route.waypoints[i].latLng.lat,
                                                    'nauticalmiles',
                                                ).pointOnLine(
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
                            >
                                <Pane
                                    name={`tooltip-add-point-${i}`}
                                    style={{ zIndex: Z_INDEX_MOUSE_ADD_POINT_TOOLTIP }}
                                >
                                    <Tooltip direction={'right'} offset={[0, 0]} opacity={1} sticky>
                                        Cliquez pour ajouter un point
                                    </Tooltip>
                                </Pane>
                            </Polyline>
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
                                        lineCap={'butt'}
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
                                        lineCap={'butt'}
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
    const ruler = new CheapRuler(waypoint1.latLng.lat, 'nauticalmiles');
    const pointA = toCheapRulerPoint(waypoint1.latLng);
    const pointB = toCheapRulerPoint(waypoint2.latLng);
    const aLine = [pointA, pointB];
    const lineDistance = ruler.lineDistance(aLine);

    if (lineDistance > 5) {
        const line = ruler.lineSliceAlong(2.5, lineDistance - 2.5, aLine);
        return [
            { lat: line[0][1], lng: line[0][0] },
            { lat: line[1][1], lng: line[1][0] },
        ];
    } else return [];
};

export const toLine = (latLngs: Array<LatLng>): Line =>
    latLngs.map((latLng) => [latLng.lng, latLng.lat]);

export const isLatLngWaypoint = (w: any): w is LatLngWaypoint => {
    return w._latLng !== undefined;
};
