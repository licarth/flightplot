import {
    DataSnapshot,
    getDatabase,
    onValue,
    ref,
    remove,
    set,
    Unsubscribe,
} from 'firebase/database';
import * as Either from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as Option from 'fp-ts/lib/Option';
import * as _ from 'lodash';
import React, {
    createContext,
    PropsWithChildren,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { AiracCycles, AiracData } from 'ts-aerodata-france';
import { Route } from '../domain';
import { UUID } from '../domain/Uuid/Uuid';
import { useFirebaseAuth } from '../firebase/auth/FirebaseAuthContext';

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
}>({
    routes: {},
    saveRoute: () => {},
    deleteRoute: () => {},
    lastLocalChangeAt: 0,
    listenToRouteChanges: () => () => {},
});

const airacData = AiracData.loadCycle(AiracCycles.AUG_11_2022);

export const UserRoutesProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { user } = useFirebaseAuth();
    const [routes, setRoutes] = useState<Record<string, Route>>({});
    const lastLocalChangeAt = useRef<number>(0);

    const setLastLocalChangeAt = (current: number) => (lastLocalChangeAt.current = current);

    const [unsubscribeAllRoutes, setUnsubscribeAllRoutes] = useState<Unsubscribe>();
    const db = getDatabase();

    const shouldPropagateChange = (newRoute: Route) => {
        console.log(`remote: ${newRoute.lastChangeAt}`);
        console.log(`local: ${lastLocalChangeAt.current}`);
        if (newRoute.lastChangeAt && lastLocalChangeAt) {
            console.log(
                `${
                    newRoute.lastChangeAt > lastLocalChangeAt.current ? 'remote' : 'local'
                } more recent`,
            );
            if (newRoute.lastChangeAt > lastLocalChangeAt.current) {
                console.log('ROUTE UPDATE FROM OTHER WINDOW');
                return true;
            } else {
                console.log('IGNORING OWN ROUTE UPDATE');
                return false;
            }
        } else {
            console.log('NOT ENOUGH DATA');
        }
        return false;
    };

    const listenToRouteChanges = useCallback(
        (routeId: UUID, lastChangeAt: number, routeCallback: (newRoute: Route) => void) => {
            const route = routes[routeId.toString()];
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
                    processValue(newRouteCallback),
                    (reason) => console.error(`Connection rejected: ${reason}`),
                );
                return () => {
                    newUnsubscribe();
                };
            } else {
                return () => {};
            }
        },
        [db, routes, user?.uid],
    );

    useEffect(() => {
        const db = getDatabase();
        console.log(`requesting route with user ${user ? user.uid : 'none'}`);
        unsubscribeAllRoutes && unsubscribeAllRoutes();
        const newU = onValue(
            ref(db, `routes/${user?.uid}`),
            (routes) => {
                console.log('Routes object has changed !');
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
    }, [user]);

    const saveRoute = useCallback(
        (route: Route) => {
            console.log(`Saving route... with lastChangeAt ${route.lastChangeAt}`);
            const aRef = ref(db, `routes/${user?.uid}/${route.id.toString()}`);
            const routeJson = JSON.stringify(Route.codec(airacData).encode(route));
            setLastLocalChangeAt(route.lastChangeAt || 0);
            set(aRef, routeJson)
                .then(() => {
                    setRoutes((routes) => ({ ...routes, [route.id.toString()]: route }));
                })
                .catch((reason) => console.error(`Connection rejected: ${reason}`));
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [user],
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

    return (
        <UserRoutesContext.Provider
            value={{
                routes,
                saveRoute,
                deleteRoute,
                lastLocalChangeAt: lastLocalChangeAt.current || 0,
                listenToRouteChanges,
            }}
        >
            {children}
        </UserRoutesContext.Provider>
    );
};

const processValue = (newRouteCallback: (newRoute: Route) => void) => (rSnapshot: DataSnapshot) => {
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
