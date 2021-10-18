import * as Either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as Option from "fp-ts/lib/Option";
import React, { createContext, useState } from "react";
import { AiracCycles, AiracData } from "ts-aerodata-france";
import { Route } from "../domain";

export const RouteContext = createContext<{
  route: Route;
  setRoute: React.Dispatch<React.SetStateAction<Route>>;
}>({ route: Route.empty(), setRoute: () => {} });

const airacData = AiracData.loadCycle(AiracCycles.NOV_04_2021);

export const RouteProvider: React.FC = ({ children }) => {
  const routeItem = window.localStorage.getItem("route");
  console.log(routeItem);
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

  console.log(`RouteContext: ${JSON.stringify(route)}`);

  return (
    <RouteContext.Provider value={{ route, setRoute }}>
      {children}
    </RouteContext.Provider>
  );
};

// const isDecoderError = (e: Error | DecodeError): e is DecodeError => {
//   return !!e.message;
// };
