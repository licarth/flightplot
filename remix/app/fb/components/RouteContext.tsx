import type { Unsubscribe } from 'firebase/database';
import type { PropsWithChildren } from 'react';
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { AiracCycles, AiracData, AirspaceType, DangerZoneType } from 'ts-aerodata-france';
import { AerodromeWaypointType, latLngWaypointFactory, Route, Waypoint } from '../domain';
import { routeAirspaceOverlaps } from '../domain/AirspaceIntersection/routeAirspaceOverlaps';
import type { UUID } from '../domain/Uuid/Uuid';
import type { ElevationAtPoint } from '../elevationOnRoute';
import { elevationOnRoute } from '../elevationOnRoute';
import { openElevationApiElevationService } from '../ElevationService/openElevationApiElevationService';
import { FORMATS } from './PrintContext';
import { useUserRoutes } from './useUserRoutes';

const emptyElevation = { distancesFromStartInNm: [], elevations: [] };
export const RouteContext = createContext<{
    route?: Route;
    setRoute: React.Dispatch<React.SetStateAction<Route | undefined>>;
    elevation: ElevationAtPoint;
    switchRoute: (routeId: UUID) => void;
    airspaceOverlaps: AirspaceSegmentOverlap[];
}>({
    setRoute: () => {},
    switchRoute: (routeId: UUID) => {},
    elevation: emptyElevation,
    airspaceOverlaps: [],
});

const airacData = AiracData.loadCycle(AiracCycles.AUG_11_2022);
const exampleRoute = Route.empty()
    .setTitle('Toto')
    .addWaypoint({
        position: 0,
        waypoint: Waypoint.fromAerodrome({
            aerodrome: airacData.aerodromes[3],
            waypointType: AerodromeWaypointType.RUNWAY,
        }),
    })
    .addWaypoint({
        position: 1,
        waypoint: latLngWaypointFactory({
            altitude: 1500,
            name: 'WPT 1',
            latLng: { lat: 42, lng: 3 },
        }),
    })
    .addPrintArea({ bottomLeft: { lat: 42, lng: 3 }, pageFormat: FORMATS.A4_PORTRAIT });

export const RouteProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { routes, saveRoute, listenToRouteChanges } = useUserRoutes();
    const [unsubscribe, setUnsubscribe] = useState<Unsubscribe>();
    // const [route, setRoute] = useState<Route>(exampleRoute);
    const [route, setRoute] = useState<Route>();

    const overlapDeterministicChangeKey = route?.waypoints
        .map((w) => `${w.latLng.lat}-${w.latLng.lng}`)
        .join('-');
    const [elevation, setElevation] = useState<ElevationAtPoint>(emptyElevation);

    useEffect(() => {
        // Update route if it already exists.
        if (route) {
            console.log('Saving route');
            saveRoute(route);
        }
    }, [route, saveRoute]);

    useEffect(() => {
        route &&
            elevationOnRoute({
                elevationService: openElevationApiElevationService,
            })(route).then((e) => setElevation(e));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route, route?.waypoints]);

    const switchRoute = (routeId: UUID) => {
        const newlySelectedRoute = routes[routeId.toString()];
        if (newlySelectedRoute) {
            setRoute(newlySelectedRoute);
            unsubscribe !== undefined && unsubscribe();
            const newUnsubscribe = listenToRouteChanges(
                routeId,
                newlySelectedRoute.lastChangeAt!,
                (newRoute) => {
                    setRoute(newRoute);
                },
            );
            setUnsubscribe((_u) => () => {
                newUnsubscribe();
            });
        }
    };

    const airspaceOverlaps = useMemo(() => {
        return route
            ? routeAirspaceOverlaps({
                  route,
                  airspaces: [
                      ...airacData
                          .getAirspacesInBbox(...route.boundingBox)
                          .filter(({ type }) =>
                              [AirspaceType.CTR, AirspaceType.TMA].includes(type),
                          ),
                      ...airacData
                          .getDangerZonesInBbox(...route.boundingBox)
                          .filter(({ type }) => [DangerZoneType.P].includes(type)),
                  ],
              })
            : [];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [overlapDeterministicChangeKey]);

    return (
        <RouteContext.Provider
            value={{
                route,
                setRoute,
                elevation,
                switchRoute,
                airspaceOverlaps,
            }}
        >
            {children}
        </RouteContext.Provider>
    );
};
