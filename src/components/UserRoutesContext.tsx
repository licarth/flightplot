import { getDatabase, onValue, ref, remove, set } from "firebase/database";
import * as Either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as Option from "fp-ts/lib/Option";
import * as _ from "lodash";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { AiracCycles, AiracData } from "ts-aerodata-france";
import { Route } from "../domain";
import { UUID } from "../domain/Uuid/Uuid";
import { useFirebaseAuth } from "../firebase/auth/FirebaseAuthContext";

export const UserRoutesContext = createContext<{
  routes: Record<string, Route>;
  saveRoute: (route: Route) => void;
  deleteRoute: (routeId: UUID) => void;
}>({
  routes: {},
  saveRoute: () => {},
  deleteRoute: () => {},
});

const airacData = AiracData.loadCycle(AiracCycles.NOV_04_2021);

export const UserRoutesProvider: React.FC = ({ children }) => {
  const { user } = useFirebaseAuth();

  const [routes, setRoutes] = useState<Record<string, Route>>({});

  useEffect(() => {
    const db = getDatabase();
    console.log(`requesting route with user ${user ? user.uid : "none"}`);
    onValue(
      ref(db, `routes/${user?.uid}`),
      (routes) => {
        const routesObject = routes.val() as Record<string, string | null>;
        const routesOrError = _.omitBy(
          _.mapValues(routesObject, (v) =>
            pipe(
              Option.fromNullable(v),
              Either.fromOption(() => new Error("no route stored")),
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
  }, [user]);

  const saveRoute = useCallback(
    (route: Route) => {
      const db = getDatabase();
      set(
        ref(db, `routes/${user?.uid}/${route.id.toString()}`),
        JSON.stringify(Route.codec(airacData).encode(route)),
      )
        .then(() => {
          setRoutes((routes) => ({ ...routes, [route.id.toString()]: route }));
        })
        .catch((reason) => console.error(`Connection rejected: ${reason}`));
    },
    [user],
  );

  const deleteRoute = useCallback(
    (routeId: UUID) => {
      const db = getDatabase();
      remove(ref(db, `routes/${user?.uid}/${routeId.toString()}`)).catch(
        (reason) => console.error(`Connection rejected: ${reason}`),
      );
    },
    [user],
  );

  return (
    <UserRoutesContext.Provider value={{ routes, saveRoute, deleteRoute }}>
      {children}
    </UserRoutesContext.Provider>
  );
};
