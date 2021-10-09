import { ChartData, ChartDataset } from "chart.js";
import annotationPlugin, { AnnotationOptions } from "chartjs-plugin-annotation";
import "chartjs-plugin-dragdata";
//@ts-ignore
import dragData from "chartjs-plugin-dragdata";
import * as _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import { Chart, Scatter } from "react-chartjs-2";
import styled from "styled-components";
import { AiracData, AirspaceType, DangerZoneType } from "ts-aerodata-france";
import { Route } from "../domain";
import { routeAirspaceOverlaps } from "../domain/VerticalProfile";
import { ElevationAtPoint, elevationOnRoute } from "../elevationOnRoute";
import { openElevationApiElevationService } from "../ElevationService/openElevationApiElevationService";
import { isLatLngWaypoint } from "./Map/FlightPlanningLayer";
Chart.register(annotationPlugin);
Chart.register(dragData);

const VerticalProfileDiv = styled.div`
  background-color: white;
  flex: 1 1 auto;
  display: flex;
  flex-flow: column;
  overflow: hidden;
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

  useEffect(() => {
    if (route.length > 1) {
      elevationOnRoute({ elevationService: openElevationApiElevationService })(
        route,
      ).then((e) => setElevation(e));
    } else {
      setElevation(undefined);
    }
  }, [route]);

  const [elevation, setElevation] = useState<ElevationAtPoint>();

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

  const datasets: ChartDataset<"scatter">[] = [
    {
      label: "Flight Path",
      data: pointData,
      fill: false,
      showLine: true,
      backgroundColor: "rgb(255, 99, 132)",
      borderColor: "rgb(0, 0, 0)",
      borderWidth: 2,
      pointRadius: 5,
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
      pointHitRadius: 0,
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
      if (datasetIndex !== 0 || !isLatLngWaypoint(route.waypoints[index])) {
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
            point: { radius: 0 },
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
              grace: 20,
              // max: (max(altitudes) || 0) + 1000,
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
