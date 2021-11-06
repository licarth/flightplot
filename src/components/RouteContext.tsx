import { get, getDatabase, ref } from "firebase/database";
import * as Either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as Option from "fp-ts/lib/Option";
import { draw } from "io-ts/lib/Decoder";
import React, { createContext, useEffect, useState } from "react";
import { AiracCycles, AiracData } from "ts-aerodata-france";
import { Route } from "../domain";
import { ElevationAtPoint, elevationOnRoute } from "../elevationOnRoute";
import { openElevationApiElevationService } from "../ElevationService/openElevationApiElevationService";
import { useFirebaseAuth } from "../firebase/auth/FirebaseAuthContext";

const emptyElevation = { distancesFromStartInNm: [], elevations: [] };
export const RouteContext = createContext<{
  route: Route;
  setRoute: React.Dispatch<React.SetStateAction<Route>>;
  elevation: ElevationAtPoint;
}>({
  route: Route.empty(),
  setRoute: () => {},
  elevation: emptyElevation,
});

const airacData = AiracData.loadCycle(AiracCycles.NOV_04_2021);

export const RouteProvider: React.FC = ({ children }) => {
  const { user } = useFirebaseAuth();

  const [route, setRoute] = useState<Route>(Route.empty());

  useEffect(() => {
    const db = getDatabase();
    console.log(`requesting route with user ${user ? user.uid : "none"}`);
    get(ref(db, `routes/${user?.uid}/default`)).then((rSnapshot) => {
      const routeString = rSnapshot.val() as string;
      if (routeString) {
        pipe(
          Option.fromNullable(rSnapshot.val() as string),
          Either.fromOption(() => new Error("no route stored")),
          Either.map((x) => JSON.parse(x)),
          Either.chainW(Route.codec(airacData).decode),
          Either.fold(
            (e) => {
              //@ts-ignore
              console.error(draw(e));
              return null;
            },
            (route) => {
              setRoute(route);
            },
          ),
        );
      }
    });
  }, [user]);

  const [elevation, setElevation] = useState<ElevationAtPoint>(emptyElevation);

  useEffect(() => {
    if (route.length > 1) {
      elevationOnRoute({ elevationService: openElevationApiElevationService })(
        route,
      ).then((e) => setElevation(e));
    } else {
      setElevation(emptyElevation);
    }
  }, [route]);

  return (
    <RouteContext.Provider value={{ route, setRoute, elevation }}>
      {children}
    </RouteContext.Provider>
  );
};
