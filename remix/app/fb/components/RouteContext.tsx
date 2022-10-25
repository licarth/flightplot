import type { Unsubscribe } from 'firebase/database';
import type { PropsWithChildren } from 'react';
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { AirspaceType, DangerZoneType } from 'ts-aerodata-france';
import type { Route } from '../../domain';
import type { AirspaceSegmentOverlap } from '../../domain/AirspaceIntersection/routeAirspaceOverlaps';
import { routeAirspaceOverlaps } from '../../domain/AirspaceIntersection/routeAirspaceOverlaps';
import type { UUID } from '../../domain/Uuid/Uuid';
import type { ElevationAtPoint } from '../elevationOnRoute';
import { elevationOnRoute } from '../elevationOnRoute';
import { localApiElevationService } from '../ElevationService/googleApiElevationService';
import { useAiracData } from './useAiracData';
import { useUserRoutes } from './useUserRoutes';

const emptyElevation = { distancesFromStartInNm: [], elevations: [] };
type RouteContextProps = {
    route?: Route;
    setRoute: React.Dispatch<React.SetStateAction<Route | undefined>>;
    elevation: ElevationAtPoint;
    switchRoute: (routeId: UUID) => void;
    airspaceOverlaps: AirspaceSegmentOverlap[];
};

export const RouteContext = createContext<RouteContextProps>({
    setRoute: () => {},
    switchRoute: (routeId: UUID) => {},
    elevation: emptyElevation,
    airspaceOverlaps: [],
});

export const RouteProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { routes, saveRoute, listenToRouteChanges } = useUserRoutes();
    const [unsubscribe, setUnsubscribe] = useState<Unsubscribe>();
    // const [route, setRoute] = useState<Route>(exampleRoute);
    const [route, setRoute] = useState<Route>();

    const overlapDeterministicChangeKey = route?.waypoints
        .map((w) => `${w.latLng.lat}-${w.latLng.lng}`)
        .join('-');
    const [elevation, setElevation] = useState<ElevationAtPoint>(emptyElevation);

    const { airacData } = useAiracData();

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
                elevationService: localApiElevationService,
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
        return route && airacData
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
    }, [overlapDeterministicChangeKey, airacData]);

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
