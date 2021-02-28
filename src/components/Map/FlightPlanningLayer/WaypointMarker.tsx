import Leaflet, { LatLng, LatLngExpression } from "leaflet";
import React, { useRef, useState } from "react";
// import { showMenu } from "react-contextmenu/modules/actions";
import { Circle, Marker } from "react-leaflet";

export const WaypointMarker = ({
  position,
  onDelete,
  onDrag,
}: {
  position: LatLngExpression;
  onDelete?: () => void;
  onDrag?: (latLng: LatLng) => void;
}) => {
  const markerRef = useRef<Leaflet.Marker>(null);

  return (
    <Marker
      draggable={true}
      position={position}
      ref={markerRef}
      eventHandlers={{
        contextmenu: (event) => {
          onDelete && onDelete();
        },
        drag: (event) => {
          onDrag && onDrag(event.target.getLatLng());
        },
      }}
    >
      <Circle
        center={position}
        radius={1000 * 2.5 * 1.852}
        color="red"
        fillOpacity={0}
      />
    </Marker>
  );
};
