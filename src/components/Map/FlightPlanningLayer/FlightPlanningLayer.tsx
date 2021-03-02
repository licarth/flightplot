import CheapRuler, { Line } from "cheap-ruler";
import { LatLng } from "leaflet";
import { useState } from "react";
import { Polyline, useMapEvent } from "react-leaflet";
import { Route } from "../../../domain";
import { WaypointMarker, WaypointType } from "./WaypointMarker";

const ruler = new CheapRuler(43, "nauticalmiles");

export const FlightPlanningLayer = ({
  route,
  addWaypoint,
  removeWaypoint,
  repositionWaypoint,
}: {
  route: Route;
  addWaypoint: ({
    latLng,
    position,
  }: {
    latLng: LatLng;
    position?: number;
  }) => void;
  removeWaypoint: (waypointPosition: number) => void;
  repositionWaypoint: ({
    waypointPosition,
    waypointLatLng,
  }: {
    waypointPosition: number;
    waypointLatLng: LatLng;
  }) => void;
}) => {
  const [previewWaypoint, setPreviewWaypoint] = useState<LatLng | null>(null);

  useMapEvent("click", (e) => {
    console.log("using map event");
    addWaypoint({ latLng: e.latlng });
  });

  const waypointType = (i: number): WaypointType => {
    if (i === 0) {
      return "departure";
    } else if (i < route.waypoints.length - 1) {
      return "intermediate";
    } else {
      return "arrival";
    }
  };

  return (
    <>
      {route.waypoints.map((w, i) => (
        <>
          <WaypointMarker
            key={`waypoint-${i}`}
            label={`${i}`}
            waypointNumber={i}
            type={waypointType(i)}
            position={w.latLng}
            onDelete={() => removeWaypoint(i)}
            onDrag={(latLng) =>
              repositionWaypoint({
                waypointPosition: i,
                waypointLatLng: latLng,
              })
            }
          />
          {route.waypoints[i + 1] && (
            <Polyline
              color={"black"}
              // weight={5}
              lineCap={"square"}
              eventHandlers={{
                mouseover: (e) => {
                  setPreviewWaypoint(e.latlng);
                },
                mouseout: (e) => {
                  setPreviewWaypoint(null);
                },
                mousemove: (e) => {
                  setPreviewWaypoint(e.latlng);
                },
                click: (e) => {
                  setPreviewWaypoint(null);
                  //@ts-ignore
                  e.originalEvent.view?.L?.DomEvent.stopPropagation(e);
                  return addWaypoint({
                    latLng: toLatLng(
                      ruler.pointOnLine(
                        toLine([
                          route.waypoints[i].latLng,
                          route.waypoints[i + 1].latLng,
                        ]),
                        toPoint(e.latlng),
                      ).point,
                    ),
                    position: i + 1,
                  });
                },
              }}
              positions={createLineForRouteSegment(route, i)}
            />
          )}
        </>
      ))}
    </>
  );
};
function createLineForRouteSegment(route: Route, segmentNumber: number) {
  const pointA = [
    route.waypoints[segmentNumber].latLng.lng,
    route.waypoints[segmentNumber].latLng.lat,
  ] as [number, number];
  const pointB = [
    route.waypoints[segmentNumber + 1].latLng.lng,
    route.waypoints[segmentNumber + 1].latLng.lat,
  ] as [number, number];
  const aLine = [pointA, pointB];
  const lineDistance = ruler.lineDistance(aLine);

  console.log(lineDistance);

  if (lineDistance > 5) {
    const line = ruler.lineSliceAlong(2.6, lineDistance - 2.6, aLine);
    return [
      { lat: line[0][1], lng: line[0][0] },
      { lat: line[1][1], lng: line[1][0] },
    ];
  } else return [];
}

const toLatLng = ([x, y]: [number, number]) => new LatLng(y, x);
const toPoint = (latLng: LatLng): [number, number] => [latLng.lng, latLng.lat];
const toLine = (latLngs: Array<LatLng>): Line =>
  latLngs.map((latLng) => [latLng.lng, latLng.lat]);
