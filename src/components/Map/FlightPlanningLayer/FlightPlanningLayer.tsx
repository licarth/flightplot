import { LatLng } from "leaflet";
import React, { useState } from "react";
import { useMapEvent } from "react-leaflet";
import { IntermediateWaypoint, Waypoint } from "../../../domain/Waypoint";
import { WaypointMarker } from "./WaypointMarker";

export const FlightPlanningLayer = () => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

  const addWaypoint = (latlng: LatLng) => {
    setWaypoints((waypoints) => [
      ...waypoints,
      new IntermediateWaypoint(latlng),
    ]);
  };

  useMapEvent("click", (e) => {
    addWaypoint(e.latlng);
  });
  return (
    <>
      {waypoints.map((w) => (
        <WaypointMarker
          initialPosition={w.latLng}
          onDelete={() => console.log("delete !")}
        />
      ))}
    </>
  );
};
