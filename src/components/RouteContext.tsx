import { Unsubscribe } from "@firebase/util";
import { getDatabase, onValue, ref } from "firebase/database";
import * as Either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as Option from "fp-ts/lib/Option";
import { draw } from "io-ts/lib/Decoder";
import * as _ from "lodash";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AiracCycles,
  AiracData,
  AirspaceType,
  DangerZoneType,
} from "ts-aerodata-france";
import { Route } from "../domain";
import {
  routeAirspaceOverlaps,
  AirspaceSegmentOverlap,
} from "../domain/routeAirspaceOverlaps";
import { UUID } from "../domain/Uuid/Uuid";
import { ElevationAtPoint, elevationOnRoute } from "../elevationOnRoute";
import { openElevationApiElevationService } from "../ElevationService/openElevationApiElevationService";
import { useFirebaseAuth } from "../firebase/auth/FirebaseAuthContext";
import { useUserRoutes } from "./useUserRoutes";

const emptyElevation = { distancesFromStartInNm: [], elevations: [] };
export const RouteContext = createContext<{
  route: Route;
  setRoute: React.Dispatch<React.SetStateAction<Route>>;
  elevation: ElevationAtPoint;
  switchRoute: (routeId: UUID) => void;
  airspaceOverlaps: AirspaceSegmentOverlap[];
}>({
  route: Route.empty(),
  setRoute: () => {},
  switchRoute: (routeId: UUID) => {},
  elevation: emptyElevation,
  airspaceOverlaps: [],
});

const airacData = AiracData.loadCycle(AiracCycles.NOV_04_2021);

export const RouteProvider: React.FC = ({ children }) => {
  const { user } = useFirebaseAuth();
  const { routes, saveRoute } = useUserRoutes();

  const [route, setRoute] = useState<Route>(Route.empty());
  const [unsubscribe, setUnsubscribe] = useState<Unsubscribe | void>();

  const db = getDatabase();

  const [elevation, setElevation] = useState<ElevationAtPoint>(emptyElevation);

  useEffect(() => {
    setElevation(emptyElevation);
    if (_.keys(routes).includes(route.id.toString())) {
      saveRoute(route);
    }
    if (route.length > 0) {
      elevationOnRoute({ elevationService: openElevationApiElevationService })(
        route,
      ).then((e) => setElevation(e));
    } else {
      setElevation(emptyElevation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, saveRoute]);

  const switchRoute = useCallback(
    (routeId: UUID) => {
      unsubscribe && unsubscribe();
      const dbAddress = `routes/${user?.uid}/${routeId.toString()}`;
      const newUnsubscribe = onValue(
        ref(db, dbAddress),
        (rSnapshot) => {
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
                (newRoute) => {
                  if (newRoute !== route) {
                    setRoute(newRoute);
                  }
                },
              ),
            );
          }
        },
        (reason) => console.error(`Connection rejected: ${reason}`),
      );
      setUnsubscribe((_oldU) => newUnsubscribe);
      // }
      setRoute(routes[routeId.toString()]);
    },
    [route, setRoute, db, user, routes, setUnsubscribe, unsubscribe],
  );

  const overlapDeterministicChangeKey = route.waypoints
    .map((w) => `${w.latLng.lat}-${w.latLng.lng}`)
    .join("-");
  const airspaceOverlaps = useMemo(() => {
    return routeAirspaceOverlaps({
      route,
      airspaces: [
        ...airacData
          .getAirspacesInBbox(...route.boundingBox)
          .filter(({ type, name }) =>
            [AirspaceType.CTR, AirspaceType.TMA].includes(type),
          ),
        ...airacData
          .getDangerZonesInBbox(...route.boundingBox)
          .filter(({ type, name }) => [DangerZoneType.P].includes(type)),
      ],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlapDeterministicChangeKey]);

  return (
    <RouteContext.Provider
      value={{ route, setRoute, elevation, switchRoute, airspaceOverlaps }}
    >
      {children}
    </RouteContext.Provider>
  );
};
