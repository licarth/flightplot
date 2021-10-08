import { ChartData } from "chart.js";
import annotationPlugin, { AnnotationOptions } from "chartjs-plugin-annotation";
import "chartjs-plugin-dragdata";
//@ts-ignore
import dragData from "chartjs-plugin-dragdata";
import * as _ from "lodash";
import { max, min } from "lodash";
import { useCallback } from "react";
import { Chart, Scatter } from "react-chartjs-2";
import styled from "styled-components";
import { AiracData, AirspaceType, DangerZoneType } from "ts-aerodata-france";
import { Route } from "../domain";
import { routeAirspaceOverlaps } from "../domain/VerticalProfile";
import { isLatLngWaypoint } from "./Map/FlightPlanningLayer";
Chart.register(annotationPlugin);
Chart.register(dragData);

const VerticalProfileDiv = styled.div`
  /* position: absolute; */
  /* right: 0px; */
  /* bottom: 150px; */
  height: 100%;
  /* width: 1000px; */
  background-color: white;
`;

export const VerticalProfileChart = ({
  route,
  airacData,
  setWaypointAltitude,
}: {
  route: Route;
  airacData?: AiracData;
  setWaypointAltitude: (params: {
    waypointPosition: number;
    altitude: number;
  }) => void;
}) => {
  //@ts-ignore
  const onDragEnd = useCallback(
    (e, datasetIndex, index, value) => {
      setWaypointAltitude({ waypointPosition: index, altitude: value.y });
    },
    [setWaypointAltitude],
  );

  console.log(route);

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
  const altitudes = route.inferredAltitudes;
  const points = route.legs.flatMap(
    ({ startingPointInNm, departureWaypoint, arrivalWaypoint }, i) => {
      const points = [
        {
          x: startingPointInNm,
          y: altitudes[i] || 0,
          name: departureWaypoint.name,
        },
      ];
      if (i === route.length - 1) {
        points.push({
          x: route.totalDistance,
          y: altitudes[i + 1] || 0,
          name: arrivalWaypoint.name,
        });
      }
      return points;
    },
  );

  const pointData = points.map(({ x, y }) => ({ x, y, r: 0 }));
  const pointLabels: AnnotationOptions<"line">[] = points.map(
    ({ x, name }) => ({
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
    }),
  );

  const data: ChartData = {
    datasets: [
      {
        label: "Flight Path",
        data: pointData,
        fill: false,
        showLine: true,
        backgroundColor: "rgb(255, 99, 132)",
        borderColor: "rgb(0, 0, 0)",
        borderWidth: 2,
        segment: { borderColor: "#00000", borderWidth: 2 },
      },
    ],
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
                ? "#002f947f"
                : type === DangerZoneType.P
                ? "#ff0000c5"
                : "#21003f7d",
            borderColor: type === AirspaceType.CTR ? "#002f94" : "#001033",
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
      if (!isLatLngWaypoint(route.waypoints[index])) {
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
    <VerticalProfileDiv>
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
          },
          plugins: {
            annotation: {
              enter: (event) => {
                // console.log(event);
                console.log(route.length);
              },
              leave: (event) => {
                // console.log(event);
              },
              annotations: newLocal,
            },
            // @ts-ignore
            dragData,
          },
          scales: {
            y: {
              min: (min(altitudes) || 0) - 200,
              max: (max(altitudes) || 0) + 1000,
              //@ts-ignore
              // dragData: false,
            },
          },
        }}
      />
    </VerticalProfileDiv>
  );
};

const hashCode = (s: string) => {
  let hash = 0;
  if (s.length == 0) {
    return hash;
  }
  for (var i = 0; i < s.length; i++) {
    var char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};
