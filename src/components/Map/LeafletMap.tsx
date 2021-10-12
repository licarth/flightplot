import { NmScale } from "@marfle/react-leaflet-nmscale";
import { LatLng, LatLngTuple } from "leaflet";
import { useCallback, useState } from "react";
import { MapContainer } from "react-leaflet";
import styled from "styled-components";
import { Aerodrome, AiracData, Latitude, Longitude } from "ts-aerodata-france";
import { DisplayedLayers } from "../../App";
import {
  AerodromeWaypointType,
  Route,
  toLeafletLatLng,
  Waypoint
} from "../../domain";
import { OaciLayer, OpenStreetMapLayer } from "../layer";
import { Aerodromes } from "./Aerodromes";
import { Airspaces } from "./Airspaces";
import { FlightPlanningLayer, isLatLngWaypoint } from "./FlightPlanningLayer";
import { LeftMenu } from "./LeftMenu";
import { RouteDescription } from "./RouteDescription";
import { VfrPoints } from "./VfrPoints";
const defaultLatLng: LatLngTuple = [43.5, 3.95];
const zoom: number = 11;

type LeafletMapProps = {
  displayedLayers: DisplayedLayers;
  airacData: AiracData;
};

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

export const LeafletMap = ({ displayedLayers, airacData }: LeafletMapProps) => {
  const [route, setRoute] = useState<Route>(
    new Route({
      waypoints: [],
    }),
  );

  const addLatLngWaypoint = ({
    latLng,
    position,
    name,
  }: {
    latLng: LatLng;
    position?: number;
    name?: string;
  }) => {
    // console.log(`adding latlng waypoint`);
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
    [route],
  );
  const moveWaypoint: MoveWaypoint = useCallback(
    (currentWaypointPosition, newWaypointPosition) =>
      setRoute(
        route.moveWaypoint(currentWaypointPosition, newWaypointPosition),
      ),
    [route],
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
    [route],
  );

  const removeWaypoint: RemoveWaypoint = (waypointPosition) => {
    setRoute(route.removeWaypoint(waypointPosition));
  };

  return (
    <>
      <BackgroundContainer onContextMenu={(e) => e.preventDefault()}>
        <LeftMenu
          route={route}
          airacData={airacData}
          setWaypointAltitude={setWaypointAltitude}
          removeWaypoint={removeWaypoint}
          moveWaypoint={moveWaypoint}
        />
        <MapContainer id="mapId" center={defaultLatLng} zoom={zoom}>
          <Layers displayedLayers={displayedLayers} />
          <Airspaces airacData={airacData} />
          {/* <DangerZones airacData={airacData} /> */}
          <Aerodromes
            airacData={airacData}
            onClick={(aerodrome) => addAerodromeWaypoint({ aerodrome })}
          />
          <VfrPoints
            airacData={airacData}
            onClick={({ latLng, name }) =>
              addLatLngWaypoint({ latLng: toLeafletLatLng(latLng), name })
            }
          />
          <FlightPlanningLayer
            addWaypoint={addLatLngWaypoint}
            route={route}
            removeWaypoint={removeWaypoint}
            replaceWaypoint={replaceWaypoint}
            addSameWaypointAgain={addSameWaypointAgain}
          />
          <NmScale />
        </MapContainer>
      </BackgroundContainer>
      <RouteDescription route={route} />
    </>
  );
};

const Layers = ({ displayedLayers }: { displayedLayers: DisplayedLayers }) => {
  return (
    <>
      {displayedLayers.open_street_map && <OpenStreetMapLayer />}
      {displayedLayers.icao && <OaciLayer />}
    </>
  );
};

export const toLatLng = (latLng: { lat: Latitude; lng: Longitude }) => ({
  lat: latLng.lat as unknown as number,
  lng: latLng.lng as unknown as number,
});

const BackgroundContainer = styled.div`
  display: flex;
`;
