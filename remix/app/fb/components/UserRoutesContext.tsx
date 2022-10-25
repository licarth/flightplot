import type { DataSnapshot, Unsubscribe } from 'firebase/database';
import { getDatabase, onValue, ref, remove, set } from 'firebase/database';
import * as Either from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as Option from 'fp-ts/lib/Option';
import * as _ from 'lodash';
import type { PropsWithChildren } from 'react';
import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import type { AiracData } from 'ts-aerodata-france';
import { Route } from '../../domain';
import type { UUID } from '../../domain/Uuid/Uuid';
import { useFirebaseAuth } from '../firebase/auth/FirebaseAuthContext';
import { useAiracData } from './useAiracData';

export const UserRoutesContext = createContext<{
    routes: Record<string, Route>;
    saveRoute: (route: Route) => void;
    deleteRoute: (routeId: UUID) => void;
    lastLocalChangeAt: number;
    listenToRouteChanges: (
        routeId: UUID,
        lastChangeAt: number,
        callback: (newRoute: Route) => void,
    ) => Unsubscribe;
    loading: boolean;
}>({
    routes: {},
    saveRoute: () => {},
    deleteRoute: () => {},
    lastLocalChangeAt: 0,
    listenToRouteChanges: () => () => {},
    loading: false,
});

type RoutesState = Record<string, Route> | 'loading';

export const UserRoutesProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { user } = useFirebaseAuth();

    const [routes, setRoutes] = useState<RoutesState>({});
    const lastLocalChangeAt = useRef<number>(0);

    const setLastLocalChangeAt = (current: number) => (lastLocalChangeAt.current = current);

    const [unsubscribeAllRoutes, setUnsubscribeAllRoutes] = useState<Unsubscribe>();
    const db = getDatabase();

    const { airacData, loading: airacDataLoading } = useAiracData();

    const shouldPropagateChange = (newRoute: Route) => {
        if (newRoute.lastChangeAt && lastLocalChangeAt) {
            if (newRoute.lastChangeAt > lastLocalChangeAt.current) {
                return true;
            } else {
                return false;
            }
        } else {
            console.log('NOT ENOUGH DATA');
        }
        return false;
    };

    const listenToRouteChanges = useCallback(
        (routeId: UUID, lastChangeAt: number, routeCallback: (newRoute: Route) => void) => {
            if (airacDataLoading) {
                return () => {};
            }
            const route = routes === 'loading' ? undefined : routes[routeId.toString()];
            setLastLocalChangeAt(lastChangeAt);
            if (route) {
                const dbAddress = `routes/${user?.uid}/${routeId.toString()}`;
                const newRouteCallback = (newRoute: Route): void => {
                    if (shouldPropagateChange(newRoute)) {
                        routeCallback(newRoute);
                    }
                    setLastLocalChangeAt(newRoute.lastChangeAt || 0);
                };
                const newUnsubscribe = onValue(
                    ref(db, dbAddress),
                    processValue(newRouteCallback, airacData),
                    (reason) => console.error(`Connection rejected: ${reason}`),
                );
                return () => {
                    newUnsubscribe();
                };
            } else {
                return () => {};
            }
        },
        [db, routes, user?.uid, airacDataLoading],
    );

    useEffect(() => {
        if (airacDataLoading) {
            return;
        }
        const db = getDatabase();
        unsubscribeAllRoutes && unsubscribeAllRoutes();
        const newU = onValue(
            ref(db, `routes/${user?.uid}`),
            (routes) => {
                const routesObject = routes.val() as Record<string, string | null>;
                const routesOrError = _.omitBy(
                    _.mapValues(routesObject, (v) =>
                        pipe(
                            Option.fromNullable(v),
                            Either.fromOption(() => new Error('no route stored')),
                            Either.map((x) => JSON.parse(x)),
                            Either.chainW(Route.codec(airacData).decode),
                            Either.fold(
                                () => null,
                                (r) => r,
                            ),
                        ),
                    ),
                    _.isNull,
                ) as Record<string, Route>;
                setRoutes(routesOrError);
            },
            (reason) => console.error(`Connection rejected: ${reason}`),
        );
        setUnsubscribeAllRoutes((_u) => () => {
            newU();
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, airacDataLoading]);

    const saveRoute = useCallback(
        (route: Route) => {
            if (airacDataLoading) {
                return;
            }
            console.log(`Saving route... with lastChangeAt ${route.lastChangeAt}`);
            const aRef = ref(db, `routes/${user?.uid}/${route.id.toString()}`);
            const routeJson = JSON.stringify(Route.codec(airacData).encode(route));
            setLastLocalChangeAt(route.lastChangeAt || 0);
            set(aRef, routeJson)
                .then(() => {
                    setRoutes((routes) =>
                        routes === 'loading'
                            ? { [route.id.toString()]: route }
                            : { ...routes, [route.id.toString()]: route },
                    );
                })
                .catch((reason) => console.error(`Connection rejected: ${reason}`));
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [user, airacDataLoading],
    );

    const deleteRoute = useCallback(
        (routeId: UUID) => {
            const db = getDatabase();
            remove(ref(db, `routes/${user?.uid}/${routeId.toString()}`)).catch((reason) =>
                console.error(`Connection rejected: ${reason}`),
            );
        },
        [user],
    );

    const loading = routes === 'loading';
    return (
        <UserRoutesContext.Provider
            value={{
                routes: loading ? {} : routes,
                saveRoute,
                deleteRoute,
                lastLocalChangeAt: lastLocalChangeAt.current || 0,
                listenToRouteChanges,
                loading,
            }}
        >
            {children}
        </UserRoutesContext.Provider>
    );
};

const processValue =
    (newRouteCallback: (newRoute: Route) => void, airacData: AiracData) =>
    (rSnapshot: DataSnapshot) => {
        console.log('Current route has changed !');
        const routeString = rSnapshot.val() as string;
        if (routeString) {
            pipe(
                Option.fromNullable(rSnapshot.val() as string),
                Either.fromOption(() => new Error('no route stored')),
                Either.map((x) => JSON.parse(x)),
                Either.chainW(Route.codec(airacData).decode),
                Either.fold((e) => {
                    //@ts-ignore
                    console.error(draw(e));
                    return null;
                }, newRouteCallback),
            );
        }
    };
