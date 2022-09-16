import { useState } from 'react';
import { Polygon, SVGOverlay } from 'react-leaflet';
import type { LatLng } from 'ts-aerodata-france';
import { toLeafletLatLng } from '~/domain';
import { boundingBox } from '~/domain/boundingBox';
import { convertToWebMercator, WebMercatorCoords } from './coordsConverter';

type Props = {
    children?: JSX.Element;
    geometry: LatLng[];
    name: string;
    i: number;
    thinBorderColor: string;
    thickBorderColor: string;
    thinDashArray: string;
    prefix: string;
};

export const AirspaceSVGPolygon = ({
    geometry,
    children,
    name,
    i,
    thinBorderColor,
    thickBorderColor,
    thinDashArray,
    prefix,
}: Props) => {
    const [mouseOver, setMouseOver] = useState(false);
    const leafletGeom = geometry.map(toLeafletLatLng);
    const geom = leafletGeom
        .map(convertToWebMercator)
        .map(({ x, y }) => ({ x, y: -y } as WebMercatorCoords));
    const d = `M${geom.map(({ x, y }) => `${x / 1000} ${y / 1000}`).join('L')}z`;
    const bbox = boundingBox(
        geometry.map(({ lat, lng }) => ({
            lat: Number(lat),
            lng: Number(lng),
        })),
    );
    const [[minlat, minlng], [maxlat, maxlng]] = boundingBox(geom);
    return (
        <>
            <SVGOverlay
                attributes={{
                    stroke: 'none',
                    fill: 'none',
                    class: 'overflow-visible',
                }}
                key={'overlay' + i}
                bounds={bbox}
            >
                <svg
                    xmlSpace={'preserve'}
                    overflow={'visible'}
                    id={name}
                    viewBox={`${minlng / 1000} ${minlat / 1000} ${(maxlng - minlng) / 1000} ${
                        (maxlat - minlat) / 1000
                    }`}
                >
                    <clipPath id={`${prefix}-clip-${i}`}>
                        <path d={d}></path>
                    </clipPath>
                    <g
                        style={{
                            display: 'none',
                        }}
                    >
                        <path id={`${prefix}-${i}`} d={d}></path>
                    </g>
                    <use
                        stroke={thickBorderColor}
                        strokeOpacity={0.5}
                        strokeWidth={3}
                        clipPath={`url(#${prefix}-clip-${i})`}
                        xlinkHref={`#${prefix}-${i}`}
                    />
                    <path
                        stroke={thinBorderColor}
                        strokeWidth={mouseOver ? 0.6 : 0.3}
                        fillOpacity={0.2}
                        strokeDasharray={thinDashArray}
                        d={d}
                    ></path>
                </svg>
                {/* Polygon is only required for tooltip */}
                <Polygon
                    key={'overlay-po' + i}
                    positions={leafletGeom}
                    interactive={true}
                    pathOptions={{ weight: 0, fillOpacity: 0 }}
                    eventHandlers={{
                        mouseover: () => {
                            setMouseOver(true);
                        },
                        mouseout: () => {
                            setMouseOver(false);
                        },
                    }}
                >
                    {children}
                </Polygon>
            </SVGOverlay>
        </>
    );
};
