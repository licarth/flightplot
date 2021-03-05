import CheapRuler, { Line } from "cheap-ruler";
import { LatLng } from "leaflet";
import { useState } from "react";
import { Circle, Polyline, useMapEvent } from "react-leaflet";
import { Route, Waypoint } from "../../../domain";
import { WaypointMarker, WaypointType } from "./WaypointMarker";

const ruler = new CheapRuler(43, "nauticalmiles");

export const FlightPlanningLayer = ({
  route,
  addWaypoint,
  removeWaypoint,
  replaceWaypoint,
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
  replaceWaypoint: ({
    waypointPosition,
    newWaypoint,
  }: {
    waypointPosition: number;
    newWaypoint: Waypoint;
  }) => void;
}) => {
  const [previewWaypoint, setPreviewWaypoint] = useState<LatLng | null>(null);

  useMapEvent("click", (e) => {
    console.log("using map event");
    addWaypoint({ latLng: e.latlng });
  });

  type TemporaryWaypoint = {
    waypointBefore?: Waypoint;
    waypoint: Waypoint;
    waypointAfter?: Waypoint;
  };

  const [
    temporaryWaypoint,
    setTemporaryWaypoint,
  ] = useState<TemporaryWaypoint | null>(null);

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
            key={`waypoint-${w.id}`}
            label={w.name}
            waypointNumber={i}
            type={waypointType(i)}
            position={w.latLng}
            onDelete={() => removeWaypoint(i)}
            onDragEnd={(latLng) => {
              setTemporaryWaypoint(null);
              return replaceWaypoint({
                waypointPosition: i,
                newWaypoint: w.clone({ latLng }),
              });
            }}
            setName={(name) => {
              replaceWaypoint({
                waypointPosition: i,
                newWaypoint: w.clone({ name }),
              });
            }}
            onDrag={(latLng) => {
              return setTemporaryWaypoint({
                waypoint: w.clone({ latLng }),
                waypointAfter: route.waypoints[i + 1],
                waypointBefore: route.waypoints[i - 1],
              });
            }}
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
          {temporaryWaypoint && (
            <>
              <Circle
                key={`circle-temporary`}
                fill={false}
                center={temporaryWaypoint.waypoint.latLng}
                radius={1000 * 2.5 * 1.852}
                pathOptions={{
                  color: "black",
                  dashArray: "20",
                }}
                fillOpacity={0}
              />
              {temporaryWaypoint.waypointBefore && (
                <Polyline
                  color={"black"}
                  dashArray="20"
                  lineCap={"square"}
                  positions={lineBetweenWaypoints(
                    temporaryWaypoint.waypointBefore,
                    temporaryWaypoint.waypoint,
                  )}
                />
              )}
              {temporaryWaypoint.waypointAfter && (
                <Polyline
                  color={"black"}
                  dashArray="20"
                  lineCap={"square"}
                  positions={lineBetweenWaypoints(
                    temporaryWaypoint.waypoint,
                    temporaryWaypoint.waypointAfter,
                  )}
                />
              )}
            </>
          )}
        </>
      ))}
    </>
  );
};

function createLineForRouteSegment(route: Route, segmentNumber: number) {
  const waypoint1 = route.waypoints[segmentNumber];
  const waypoint2 = route.waypoints[segmentNumber + 1];
  return lineBetweenWaypoints(waypoint1, waypoint2);
}

const lineBetweenWaypoints = (waypoint1: Waypoint, waypoint2: Waypoint) => {
  const pointA = [waypoint1.latLng.lng, waypoint1.latLng.lat] as [
    number,
    number,
  ];
  const pointB = [waypoint2.latLng.lng, waypoint2.latLng.lat] as [
    number,
    number,
  ];
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
};

const toLatLng = ([x, y]: [number, number]) => new LatLng(y, x);
const toPoint = (latLng: LatLng): [number, number] => [latLng.lng, latLng.lat];
const toLine = (latLngs: Array<LatLng>): Line =>
  latLngs.map((latLng) => [latLng.lng, latLng.lat]);
