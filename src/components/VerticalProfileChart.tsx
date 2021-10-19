import { ChartData, ChartDataset } from "chart.js";
import annotationPlugin, { AnnotationOptions } from "chartjs-plugin-annotation";
import "chartjs-plugin-dragdata";
//@ts-ignore
import dragData from "chartjs-plugin-dragdata";
import * as _ from "lodash";
import { min } from "lodash";
import { useCallback } from "react";
import { Chart, Scatter } from "react-chartjs-2";
import { AiracData, AirspaceType, DangerZoneType } from "ts-aerodata-france";
import { AerodromeWaypoint, AerodromeWaypointType, Waypoint } from "../domain";
import { aircraftCollection } from "../domain/Aircraft";
import { routeAirspaceOverlaps } from "../domain/VerticalProfile";
import { useRoute } from "./useRoute";
Chart.register(annotationPlugin);
Chart.register(dragData);

export const VerticalProfileChart = ({
  airacData,
}: {
  airacData?: AiracData;
}) => {
  //@ts-ignore
  const { route, elevation, setWaypointAltitude } = useRoute();
  const onDragEnd = useCallback(
    (e, datasetIndex, index, value) => {
      if (value.routeIndex) {
        setWaypointAltitude({
          waypointPosition: value.routeIndex,
          altitude: value.y,
        });
      }
    },
    [setWaypointAltitude],
  );

  const overlaps = airacData
    ? routeAirspaceOverlaps({
        route,
        airspaces: [
          ...airacData
            .getAirspacesInBbox(...route.boundingBox)
            .filter(({ type, name }) =>
              [AirspaceType.CTR, AirspaceType.TMA].includes(type),
            ),
          ...airacData
            .getDangerZonesInBbox(...route.boundingBox)
            .filter(({ type, name }) => [DangerZoneType.P].includes(type)),
        ],
      })
    : [];
  const verticalProfile = route.verticalProfile({
    aircraft: aircraftCollection[0],
  });
  const points = verticalProfile;

  const pointData = points.map(
    ({ distance: x, altitudeInFeet: y, routeIndex }) => ({
      x,
      y,
      r: 0,
      routeIndex,
    }),
  );
  const pointLabels: AnnotationOptions<"line">[] = points
    .filter(({ routeWaypoint }) => routeWaypoint !== null)
    .map(({ distance: x, name }) => ({
      type: "line",
      scaleID: "x",
      borderWidth: 2,
      borderColor: "#0000006cF",
      borderDash: [30, 10],
      value: x,
      label: {
        width: 100,
        height: 100,
        position: "start",
        backgroundColor: "#0000006cF",
        content: name || null,
        enabled: true,
      },
    }));

  const datasets: ChartDataset<"scatter">[] = [
    {
      label: "Flight Path",
      data: pointData,
      fill: false,
      showLine: true,
      backgroundColor: "rgb(83, 0, 177)",
      borderColor: "rgb(83, 0, 177)",
      borderWidth: 5,
      pointHitRadius: 25,
      pointRadius: (p) =>
        //@ts-ignore
        p.raw && p.raw.routeIndex &&
        //@ts-ignore
        canBeDragged(p.datasetIndex, route.waypoints[p.raw.routeIndex])
          ? 10
          : 0,
    },
  ];

  if (elevation) {
    //@ts-ignore
    datasets.push({
      label: "Terrain Elevation",
      data: elevation.distancesFromStartInNm.map((x, i) => ({
        x,
        y: elevation.elevations[i],
        r: 0,
      })),
      fill: true,
      showLine: false,
      backgroundColor: "rgb(141, 63, 0)",
      borderColor: "rgb(0, 0, 0)",
      borderWidth: 0,
      pointRadius: 0,
    });
  }
  const data: ChartData<"scatter"> = {
    datasets: datasets,
  };

  const boxes: Record<string, AnnotationOptions<"box"> & { name: string }> =
    _.keyBy(
      overlaps.flatMap(
        ({ airspace: { name, type, lowerLimit, higherLimit }, segments }, i) =>
          segments.map((s): AnnotationOptions<"box"> & { name: string } => ({
            type: "box",
            name: `${name}-${i}-${s[0]}`,
            adjustScaleRange: false,
            xMin: s[0],
            xMax: s[1],
            yMin: lowerLimit.roughFeetValue() + 0.01,
            yMax: higherLimit.roughFeetValue(),
            backgroundColor:
              type === AirspaceType.CTR
                ? "#002f9452"
                : type === DangerZoneType.P
                ? "#ff0000c5"
                : "#21003f7d",
            borderColor: type === AirspaceType.CTR ? "#002f94ca" : "#001033",
          })),
      ),
      "name",
    );
  const dragData = {
    round: -2, // rounds the values to n decimal places
    showTooltip: true, // show the tooltip while dragging [default = true]
    magnet: {
      // @ts-ignore
      to: (value: any) => value, //
      // to: (value) => value + 100,
    },
    // @ts-ignore
    onDragStart: (e, datasetIndex, index, value) => {
      const w = points[index].routeWaypoint;
      if (!canBeDragged(datasetIndex, w)) {
        // console.log(route.length);
        return false;
      }
      /*
          // e = event, element = datapoint that was dragged
          // you may use this callback to prohibit dragging certain datapoints
          // by returning false in this callback
          if (element.datasetIndex === 0 && element.index === 0) {
            // this would prohibit dragging the first datapoint in the first
            // dataset entirely
          }
            return false
          */
    },
    // @ts-ignore
    onDragEnd,
    // @ts-ignore
    // onDrag: onDragEnd,
  };

  const newLocal = {
    ...boxes,
    ...pointLabels,
  };

  return (
    <Scatter
      key={`vertical-profile-${hashCode(JSON.stringify(route.waypoints))}`}
      data={data}
      options={{
        maintainAspectRatio: false,
        animation: false,
        elements: {
          line: {
            segment: { borderColor: "#000000F", borderWidth: 2 },
            borderColor: "black",
          },
          point: { radius: 0 },
        },
        plugins: {
          annotation: {
            enter: (event) => {},
            leave: (event) => {},
            annotations: newLocal,
          },
          // @ts-ignore
          dragData,
        },
        scales: {
          y: {
            grace: 20,
            suggestedMax: 1500,
            suggestedMin: 0,
            min: (elevation && min(elevation.elevations)) || 0,
          },
        },
      }}
    />
  );
};

const hashCode = (s: string) => {
  let hash = 0;
  if (s.length === 0) {
    return hash;
  }
  for (var i = 0; i < s.length; i++) {
    var char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

function canBeDragged(datasetIndex: number, w: Waypoint | null) {
  return !(
    datasetIndex !== 0 ||
    w === null ||
    (AerodromeWaypoint.isAerodromeWaypoint(w) &&
      w.waypointType === AerodromeWaypointType.RUNWAY)
  );
}
