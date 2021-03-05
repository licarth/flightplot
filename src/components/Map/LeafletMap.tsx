import { Layout, notification } from "antd";
import "antd/dist/antd.css";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { LatLng, LatLngTuple } from "leaflet";
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, useMap } from "react-leaflet";
import { DisplayedLayers } from "../../App";
import { Route, Waypoint } from "../../domain";
import { getFlightData, GpsRecord } from "../../flightData";
import { AltitudeChart } from "../AltitudeChart";
import { Chart } from "../CustomChart";
import { OaciLayer, OpenStreetMapLayer } from "../layer";
import { FlightPlanningLayer } from "./FlightPlanningLayer";
import { RouteDescription } from "./RouteDescription";

const defaultLatLng: LatLngTuple = [43.5, 3.95];
const zoom: number = 11;

type LeafletMapProps = {
  displayLFMT: boolean;
  displayedLayers: DisplayedLayers;
  flightPlanningMode: boolean;
};

export const LeafletMap = ({
  displayLFMT,
  displayedLayers,
  flightPlanningMode,
}: LeafletMapProps) => {
  const [gpsRecords, setLines] = useState<GpsRecord[] | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [currentPoint, setCurrentPoint] = useState<number | null>(null);
  const [route, setRoute] = useState<Route>(
    new Route({
      waypoints: [],
    }),
  );
  const pathRef = useRef(null);
  const openNotificationWithIcon = ({
    title,
    message,
  }: {
    title: string;
    message: string;
  }) => {
    notification["warning"]({
      message: title,
      description: message,
    });
  };

  const addWaypoint = ({
    latLng,
    position,
  }: {
    latLng: LatLng;
    position?: number;
  }) => {
    setRoute(
      route.addWaypoint({ position, waypoint: Waypoint.fromLatLng(latLng) }),
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

  useEffect(() => {
    pipe(
      getFlightData({ file: "20210213-141852.txt", start: 3000, end: 5000 }),
      // getFlightData({ file: "20191218-181314.txt" }),
      // getFlightData("flight1.txt"),
      TE.fold(
        (e) => async () => {
          console.error(e);
          if (e instanceof Error) {
            console.error(e);
            openNotificationWithIcon({ title: "Error", message: e.message });
          }
        },
        (row) => async () => {
          setLines(row);
        },
      ),
    )();
  }, []);
  const currentGpsRecord =
    currentPoint && gpsRecords ? gpsRecords[currentPoint] : null;
  return (
    <>
      <div onContextMenu={(e) => e.preventDefault()}>
        <Layout>
          <MapContainer id="mapId" center={defaultLatLng} zoom={zoom}>
            <Layers
              displayedLayers={displayedLayers}
              displayLFMT={displayLFMT}
            />
            {/* {gpsRecords && (
              <Polyline
                ref={pathRef}
                opacity={10}
                color="black"
                positions={gpsRecords.map(
                  (record) =>
                    [record.latitude, record.longitude] as LatLngTuple,
                )}
                className={"onTop"}
              />
            )}
            {currentGpsRecord && (
              <Marker
                // icon={}
                position={{
                  lat: currentGpsRecord.latitude,
                  lng: currentGpsRecord.longitude,
                }}
              />
            )} */}
            <FlightPlanningLayer
              addWaypoint={addWaypoint}
              route={route}
              removeWaypoint={removeWaypoint}
              replaceWaypoint={replaceWaypoint}
            />
          </MapContainer>
          <div style={{ height: "20vh" }}>
            {gpsRecords && (
              <AltitudeChart
                gpsRecordArray={gpsRecords}
                onNearestX={({ x }) => {
                  console.log(x);
                  return setCurrentPoint(x);
                }}
              />
            )}
          </div>
        </Layout>
      </div>
      <RouteDescription route={route} />
    </>
  );
};

const Layers = ({
  displayedLayers,
  displayLFMT,
}: {
  displayedLayers: DisplayedLayers;
  displayLFMT: boolean;
}) => {
  const leafletMap = useMap();
  return (
    <>
      {displayedLayers.open_street_map && <OpenStreetMapLayer />}
      {displayedLayers.icao && <OaciLayer />}
      {displayLFMT && leafletMap && <Chart map={leafletMap} />}
    </>
  );
};
