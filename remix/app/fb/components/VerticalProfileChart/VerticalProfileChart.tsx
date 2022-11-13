import type { ChartData, ChartDataset } from 'chart.js';
import type { AnnotationOptions } from 'chartjs-plugin-annotation';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-plugin-dragdata';
//@ts-ignore
import { Chart as ChartJS } from 'chart.js';
import 'chart.js/auto';
//@ts-ignore
import dragData from 'chartjs-plugin-dragdata';
import * as _ from 'lodash';
import { Chart } from 'react-chartjs-2';

import { max, min } from 'lodash';
import { useResizeDetector } from 'react-resize-detector';
import styled from 'styled-components';
import type { Altitude, FlightLevel, Height } from 'ts-aerodata-france';
import { AirspaceType, DangerZoneType } from 'ts-aerodata-france';
import type { Route, Waypoint } from '../../../domain';
import { AerodromeWaypoint, AerodromeWaypointType } from '../../../domain';
import { aircraftCollection } from '../../../domain/Aircraft';
import type { AirspaceSegmentOverlap } from '../../../domain/AirspaceIntersection/routeAirspaceOverlaps';
import type { ElevationAtPoint } from '../../elevationOnRoute';
import { Colors } from '../Map/Colors';

ChartJS.register(annotationPlugin);
ChartJS.register(dragData);

export type SetWaypointAltitude = ({
    waypointPosition,
    altitude,
}: {
    waypointPosition: number;
    altitude: number | null;
}) => void;

export type VerticalProfileChartProps = {
    route: Route;
    elevation: ElevationAtPoint;
    setWaypointAltitude?: SetWaypointAltitude;
    airspaceOverlaps: AirspaceSegmentOverlap[];
    fitToSpace?: boolean;
};

function isTouchDevice() {
    return (
        'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
    );
}

