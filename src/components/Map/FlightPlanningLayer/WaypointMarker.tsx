import Leaflet, { LatLng, LatLngExpression } from "leaflet";
import { useRef } from "react";
import { Circle, Marker, Tooltip } from "react-leaflet";
import { circle, planeArrival, planeDeparture } from "./Icons";

export type WaypointType = "departure" | "arrival" | "intermediate";

export const WaypointMarker = ({
  position,
  onDelete,
  onDrag,
  label,
  circleColor,
  preview = false,
  type = "intermediate",
  waypointNumber,
}: {
  position: LatLngExpression;
  onDelete?: () => void;
  onDrag?: (latLng: LatLng) => void;
  label?: string;
  type: WaypointType;
  circleColor?: string;
  preview?: boolean;
  waypointNumber: number;
}) => {
  const markerRef = useRef<Leaflet.Marker>(null);

  return (
    <Marker
      draggable={!preview}
      position={position}
      ref={markerRef}
      title={label}
      icon={getIcon(type)}
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
        key={`circle-${waypointNumber}`}
        fill={false}
        center={position}
        radius={1000 * 2.5 * 1.852}
        pathOptions={{
          color: circleColor || type === "intermediate" ? "black" : "red",
        }}
        fillOpacity={0}
        dashArray={"4, 1"}
      />
      <Tooltip>
        {label}
      </Tooltip>
    </Marker>
  );
};

const getIcon = (waypointType: WaypointType) => {
  switch (waypointType) {
    case "arrival":
      return planeArrival;
    case "departure":
      return planeDeparture;
    case "intermediate":
      return circle;
  }
};
