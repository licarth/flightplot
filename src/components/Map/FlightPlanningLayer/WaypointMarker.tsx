import Leaflet, { LatLngExpression } from "leaflet";
import React, { useRef, useState } from "react";
// import { showMenu } from "react-contextmenu/modules/actions";
import { Circle, Marker } from "react-leaflet";

export const WaypointMarker = ({
  initialPosition,
  onDelete,
}: {
  initialPosition: LatLngExpression;
  onDelete?: () => void;
}) => {
  const [position, setPosition] = useState(initialPosition);
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
          setPosition(event.target.getLatLng());
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
