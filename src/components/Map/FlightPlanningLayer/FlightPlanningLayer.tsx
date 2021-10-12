import CheapRuler, { Line } from "cheap-ruler";
import { LatLng } from "leaflet";
import { Fragment, useState } from "react";
import { Circle, Polyline, useMapEvent } from "react-leaflet";
import { Route, Waypoint } from "../../../domain";
import {
  AerodromeWaypoint,
  AerodromeWaypointType,
  LatLngWaypoint,
} from "../../../domain/Waypoint";
import { RemoveWaypoint } from "../LeafletMap";
import { preventDefault } from "../preventDefault";
import { AerodromeWaypointMarker } from "./AerodromeWaypointMarker";
import { LatLngWaypointMarker, WaypointType } from "./LatLngWaypointMarker";

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
  removeWaypoint: RemoveWaypoint;
  replaceWaypoint: ({
    waypointPosition,
    newWaypoint,
  }: {
    waypointPosition: number;
    newWaypoint: Waypoint;
  }) => void;
}) => {
  useMapEvent("click", (e) => {
    // console.log("using map event");
    addWaypoint({ latLng: e.latlng });
  });

  type TemporaryWaypoint = {
    waypointBefore?: Waypoint;
    waypoint: Waypoint;
    waypointAfter?: Waypoint;
  };

  const [temporaryWaypoint, setTemporaryWaypoint] =
    useState<TemporaryWaypoint | null>(null);

  const waypointType = (w: Waypoint, i: number): WaypointType => {
    if (AerodromeWaypoint.isAerodromeWaypoint(w)) {
      if (w.waypointType === AerodromeWaypointType.RUNWAY) {
        return i === 0 ? "departure" : "arrival";
      }
    }
    return "intermediate";
  };

  return (
    <>
      {route.waypoints.map((w, i) => (
        <Fragment key={`wp-${w.id}`}>
          {isLatLngWaypoint(w) && (
            <LatLngWaypointMarker
              key={`wpmarker-${w.id}`}
              label={w.name}
              waypointNumber={i}
              type={waypointType(w, i)}
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
          )}
          {AerodromeWaypoint.isAerodromeWaypoint(w) && (
            <AerodromeWaypointMarker
              key={`waypoint-${w.id}`}
              label={w.name}
              onDelete={() => removeWaypoint(i)}
              waypointNumber={i}
              type={waypointType(w, i)}
              position={w.latLng}
            />
          )}
          {route.waypoints[i + 1] && (
            <Polyline
              color={"#000000a2"}
              weight={10}
              lineCap={"square"}
              eventHandlers={{
                click: (e) => {
                  preventDefault(e);
                  return addWaypoint({
                    latLng: pointToLeafletLatLng(
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
        </Fragment>
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
  const pointA = toPoint(waypoint1.latLng);
  const pointB = toPoint(waypoint2.latLng);
  const aLine = [pointA, pointB];
  const lineDistance = ruler.lineDistance(aLine);

  // console.log(lineDistance);

  if (lineDistance > 5) {
    const line = ruler.lineSliceAlong(2.6, lineDistance - 2.6, aLine);
    return [
      { lat: line[0][1], lng: line[0][0] },
      { lat: line[1][1], lng: line[1][0] },
    ];
  } else return [];
};

export const pointToLeafletLatLng = ([x, y]: [number, number]) =>
  new LatLng(y, x);
export const toPoint = (latLng: LatLng): [number, number] => [
  latLng.lng,
  latLng.lat,
];
export const toLine = (latLngs: Array<LatLng>): Line =>
  latLngs.map((latLng) => [latLng.lng, latLng.lat]);

export const isLatLngWaypoint = (w: any): w is LatLngWaypoint => {
  return w.clone !== undefined;
};
