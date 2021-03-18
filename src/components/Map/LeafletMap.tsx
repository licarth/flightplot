import { Layout, notification } from "antd";
import "antd/dist/antd.css";
import * as Either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { draw } from "io-ts/lib/Decoder";
import { LatLng, LatLngTuple } from "leaflet";
import { debounce } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, useMap, useMapEvents } from "react-leaflet";
import { AiracCycles, AiracData } from "sia-data";
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
  const [airacData, setAiracData] = useState<AiracData>();

  useEffect(() => {
    pipe(
      AiracData.loadCycle(AiracCycles.MARCH_25_2021),
      Either.fold((e) => {
        console.error(draw(e));
      }, setAiracData),
    );
  }, []);

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
            <Aerodromes airacData={airacData} />

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

const Aerodromes = ({ airacData }: { airacData?: AiracData }) => {
  const [mapBounds, setMapBounds] = useState<
    [number, number, number, number]
  >();
  const leafletMap = useMap();
  const refreshMapBounds = () =>
    setMapBounds([
      leafletMap.getBounds().getWest(),
      leafletMap.getBounds().getSouth(),
      leafletMap.getBounds().getEast(),
      leafletMap.getBounds().getNorth(),
    ]);
  useMapEvents({
    moveend: refreshMapBounds,
    move: debounce(refreshMapBounds, 100),
  });
  return (
    <>
      {airacData &&
        mapBounds &&
        airacData?.getAerodromesInBbox(...mapBounds).map(({ latLng }) => (
          <Marker
            position={{
              lat: (latLng.lat as unknown) as number,
              lng: (latLng.lng as unknown) as number,
            }}
          />
        ))}
    </>
  );
};
