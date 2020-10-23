import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import "geoportal-extensions-leaflet/dist/GpPluginLeaflet";
import "geoportal-extensions-leaflet/dist/GpPluginLeaflet.css";
import { LatLngTuple } from "leaflet";
import React, { useEffect, useState } from "react";
import { Map, Polyline } from "react-leaflet";
import { parseFile } from "../csvParser";
import { OpenStreetMapLayer } from "./layer";

const defaultLatLng: LatLngTuple = [43.5, 3.95];
const zoom: number = 11;

export const LeafletMap: React.FC = () => {
  const [lines, setLines] = useState<LatLngTuple[] | null>(null);

  useEffect(() => {
    pipe(
      parseFile("fullFlight.txt"),
      TE.fold(
        (e) => async () => {
          console.error(e);
        },
        (row) => async () => {
          setLines(row);
        },
      ),
    )();
  }, []);
  
  return (
    <Map id="mapId" center={defaultLatLng} zoom={zoom}>
      <OpenStreetMapLayer />
      {lines && <Polyline opacity={10} color="black" positions={lines} />}
    </Map>
  );
};