export const VerticalProfileChart = ({
    route,
    elevation,
    setWaypointAltitude,
    airspaceOverlaps,
    fitToSpace,
}: VerticalProfileChartProps) => {
    const { width: availableWidth, ref } = useResizeDetector();

    const onDragEnd =
        //@ts-ignore
        (e, datasetIndex, index, value) => {
            if (value.routeIndex) {
                setWaypointAltitude &&
                    setWaypointAltitude({
                        waypointPosition: value.routeIndex,
                        altitude: value.y,
                    });
            }
        };

    if (!route || route.waypoints.length <= 1) {
        return <></>;
    }

    const verticalProfile = route.verticalProfile({
        aircraft: aircraftCollection[0],
    });

    const points = verticalProfile;

    const pointData = points.map(({ distance: x, altitudeInFeet: y, routeIndex }) => ({
        x,
        y,
        routeIndex,
    }));

    const fontSpec = {
        // lineHeight: '40%',
        size: 12,
        // family: 'Univers',
        // weight: 'bold',
        // style: 'normal',
    } as unknown as AnnotationOptions<'label'>['font'];

    const pointLabels: (AnnotationOptions<'line'> | AnnotationOptions<'label'>)[] = points
        .filter(({ routeWaypoint }) => routeWaypoint !== null)
        .flatMap(({ distance: x, name, altitudeInFeet }, i) => [
            {
                type: 'line',
                scaleID: 'x',
                borderWidth: 2,
                borderColor: '#0000006cF',
                borderDash: [30, 10],
                value: x,
                label: {
                    width: 100,
                    height: 100,
                    position: 'start',
                    backgroundColor: '#0000006cF',
                    content: name || null,
                    enabled: true,
                },
            },
            {
                type: 'label',
                scaleID: 'x',
                drawTime: 'afterDraw',
                font: fontSpec,
                padding: { top: 1, bottom: 1, left: 2, right: 2 },
                position: () =>
                    i === 0 ? { x: 'start', y: 'start' } : { x: 'center', y: 'start' },
                borderRadius: 1,
                backgroundColor: '#0000006cF',
                content: name && name?.length > 10 ? name.substring(0, 10) + '…' : name,
                color: 'white',
                xValue: x,
                yAdjust: 25,
                yValue: (context, opts) => {
                    return context.chart.scales['yAxes'].max;
                },
            } as AnnotationOptions<'label'>,
        ]);

    const datasets: ChartDataset<'scatter'>[] = [
        {
            label: 'Route',
            data: pointData,
            fill: false,
            showLine: true,
            backgroundColor: '#002e94',
            borderColor: '#002e94',
            borderWidth: 5,
            pointHitRadius: 25,
            pointRadius: (p) =>
                //@ts-ignore
                p.raw &&
                //@ts-ignore
                p.raw.routeIndex &&
                !isTouchDevice() &&
                //@ts-ignore
                canBeDragged(p.datasetIndex, route.waypoints[p.raw.routeIndex])
                    ? 10
                    : 0,
        },
    ];

    if (elevation) {
        datasets.push({
            label: 'Élevation du terrain',
            data: elevation.distancesFromStartInNm.map((x, i) => ({
                x,
                y: elevation.elevations[i],
            })),
            fill: 'start',
            showLine: true,
            backgroundColor: '#883d00bc',
            borderColor: '#883d00',
            borderWidth: 0,
            pointHitRadius: 0,
            pointHoverRadius: 0,
            pointRadius: 0,
        });
    }

    const airspacesDatasets: ChartDataset<'scatter'>[] = _.flatten(
        airspaceOverlaps.flatMap(
            ({ airspace: { name, type, lowerLimit, higherLimit }, segments }, i) => {
                return segments.map(([start, end]): ChartDataset<'scatter'>[] => {
                    const firstI = elevation.distancesFromStartInNm.findIndex((x) => x >= start);
                    return [
                        {
                            label: '<HIDE>',
                            data: elevation
                                ? elevation.distancesFromStartInNm
                                      .filter((x) => x >= start && x <= end)
                                      .map((x, i) => ({
                                          x,
                                          y: isHeight(higherLimit)
                                              ? elevation.elevations[i + firstI] +
                                                higherLimit.feetValue
                                              : higherLimit.feetValue + 0.01,
                                      }))
                                : [
                                      { x: start, y: higherLimit.feetValue },
                                      { x: end, y: higherLimit.feetValue },
                                  ],
                            fill: false,
                            showLine: true,
                            borderColor: spaceBorderCOlor(type),
                            borderWidth: 1,
                            pointHitRadius: 0,
                            pointHoverRadius: 0,
                            pointRadius: 0,
                            clip: 10,
                        },
                        {
                            label: '<HIDE>' + name,
                            data: elevation
                                ? elevation.distancesFromStartInNm
                                      .filter((x) => x >= start && x <= end)
                                      .map((x, i) => ({
                                          x,
                                          y: isHeight(lowerLimit)
                                              ? elevation.elevations[i + firstI] +
                                                lowerLimit.feetValue
                                              : lowerLimit.feetValue + 0.01,
                                      }))
                                : [
                                      { x: start, y: lowerLimit.feetValue },
                                      { x: end, y: lowerLimit.feetValue },
                                  ],
                            fill: '-1',
                            showLine: true,
                            backgroundColor: spaceBackgroundColor(type),
                            borderColor: type === AirspaceType.CTR ? '#002f94ca' : '#001033',
                            borderWidth: 1,
                            pointHitRadius: 0,
                            pointHoverRadius: 0,
                            pointRadius: 0,
                        },
                    ];
                });
            },
        ),
    );

    const data: ChartData<'scatter'> = {
        datasets: [...datasets, ...airspacesDatasets],
    };

    const boxes: Record<
        string,
        | (AnnotationOptions<'line'> | AnnotationOptions<'label'>) & {
              name: string;
          }
    > = _.keyBy(
        airspaceOverlaps.flatMap(
            ({ airspace: { name, type, lowerLimit, higherLimit }, segments }, i) => {
                return [
                    ...segments.flatMap(
                        (
                            s,
                            j,
                        ): (
                            | (AnnotationOptions<'line'> | AnnotationOptions<'label'>) & {
                                  name: string;
                              }
                        )[] => {
                            const firstI = elevation.distancesFromStartInNm.findIndex(
                                (x) => x >= s[0],
                            );
                            const lastI = elevation.distancesFromStartInNm.findIndex(
                                (x, i) => i > firstI && x >= s[1],
                            );
                            const minElevation = _.min(elevation.elevations.slice(firstI, lastI));
                            const spaceMinAltitude = isHeight(lowerLimit)
                                ? (minElevation || 0) + lowerLimit.feetValue
                                : lowerLimit.feetValue;
                            const lowerStart = isHeight(lowerLimit)
                                ? elevation.elevations[i + firstI - 1] + lowerLimit.feetValue
                                : lowerLimit.feetValue + 0.01;
                            const upperStart = isHeight(higherLimit)
                                ? elevation.elevations[i + firstI - 1] + higherLimit.feetValue
                                : higherLimit.feetValue + 0.01;
                            const lowerEnd = isHeight(lowerLimit)
                                ? elevation.elevations[i + lastI - 1] + lowerLimit.feetValue
                                : lowerLimit.feetValue + 0.01;
                            const upperEnd = isHeight(higherLimit)
                                ? elevation.elevations[i + lastI - 1] + higherLimit.feetValue
                                : higherLimit.feetValue + 0.01;
                            return [
                                {
                                    name: 'zone-label-' + name + '-' + j,
                                    display: ({ chart }) =>
                                        spaceMinAltitude < chart.scales['yAxes'].max,
                                    type: 'label',
                                    scaleID: 'x',
                                    drawTime: 'afterDatasetsDraw',
                                    font: fontSpec,
                                    padding: 0,
                                    position: { x: 'start', y: 'start' },
                                    borderRadius: 2,
                                    textAlign: 'left',
                                    content: name,
                                    color: 'black',
                                    xValue: s[0] >= 0 ? s[0] : 0,
                                    xAdjust: 5,
                                    yAdjust: (context, opts) =>
                                        isHeight(higherLimit) &&
                                        context.chart.scales['yAxes'].max > upperStart
                                            ? 20
                                            : 5,
                                    yValue: (context, opts) => {
                                        return Math.min(
                                            upperStart,
                                            context.chart.scales['yAxes'].max,
                                        );
                                    },
                                    z: 100,
                                } as
                                    | AnnotationOptions<'label'> & {
                                          name: string;
                                      },
                                {
                                    type: 'line',
                                    name: `${name}-${i}-${s[0]}`,
                                    adjustScaleRange: false,
                                    xMin: s[0],
                                    xMax: s[1],
                                    yMin: lowerLimit.feetValue + 0.01,
                                    yMax: higherLimit.feetValue,
                                    borderColor:
                                        type === AirspaceType.CTR ? '#002f94ca' : '#001033',
                                },
                                {
                                    type: 'line',
                                    name: `${name}-${i}-${s[0]}`,
                                    adjustScaleRange: false,
                                    xMin: s[0],
                                    xMax: s[0],
                                    yMin: isHeight(lowerLimit)
                                        ? elevation.elevations[i + firstI] + lowerLimit.feetValue
                                        : lowerLimit.feetValue + 0.01,
                                    yMax: higherLimit.feetValue,
                                    borderWidth: 1,
                                    borderColor:
                                        type === AirspaceType.CTR ? '#002f94ca' : '#001033',
                                },
                                {
                                    name: `${name}-${i}-${s[0]}-right`,
                                    type: 'line',
                                    adjustScaleRange: false,
                                    xMin: s[1],
                                    xMax: s[1],
                                    yMin: lowerEnd,
                                    yMax: upperEnd,
                                    borderWidth: 1,
                                    borderColor:
                                        type === AirspaceType.CTR ? '#002f94ca' : '#001033',
                                },
                            ];
                        },
                    ),
                ];
            },
        ),
        'name',
    );

    const dragDataPluginOptions = {
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
        // onDrag: () =>,
    };

    const newLocal = {
        ...boxes,
        ...pointLabels,
    };

    const widthInPixels = fitToSpace
        ? undefined
        : Math.max(availableWidth || 0, route.totalDistance * 15);

    return (
        <ChartOuterContainer ref={ref}>
            <ChartContainer $width={widthInPixels}>
                <Chart
                    // style={{ width: '2000px' }}
                    // width={2000}
                    key={`vertical-profile-${hashCode(JSON.stringify(route.waypoints))}`}
                    type="scatter"
                    data={data}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: false,
                        elements: {
                            line: {
                                segment: { borderColor: '#000000F', borderWidth: 2 },
                                borderColor: 'black',
                            },
                            point: { radius: 0 },
                        },
                        plugins: {
                            tooltip: {
                                //   callbacks: {
                                //     footer: footer,
                                //   }
                            },
                            legend: {
                                display: false,
                                labels: {
                                    filter: function (item, chart) {
                                        // Logic to remove a particular legend item goes here
                                        return !item.text.startsWith('<HIDE>');
                                    },
                                },
                            },
                            annotation: {
                                enter: (event) => {},
                                leave: (event) => {},
                                annotations: newLocal,
                            },
                            // @ts-ignore
                            dragData: !isTouchDevice() && dragDataPluginOptions,
                        },
                        scales: {
                            yAxes: {
                                max: (max(route.waypoints.map((w) => w.altitude)) || 0) + 2000,
                                grace: 20,
                                suggestedMax: 1500,
                                suggestedMin: 0,
                                min: (elevation && min(elevation.elevations)) || 0,
                                ticks: {
                                    callback: function (val, index) {
                                        return `${this.getLabelForValue(Number(val))} ft`;
                                    },
                                },
                            },
                        },
                    }}
                />
            </ChartContainer>
        </ChartOuterContainer>
    );
};

