import { LatLng } from "leaflet";
import { useCallback, useContext } from "react";
import { Aerodrome } from "ts-aerodata-france";
import { AerodromeWaypointType, Waypoint } from "../domain";
import { isLatLngWaypoint } from "./Map/FlightPlanningLayer";
import { RouteContext } from "./RouteContext";

export type SetWaypointAltitude = ({
  waypointPosition,
  altitude,
}: {
  waypointPosition: number;
  altitude: number;
}) => void;

export type MoveWaypoint = (
  currentWaypointPosition: number,
  newWaypointPosition: number,
) => void;

export type AddSameWaypointAgain = (waypointPosition: number) => void;

export type RemoveWaypoint = (waypointPosition: number) => void;

export type ReplaceWaypoint = ({
  waypointPosition,
  newWaypoint,
}: {
  waypointPosition: number;
  newWaypoint: Waypoint;
}) => void;

export const useRoute = () => {
  const { route, setRoute } = useContext(RouteContext);

  const addLatLngWaypoint = ({
    latLng,
    position,
    name,
  }: {
    latLng: LatLng;
    position?: number;
    name?: string;
  }) => {
    setRoute(
      route.addWaypoint({
        position,
        waypoint: Waypoint.create({ latLng, name }),
      }),
    );
  };

  const addAerodromeWaypoint = ({
    aerodrome,
    position,
  }: {
    aerodrome: Aerodrome;
    position?: number;
  }) => {
    setRoute(
      route.addWaypoint({
        position,
        waypoint: Waypoint.fromAerodrome({
          aerodrome,
          waypointType:
            position === 0
              ? AerodromeWaypointType.RUNWAY
              : AerodromeWaypointType.OVERFLY,
        }),
      }),
    );
  };

  const replaceWaypoint = useCallback(
    ({
      waypointPosition,
      newWaypoint,
    }: {
      waypointPosition: number;
      newWaypoint: Waypoint;
    }) =>
      setRoute(
        route.replaceWaypoint({
          waypointPosition,
          newWaypoint,
        }),
      ),
    [route, setRoute],
  );
  const moveWaypoint: MoveWaypoint = useCallback(
    (currentWaypointPosition, newWaypointPosition) =>
      setRoute(
        route.moveWaypoint(currentWaypointPosition, newWaypointPosition),
      ),
    [route, setRoute],
  );

  const setWaypointAltitude: SetWaypointAltitude = useCallback(
    ({ waypointPosition, altitude }) => {
      const w = route.waypoints[waypointPosition];
      if (isLatLngWaypoint(w)) {
        const newWaypoint = w.clone({ altitude });
        // console.log(newWaypoint);
        replaceWaypoint({ waypointPosition, newWaypoint });
      }
    },
    [route, replaceWaypoint],
  );

  const addSameWaypointAgain: AddSameWaypointAgain = useCallback(
    (waypointPosition) => {
      const w = route.waypoints[waypointPosition];
      setRoute(route.addWaypoint({ waypoint: w }));
    },
    [route, setRoute],
  );

  const removeWaypoint: RemoveWaypoint = (waypointPosition) => {
    setRoute(route.removeWaypoint(waypointPosition));
  };

return {
    route,
    setRoute,
    removeWaypoint,
    replaceWaypoint,
    addSameWaypointAgain,
    setWaypointAltitude,
    moveWaypoint,
    addAerodromeWaypoint,
    addLatLngWaypoint,
  };
};
