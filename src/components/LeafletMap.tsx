import { notification } from "antd";
import "antd/dist/antd.css";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import "geoportal-extensions-leaflet/dist/GpPluginLeaflet";
import "geoportal-extensions-leaflet/dist/GpPluginLeaflet.css";
import { LatLngTuple } from "leaflet";
import React, { useEffect, useRef, useState } from "react";
import { Map, Polyline } from "react-leaflet";
import { Map as LeafletInternalMap } from "leaflet";
import { getFlightData } from "../flightData";
import { Chart } from "./CustomChart";
import { OaciLayer } from "./layer";

const defaultLatLng: LatLngTuple = [43.5, 3.95];
const zoom: number = 11;

export const LeafletMap: React.FC = () => {
  const [lines, setLines] = useState<LatLngTuple[] | null>(null);
  // const mapRef = useRef<LeafletInternalMap>(null);
  const mapRef = useRef<Map>(null);
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

  useEffect(() => {
    pipe(
      getFlightData("fullFlight.txt"),
      TE.fold(
        (e) => async () => {
          console.error(e);
          if (e instanceof Error) {
            console.error(e);
            openNotificationWithIcon({ title: "Error", message: e.message });
          }
        },
        (row) => async () => {
          console.log(row);
          setLines(row);
        },
      ),
    )();
  }, []);

  // var poly1 = [
  //   [40.71222, -74.22655],
  //   [40.77394, -74.22655],
  //   [40.77394, -74.12544],
  //   [40.71222, -74.12544],
  // ];
  // var pg = new L.Polygon([poly1], {
  //   draggable: true,
  //   opacity: 0,
  //   fillOpacity: 0,
  // }).addTo(map);

  // var imageBounds = L.latLngBounds([poly1[0], poly1[2]]);
  // map.fitBounds(imageBounds);
  // var overlay = new L.ImageOverlay(
  //   "https://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg",
  //   imageBounds,
  //   {
  //     opacity: 0.7,
  //     interactive: true,
  //   },
  // );
  // map.addLayer(overlay);

  // pg.on("drag, dragend", function (e) {
  //   overlay.setBounds(pg.getBounds());
  // });
  const leafletMap = mapRef.current?.leafletElement;
  return (
    <Map id="mapId" ref={mapRef} center={defaultLatLng} zoom={zoom}>
      {/* <OpenStreetMapLayer /> */}
      <OaciLayer />
      {leafletMap && <Chart map={leafletMap} />}
      {/* <LocateControl startDirectly /> */}
      {lines && <Polyline opacity={10} color="black" positions={lines} />}
    </Map>
  );
};
