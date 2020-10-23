import React from "react";
import { TileLayer } from "react-leaflet";

const key = "an7nvfzojv5wa96dsga5nk8w";
const layer = "GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-OACI";

export const OaciLayer = () => (
  <TileLayer
    maxNativeZoom={11}
    minZoom={7}
    opacity={0.5}
    url={`http://wxs.ign.fr/${key}/geoportail/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg`}
    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  />
);
