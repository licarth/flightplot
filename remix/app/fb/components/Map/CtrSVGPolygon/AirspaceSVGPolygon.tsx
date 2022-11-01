import { memo } from 'react';
import { Polygon, SVGOverlay } from 'react-leaflet';
import type { LatLng } from 'ts-aerodata-france';
import { toLeafletLatLng } from '~/domain';
import { boundingBox } from '~/domain/boundingBox';
import type { WebMercatorCoords } from './coordsConverter';
import { convertToWebMercator } from './coordsConverter';

type Props = {
    children?: JSX.Element;
    geometry: LatLng[];
    name: string;
    i: string | number;
    thinBorderColor: string;
    thickBorderColor: string;
    thinDashArray: string;
    prefix: string;
    highlighted?: boolean;
};

export const AirspaceSVGPolygon = memo(function AirspaceSVGPolygon({
    highlighted,
    geometry,
    children,
    name,
    i,
    thinBorderColor,
    thickBorderColor,
    thinDashArray,
    prefix,
}: Props) {
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
                interactive={false}
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
                        strokeWidth={highlighted ? 0.6 : 0.3}
                        fillOpacity={0.2}
                        strokeDasharray={thinDashArray}
                        d={d}
                    ></path>
                </svg>
                {/* Polygon is only required for tooltip */}
                <Polygon
                    key={'overlay-po' + i}
                    positions={leafletGeom}
                    interactive={false}
                    pathOptions={{ weight: 0, fillOpacity: 0 }}
                >
                    {children}
                </Polygon>
            </SVGOverlay>
        </>
    );
});
