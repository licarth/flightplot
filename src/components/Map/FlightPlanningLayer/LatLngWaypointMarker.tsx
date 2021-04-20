import { Input } from "antd";
import Leaflet, { LatLng, LatLngExpression } from "leaflet";
import { useRef, useState } from "react";
import { Circle, Marker, Tooltip, useMap } from "react-leaflet";
import styled from "styled-components";
import { preventDefault } from "../preventDefault";
import { circle, planeArrival, planeDeparture } from "./Icons";

export type WaypointType = "departure" | "arrival" | "intermediate";

export const LatLngWaypointMarker = ({
  position,
  onDelete,
  onDrag,
  onDragEnd,
  label,
  circleColor,
  preview = false,
  type = "intermediate",
  waypointNumber,
  setName,
}: {
  position: LatLngExpression;
  onDelete?: () => void;
  onDrag?: (latLng: LatLng) => void;
  onDragEnd?: (latLng: LatLng) => void;
  setName: (name: string) => void;
  label?: string;
  type: WaypointType;
  circleColor?: string;
  preview?: boolean;
  waypointNumber: number;
}) => {
  const markerRef = useRef<Leaflet.Marker>(null);
  const [editingName, setEditingName] = useState(false);
  const tooltipRef = useRef<Leaflet.Tooltip>(null);
  const map = useMap();
  const mapPane = map.getPane("mapPane");
  console.log(mapPane);
  if (mapPane) {
    console.log("Seetting pointerEvents");
    mapPane.style.pointerEvents = "none";
  }
  const tooltipElement = tooltipRef.current?.getElement();
  if (tooltipElement) {
    console.log("Seetting tooltip props");
    tooltipElement.style.pointerEvents = "auto";
  }

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
        dragend: (event) => {
          onDragEnd && onDragEnd(event.target.getLatLng());
        },
        dblclick: () => {
          setEditingName(true);
        },
        click: preventDefault,
      }}
    >
      <Circle
        key={`circle-${waypointNumber}`}
        fill={false}
        center={position}
        radius={1000 * 2.5 * 1.852}
        pathOptions={{
          color: circleColor || type === "intermediate" ? "black" : "red",
          dashArray: "4 1",
        }}
        fillOpacity={0}
      />
      <Tooltip
        permanent={editingName}
        ref={tooltipRef}
        key={`tooltip-${waypointNumber}-${editingName}`}
        eventHandlers={{
          click: preventDefault,
        }}
      >
        {editingName && (
          <NameInputContainer>
            <Input
              autoFocus={true}
              defaultValue={label || ""}
              placeholder={"Name here"}
              onPressEnter={(e) => {
                //@ts-ignore
                setName(e.target.value);
                setEditingName(false);
                tooltipRef.current?.openTooltip();
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setEditingName(false);
                }
              }}
              onClick={(e) => {
                console.log("CLICK");
                e.stopPropagation();
                e.preventDefault();
              }}
            />
          </NameInputContainer>
        )}
        {!editingName && label}
      </Tooltip>
    </Marker>
  );
};

const NameInputContainer = styled.div`
  width: 100px;
`;

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
