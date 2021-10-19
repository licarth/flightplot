import * as Either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as Option from "fp-ts/lib/Option";
import React, { createContext, useEffect, useState } from "react";
import { AiracCycles, AiracData } from "ts-aerodata-france";
import { Route } from "../domain";
import { ElevationAtPoint, elevationOnRoute } from "../elevationOnRoute";
import { openElevationApiElevationService } from "../ElevationService/openElevationApiElevationService";

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
  const routeItem = window.localStorage.getItem("route");
  const locallyStoredRoute = pipe(
    Option.fromNullable(routeItem),
    Either.fromOption(() => new Error("no route stored")),
    Either.map((x) => JSON.parse(x)),
    Either.chainW(Route.codec(airacData).decode),
    Either.fold(
      (e) => {
        return null;
      },
      (r) => r,
    ),
  );

  const [route, setRoute] = useState<Route>(
    locallyStoredRoute !== null
      ? locallyStoredRoute
      : new Route({
          waypoints: [],
        }),
  );

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
