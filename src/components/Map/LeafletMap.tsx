import { NmScale } from "@marfle/react-leaflet-nmscale";
import { LatLng, LatLngTuple } from "leaflet";
import { useCallback, useState } from "react";
import { MapContainer } from "react-leaflet";
import { Rnd } from "react-rnd";
import styled from "styled-components";
import {
  Aerodrome,

  AiracData,
  Latitude,
  Longitude
} from "ts-aerodata-france";
import { DisplayedLayers } from "../../App";
import { Route, toLeafletLatLng, Waypoint } from "../../domain";
import { OaciLayer, OpenStreetMapLayer } from "../layer";
import { VerticalProfileChart } from "../VerticalProfileChart";
import { Aerodromes } from "./Aerodromes";
import { Airspaces } from "./Airspaces";
import { FlightPlanningLayer, isLatLngWaypoint } from "./FlightPlanningLayer";
import { RouteDescription } from "./RouteDescription";
import { VfrPoints } from "./VfrPoints";

const defaultLatLng: LatLngTuple = [43.5, 3.95];
const zoom: number = 11;

type LeafletMapProps = {
  displayedLayers: DisplayedLayers;
  airacData: AiracData;
};

const TopBar = styled.div`
  width: 100%;
  min-height: 30px;
  background-color: grey;
  flex: 0 1 30px;
`;

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
    // console.log(`adding aerodrome waypoint ${aerodrome.icaoCode}`);
    setRoute(
      route.addWaypoint({
        position,
        waypoint: Waypoint.fromAerodrome(aerodrome),
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

  const setWaypointAltitude = useCallback(
    ({
      waypointPosition,
      altitude,
    }: {
      waypointPosition: number;
      altitude: number;
    }) => {
      const w = route.waypoints[waypointPosition];
      if (isLatLngWaypoint(w)) {
        const newWaypoint = w.clone({ altitude });
        // console.log(newWaypoint);
        replaceWaypoint({ waypointPosition, newWaypoint });
      }
    },
    [route, replaceWaypoint],
  );

  const removeWaypoint = (waypointPosition: number) => {
    setRoute(route.removeWaypoint(waypointPosition));
  };

  return (
    <>
      <BackgroundContainer onContextMenu={(e) => e.preventDefault()}>
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
          />
          <NmScale />
        </MapContainer>
      </BackgroundContainer>
      <Rnd
        style={{ zIndex: 10000, backgroundColor: "grey", display: "flex", flexFlow: "column"}}
        enableResizing
        // lockAspectRatio={false}
        dragHandleClassName={"dragg"}
      >
        <TopBar className={"dragg"} />
        <VerticalProfileChart
          route={route}
          airacData={airacData}
          setWaypointAltitude={setWaypointAltitude}
        />
      </Rnd>
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
