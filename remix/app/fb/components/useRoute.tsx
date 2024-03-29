import { useCallback, useContext } from 'react';
import type { Aerodrome, VfrPoint, Vor } from 'ts-aerodata-france';
import type { VorPointWaypoint } from '~/domain/Waypoint/VorPointWaypoint';
import { AerodromeWaypoint, AerodromeWaypointType, Route, Waypoint } from '../../domain';
import type { LatLng } from '../../domain/LatLng';
import { RouteContext } from './RouteContext';

export type SetWaypointAltitude = ({
    waypointPosition,
    altitude,
}: {
    waypointPosition: number;
    altitude: number | null;
}) => void;

export type MoveWaypoint = (currentWaypointPosition: number, newWaypointPosition: number) => void;

export type AddSameWaypointAgain = (waypointPosition: number) => void;

export type RemoveWaypoint = (waypointPosition: number) => void;

export type ReplaceWaypoint = ({
    waypointPosition,
    newWaypoint,
}: {
    waypointPosition: number;
    newWaypoint: Waypoint;
}) => void;

export type UseRouteProps = ReturnType<typeof useRoute>;

export const useRoute = () => {
    const { route, setRoute, elevation, switchRoute, airspaceOverlaps } = useContext(RouteContext);

    const addLatLngWaypoint = useCallback(
        ({
            latLng,
            position,
            name,
        }: {
            latLng: LatLng;
            position?: number;
            name?: string | null;
        }) => {
            setRoute((oldRoute) =>
                (oldRoute || Route.empty()).addWaypoint({
                    position,
                    waypoint: Waypoint.create({
                        latLng,
                        name: name || null,
                        altitude: null,
                    }),
                }),
            );
        },
        [setRoute],
    );

    const addAerodromeWaypoint = useCallback(
        ({ aerodrome, position }: { aerodrome: Aerodrome; position?: number }) => {
            setRoute((oldRoute) => {
                const newRoute = (oldRoute || Route.empty()).addWaypoint({
                    position,
                    waypoint: Waypoint.fromAerodrome({
                        aerodrome,
                        waypointType: AerodromeWaypointType.RUNWAY,
                    }),
                });
                if (!oldRoute) {
                    switchRoute(newRoute.id);
                }
                return newRoute;
            });
        },
        [setRoute, switchRoute],
    );
    const addVorDmeWaypoint = useCallback(
        ({
            vorDme,
            position,
            qdr = 0,
            distanceInNm = 0,
        }: {
            vorDme: Vor;
            position?: number;
            qdr?: VorPointWaypoint['qdr'];
            distanceInNm?: VorPointWaypoint['distanceInNm'];
        }) => {
            setRoute((oldRoute) => {
                const newRoute = (oldRoute || Route.empty()).addWaypoint({
                    position,
                    waypoint: Waypoint.fromVorDme({
                        vorDme,
                        qdr,
                        distanceInNm,
                    }),
                });
                if (!oldRoute) {
                    switchRoute(newRoute.id);
                }
                return newRoute;
            });
        },
        [setRoute, switchRoute],
    );

    const addVfrPointWaypoint = useCallback(
        ({ vfrPoint, position }: { vfrPoint: VfrPoint; position?: number }) => {
            setRoute((oldRoute) => {
                const newRoute = (oldRoute || Route.empty()).addWaypoint({
                    position,
                    waypoint: Waypoint.fromVfrPoint({
                        vfrPoint,
                    }),
                });
                if (!oldRoute) {
                    switchRoute(newRoute.id);
                }
                return newRoute;
            });
        },
        [setRoute, switchRoute],
    );

    const replaceWaypoint = useCallback(
        ({ waypointPosition, newWaypoint }: { waypointPosition: number; newWaypoint: Waypoint }) =>
            setRoute((oldRoute) =>
                (oldRoute || Route.empty()).replaceWaypoint({
                    waypointPosition,
                    newWaypoint,
                }),
            ),
        [setRoute],
    );

    const setAerodromeWaypointType = useCallback(
        ({
            waypointPosition,
            waypointType,
        }: {
            waypointPosition: number;
            waypointType: AerodromeWaypointType;
        }) => {
            const currentWaypoint = route!.waypoints[waypointPosition];
            if (AerodromeWaypoint.isAerodromeWaypoint(currentWaypoint)) {
                replaceWaypoint({
                    waypointPosition,
                    newWaypoint: currentWaypoint.clone({ waypointType }),
                });
            }
        },
        [route, replaceWaypoint],
    );

    const moveWaypoint: MoveWaypoint = useCallback(
        (currentWaypointPosition, newWaypointPosition) =>
            setRoute((oldRoute) =>
                (oldRoute || Route.empty()).moveWaypoint(
                    currentWaypointPosition,
                    newWaypointPosition,
                ),
            ),
        [setRoute],
    );

    const setWaypointAltitude: SetWaypointAltitude = useCallback(
        ({ waypointPosition, altitude }) => {
            const w = route!.waypoints[waypointPosition];
            const newWaypoint = w.clone({ altitude });
            replaceWaypoint({ waypointPosition, newWaypoint });
        },
        [route, replaceWaypoint],
    );

    const addSameWaypointAgain: AddSameWaypointAgain = useCallback(
        (waypointPosition) => {
            const w = route!.waypoints[waypointPosition];
            setRoute((oldRoute) => oldRoute!.addWaypoint({ waypoint: w }));
        },
        [route, setRoute],
    );

    const removeWaypoint: RemoveWaypoint = (waypointPosition) => {
        setRoute((oldRoute) => oldRoute!.removeWaypoint(waypointPosition));
    };

    return {
        route,
        setRoute,
        switchRoute,
        elevation,
        removeWaypoint,
        replaceWaypoint,
        addSameWaypointAgain,
        setWaypointAltitude,
        moveWaypoint,
        addAerodromeWaypoint,
        addLatLngWaypoint,
        addVfrPointWaypoint,
        addVorDmeWaypoint,
        setAerodromeWaypointType,
        airspaceOverlaps,
    };
};
