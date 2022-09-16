import { useRef } from 'react';
import type { Route } from '../../../domain';
import type { LatLng } from '../../../domain/LatLng';
import type { PrintArea } from '../../../domain/PrintArea';
import { convertToLambert } from './coordsConverter';
import { createLineForRouteSegment } from './FlightPlanningLayer';

export const RouteSvg = ({
    route,
    printArea: { pageFormat: format, bottomLeft },
}: {
    route: Route;
    printArea: PrintArea;
}) => {
    const hundredMilliInLambert = 105_000 / 2.1;
    const pageWidthInLambert = (hundredMilliInLambert * format.dxMillimeters) / 100;
    const pageHeightInLambert = (pageWidthInLambert * format.dyMillimeters) / format.dxMillimeters;
    const bottomLeftLambert = convertToLambert(bottomLeft);

    const latLngToPageCoords = (latLng: LatLng) => {
        const lambertCoords = convertToLambert(latLng);
        const pageCoords = {
            x:
                ((lambertCoords.x - bottomLeftLambert.x) / pageWidthInLambert) *
                format.dxMillimeters,
            y:
                format.dyMillimeters *
                (1 - (lambertCoords.y - bottomLeftLambert.y) / pageHeightInLambert),
        };

        return pageCoords;
    };

    return (
        <>
            {route.waypoints.map(({ latLng: { lat, lng }, name }, i) => {
                const point = latLngToPageCoords({ lat, lng });

                const line1 =
                    route.waypoints[i] && route.waypoints[i + 1]
                        ? createLineForRouteSegment(route, i)
                        : [];

                const w1 = line1.length > 1 && latLngToPageCoords(line1[0]);
                const w2 = line1.length > 1 && latLngToPageCoords(line1[1]);
                return (
                    <>
                        <circle
                            r={nmToMm(2.5)}
                            cx={point.x}
                            cy={point.y}
                            opacity={0.9}
                            fillOpacity={0.4}
                            fill="white"
                            strokeOpacity={0.9}
                            stroke="black"
                            strokeWidth={1}
                        />
                        <PointLabel name={name} point={point} />
                        {w1 && w2 && (
                            <line
                                x1={w1.x}
                                y1={w1.y}
                                x2={w2.x}
                                y2={w2.y}
                                r={nmToMm(2.5)}
                                cx={point.x}
                                cy={point.y}
                                opacity={0.9}
                                fillOpacity={0.4}
                                fill="white"
                                strokeOpacity={0.9}
                                stroke="black"
                                strokeWidth={1}
                            />
                        )}
                    </>
                );
            })}
            {[
                // { lat: 42.5, lng: 4.5 },
                // { lat: 43, lng: 4.5 },
                // { lat: 43.5, lng: 4.5 },
                // { lat: 42.5, lng: 4 },
                // { lat: 43, lng: 4 },
                // { lat: 43.5, lng: 4 },
                // { lat: 44, lng: 4 },
                // { lat: 43.5, lng: 4 },
                // { lat: 44.5, lng: 4 },
                // { lat: 44, lng: 4.5 },
                // { lat: 43.5, lng: 4.5 },
                // { lat: 44.5, lng: 4.5 },
            ]
                .map(latLngToPageCoords)
                .map(({ x, y }) => (
                    <circle
                        r={2}
                        cx={x}
                        cy={y}
                        opacity={1}
                        fill="blue"
                        stroke="red"
                        strokeWidth={1}
                    />
                ))}
        </>
    );
};

const nmToMm = (nm: number) => (nm / 500_000) * 1852 * 1000;

const PointLabel = ({ name, point }: { name: string | null; point: { x: number; y: number } }) => {
    const textAnchor = { x: point.x + nmToMm(2), y: point.y + nmToMm(2.7) };
    const textRef = useRef<SVGTextElement>(null);

    return (
        <>
            {/* {textRef.current && (
        <rect
          x={textAnchor.x}
          y={textAnchor.y - textRef.current.scrollHeight}
          width={textRef.current.clientWidth}
          height={textRef.current.clientHeight}
          fill="white"
        />
      )} */}
            <text
                ref={textRef}
                x={textAnchor.x}
                y={textAnchor.y}
                font-family="Russo One, sans-serif"
                font-size="5"
            >
                {name}
            </text>
        </>
    );
};
