import { Layout } from "antd";
import "antd/dist/antd.css";
import * as Either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { draw } from "io-ts/lib/Decoder";
import { LatLng, LatLngTuple } from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer } from "react-leaflet";
import {
  Aerodrome,
  AiracCycles,
  AiracData,
  Latitude,
  Longitude,
} from "sia-data";
import { DisplayedLayers } from "../../App";
import { Route, Waypoint } from "../../domain";
import { OaciLayer, OpenStreetMapLayer } from "../layer";
import { Aerodromes } from "./Aerodromes";
import { FlightPlanningLayer } from "./FlightPlanningLayer";
import { RouteDescription } from "./RouteDescription";

const defaultLatLng: LatLngTuple = [43.5, 3.95];
const zoom: number = 11;

type LeafletMapProps = {
  displayedLayers: DisplayedLayers;
};

export const LeafletMap = ({ displayedLayers }: LeafletMapProps) => {
  const [airacData, setAiracData] = useState<AiracData>();

  useEffect(() => {
    pipe(
      AiracData.loadCycle(AiracCycles.MARCH_25_2021),
      Either.fold((e) => {
        console.error(draw(e));
      }, setAiracData),
    );
  }, []);

  const [route, setRoute] = useState<Route>(
    new Route({
      waypoints: [],
    }),
  );

  const addLatLngWaypoint = ({
    latLng,
    position,
  }: {
    latLng: LatLng;
    position?: number;
  }) => {
    console.log(`adding latlng waypoint`);
    setRoute(
      route.addWaypoint({ position, waypoint: Waypoint.fromLatLng(latLng) }),
    );
  };

  const addAerodromeWaypoint = ({
    aerodrome,
    position,
  }: {
    aerodrome: Aerodrome;
    position?: number;
  }) => {
    console.log(`adding aerodrome waypoint ${aerodrome.icaoCode}`);
    setRoute(
      route.addWaypoint({
        position,
        waypoint: Waypoint.fromAerodrome(aerodrome),
      }),
    );
  };

  const replaceWaypoint = ({
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
    );

  const removeWaypoint = (waypointPosition: number) => {
    console.log(`removing waypoint ${waypointPosition}`);
    setRoute(route.removeWaypoint(waypointPosition));
  };

  return (
    <>
      <div onContextMenu={(e) => e.preventDefault()}>
        <Layout>
          <MapContainer id="mapId" center={defaultLatLng} zoom={zoom}>
            <Layers displayedLayers={displayedLayers} />
            <Aerodromes
              airacData={airacData}
              onClick={(aerodrome) => addAerodromeWaypoint({ aerodrome })}
            />
            <FlightPlanningLayer
              addWaypoint={addLatLngWaypoint}
              route={route}
              removeWaypoint={removeWaypoint}
              replaceWaypoint={replaceWaypoint}
            />
          </MapContainer>
        </Layout>
      </div>
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
  lat: (latLng.lat as unknown) as number,
  lng: (latLng.lng as unknown) as number,
});