type ContainerProps = { $width?: number };

const ChartContainer = styled.div<ContainerProps>`
    ${({ $width }) => `${$width ? `width: ${$width}px` : 'width: 100%'};`}
    height: 100%;
`;

const ChartOuterContainer = styled.div`
    /* justify-items: stretch;
    flex-grow: 1; */
    height: 100%;
    overflow-y: scroll;
    canvas {
        /* width: 100% !important; */
    }
`;
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

function spaceBackgroundColor(type: AirspaceType | DangerZoneType) {
    return type === AirspaceType.CTR
        ? '#99ABD17d'
        : type === DangerZoneType.P
        ? '#ff00009f'
        : type === DangerZoneType.D
        ? '#ff6a003d'
        : type === DangerZoneType.R
        ? '#ff6a003d'
        : type === AirspaceType.SIV
        ? '#7398807d'
        : '#21003f7d';
}

function spaceBorderCOlor(type: AirspaceType | DangerZoneType) {
    if (type === AirspaceType.CTR) {
        return '#002f94ca';
    } else if (type === AirspaceType.SIV) {
        return Colors.sivThinBorder;
    } else {
        return '#001033';
    }
}

function canBeDragged(datasetIndex: number, w: Waypoint | null) {
    return !(
        datasetIndex !== 0 ||
        w === null ||
        (AerodromeWaypoint.isAerodromeWaypoint(w) &&
            w.waypointType === AerodromeWaypointType.RUNWAY)
    );
}

const isHeight = (t: Altitude | Height | FlightLevel): t is Height => {
    return t.toString().includes('SFC');
};
