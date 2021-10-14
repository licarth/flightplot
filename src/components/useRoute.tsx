import { LatLng } from "leaflet";
import { useCallback, useContext } from "react";
import { Aerodrome } from "ts-aerodata-france";
import { AerodromeWaypoint, AerodromeWaypointType, Waypoint } from "../domain";
import { RouteContext } from "./RouteContext";

export type SetWaypointAltitude = ({
  waypointPosition,
  altitude,
}: {
  waypointPosition: number;
  altitude: number | null;
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

  const addLatLngWaypoint = useCallback(
    ({
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
    },
    [route, setRoute],
  );

  const addAerodromeWaypoint = useCallback(
    ({ aerodrome, position }: { aerodrome: Aerodrome; position?: number }) => {
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
    },
    [route, setRoute],
  );

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

  const setAerodromeWaypointType = useCallback(
    ({
      waypointPosition,
      waypointType,
    }: {
      waypointPosition: number;
      waypointType: AerodromeWaypointType;
    }) => {
      const currentWaypoint = route.waypoints[waypointPosition];
      if (AerodromeWaypoint.isAerodromeWaypoint(currentWaypoint)) {
        replaceWaypoint({
          waypointPosition,
          newWaypoint: currentWaypoint.clone({ waypointType }),
        });
      }
    },
    [route, replaceWaypoint],
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
      const newWaypoint = w.clone({ altitude });
      console.log(JSON.stringify(newWaypoint))
      replaceWaypoint({ waypointPosition, newWaypoint });
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
    setAerodromeWaypointType,
  };
};
