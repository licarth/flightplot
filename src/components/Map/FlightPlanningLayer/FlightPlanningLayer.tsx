import { LatLng } from "leaflet";
import React, { useState } from "react";
import { useMapEvent } from "react-leaflet";
import { Route } from "../../../domain";
import { Waypoint } from "../../../domain/Waypoint";
import { WaypointMarker } from "./WaypointMarker";

export const FlightPlanningLayer = () => {
  const [route, setRoute] = useState<Route>(
    new Route({
      waypoints: [],
    }),
  );

  const addWaypoint = (latlng: LatLng) => {
    setRoute(route.addWaypoint(Waypoint.fromLatLng(latlng)));
  };

  const removeWaypoint = (waypointPosition: number) => {
    console.log(`removing waypoint ${waypointPosition}`);
    setRoute(route.removeWaypoint(waypointPosition));
  };

  useMapEvent("click", (e) => {
    addWaypoint(e.latlng);
  });

  return (
    <>
      {route.waypoints.map((w, i) => (
        <WaypointMarker
          key={`waypoint-${i}`}
          position={w.latLng}
          onDelete={() => removeWaypoint(i)}
          onDrag={(latLng) =>
            setRoute(
              route.replaceWaypoint({
                waypointPostion: i,
                newWaypoint: Waypoint.fromLatLng(latLng)},
              ),
            )
          }
        />
      ))}
    </>
  );
};
