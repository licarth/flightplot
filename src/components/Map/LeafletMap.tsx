import { NmScale } from "@marfle/react-leaflet-nmscale";
import "antd/dist/antd.css";
import { LatLng, LatLngTuple } from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer } from "react-leaflet";
import {
  Aerodrome,
  AiracCycles,
  AiracData,
  Latitude,
  Longitude
} from "ts-aerodata-france";
import { DisplayedLayers } from "../../App";
import { Route, toLeafletLatLng, Waypoint } from "../../domain";
import { OaciLayer, OpenStreetMapLayer } from "../layer";
import { Aerodromes } from "./Aerodromes";
import { Airspaces } from "./Airspaces";
import { FlightPlanningLayer } from "./FlightPlanningLayer";
import { VerticalProfileLayer } from "./VerticalProfileLayer";
import { VfrPoints } from "./VfrPoints";

const defaultLatLng: LatLngTuple = [43.5, 3.95];
const zoom: number = 11;

type LeafletMapProps = {
  displayedLayers: DisplayedLayers;
};

export const LeafletMap = ({ displayedLayers }: LeafletMapProps) => {
  const [airacData, setAiracData] = useState<AiracData>();

  useEffect(() => {
    setAiracData(AiracData.loadCycle(AiracCycles.NOV_04_2021));
  }, []);

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
    // console.log(`removing waypoint ${waypointPosition}`);
    setRoute(route.removeWaypoint(waypointPosition));
  };

  return (
    <>
      <div onContextMenu={(e) => e.preventDefault()}>
        <MapContainer id="mapId" center={defaultLatLng} zoom={zoom}>
          <Layers displayedLayers={displayedLayers} />
          {/* <DangerZones airacData={airacData} /> */}
          <Airspaces airacData={airacData} />
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
          <VerticalProfileLayer
            route={route}
            airacData={airacData}
          />
          <NmScale />
        </MapContainer>
      </div>
      {/* <RouteDescription route={route} /> */}
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
