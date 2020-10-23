import { LatLngTuple } from "leaflet";
import React, { createRef, useState } from "react";
import { ImageOverlay, Marker } from "react-leaflet";
import LFMT_PNG from "../LFMT.png";
import LFMT_SVG from "../LFMT.svg";
import LFMT_SVGZ from "../LFMT_SVGZ.svg";
import LFMT_CAIRO from "../LFMT_CAIRO.png";

export const Chart = () => {
  const topLeftMarkerRef = createRef<Marker>();
  const bottomRightMarkerRef = createRef<Marker>();
  const imageOverlayRef = createRef<ImageOverlay>();
  const [topLeft, setTopLeft] = useState<LatLngTuple>([43.88, 3.5]);
  const [bottomRight, setBottomRight] = useState<LatLngTuple>([43.15, 4.2]);


  const bounds = [topLeft, bottomRight];

  return (
    <>
      <ImageOverlay
        ref={imageOverlayRef}
        bounds={bounds}
        url={LFMT_PNG}
        opacity={1}
        interactive
      />
      <Marker
        draggable
        position={topLeft}
        ref={topLeftMarkerRef}
        ondrag={(e) => {
          if (topLeftMarkerRef.current) {
            const {
              lat,
              lng,
            } = topLeftMarkerRef.current.leafletElement.getLatLng();
            setTopLeft([lat, lng]);
          }
        }}
      />
      <Marker
        draggable
        position={bottomRight}
        ref={bottomRightMarkerRef}
        ondrag={(e) => {
          if (bottomRightMarkerRef.current) {
            const {
              lat,
              lng,
            } = bottomRightMarkerRef.current.leafletElement.getLatLng();
            setBottomRight([lat, lng]);
          }
        }}
      />
    </>
  );
};
