import React, { createContext, useState } from "react";
import { Route } from "../domain";

export const RouteContext = createContext<{
  route: Route;
  setRoute: React.Dispatch<React.SetStateAction<Route>>;
}>({ route: Route.empty(), setRoute: () => {} });

export const RouteProvider: React.FC = ({ children }) => {
  const [route, setRoute] = useState<Route>(
    new Route({
      waypoints: [],
    }),
  );

  return (
    <RouteContext.Provider value={{ route, setRoute }}>
      {children}
    </RouteContext.Provider>
  );
};
