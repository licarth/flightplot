import _ from 'lodash';
import { useResizeDetector } from 'react-resize-detector';
import styled from 'styled-components';
import type { Route } from '../../../domain';
import type { AirspaceSegmentOverlap } from '../../../domain/AirspaceIntersection/routeAirspaceOverlaps';
import type { ElevationAtPoint } from '../../elevationOnRoute';
import { Colors } from '../Map/Colors';

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

export const VerticalProfileChart = ({
    route,
    elevation,
    setWaypointAltitude,
    airspaceOverlaps,
    fitToSpace,
}: VerticalProfileChartProps) => {
    const { width: availableWidth, height: availableHeight, ref } = useResizeDetector();

    // if (availableHeight === undefined) {
    //     return <></>;
    // }

    const totalDistance = route.totalDistance;

    const widthInPixels = fitToSpace
        ? undefined
        : Math.max(availableWidth || 0, totalDistance * 15);

    const minAltitude = _.min(route.waypoints.map((w) => w.altitude));
    const maxAltitude = _.max(route.waypoints.map((w) => w.altitude));
    const minElevation = _.min(elevation.elevations);
    const maxElevation = _.max(elevation.elevations) || 0;
    const maxY = (_.max([maxElevation, maxAltitude]) || 2000) + 2000;
    const minY = _.min([minElevation, minAltitude]) || 0;

    const oneFootInPixels = availableHeight / (maxY - minY);

    const oneNmInPixels = widthInPixels / totalDistance;

    console.log('availableHeight', availableHeight);
    console.log('widthInPixels', widthInPixels);
    console.log('oneFootInPixels', oneFootInPixels);
    console.log('oneNmInPixels', oneNmInPixels);
    console.log('minY - maxY', `${minY} - ${maxY}`);

    const toY = (y: number) => availableHeight + minY * oneFootInPixels - y * oneFootInPixels;

    const d = `M${elevation.distancesFromStartInNm
        .map((dist, i) => `${dist * oneNmInPixels} ${toY(elevation.elevations[i])}`)
        .join('L')}L${totalDistance * oneNmInPixels} ${toY(minY)}`;

    return (
        <ChartOuterContainer ref={ref}>
            <ChartContainer $width={widthInPixels}>
                <svg
                    width={widthInPixels}
                    height={availableHeight}
                    viewBox={`0 0 ${widthInPixels} ${availableHeight}`}
                >
                    <rect
                        fill="none"
                        stroke="black"
                        x="0"
                        y="0"
                        width={widthInPixels}
                        height={availableHeight}
                    />
                    <path d={d} stroke={'brown'} fill={`${Colors.terrain}`} />
                </svg>
            </ChartContainer>
        </ChartOuterContainer>
    );
};

const ChartOuterContainer = styled.div`
    height: 100%;
    overflow-y: scroll;
`;

const ChartContainer = styled.div<ContainerProps>`
    ${({ $width }) => `${$width ? `width: ${$width}px` : 'width: 100%'};`}
    height: 100%;
`;
type ContainerProps = { $width?: number };
