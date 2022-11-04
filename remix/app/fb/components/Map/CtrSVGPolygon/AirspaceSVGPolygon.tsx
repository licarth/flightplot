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
    thinBorderColor: string;
    thickBorderColor: string;
    thinDashArray: string;
    prefix: string;
    highlighted?: boolean;
    thickBorderWidth?: number;
    thinBorderWidth?: number;
    highlightedThinBorderWidth?: number;
};

export const AirspaceSVGPolygon = memo(function AirspaceSVGPolygon({
    highlighted,
    geometry,
    children,
    name,
    thinBorderColor,
    thickBorderColor,
    thinDashArray,
    thickBorderWidth = 6,
    thinBorderWidth = 0.6,
    highlightedThinBorderWidth = thinBorderWidth * 3,
    prefix,
}: Props) {
    // remove spaces
    const id = `${prefix}-${name}`.replace(/\s/g, '');
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
        <SVGOverlay
            attributes={{
                stroke: 'none',
                fill: 'none',
                class: 'overflow-visible',
            }}
            key={'overlay' + id}
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
                <clipPath id={`${prefix}-clip-${id}`}>
                    <path d={d}></path>
                </clipPath>
                <g
                    style={{
                        display: 'none',
                    }}
                >
                    <path id={`${prefix}-${id}`} d={d}></path>
                </g>
                <use
                    stroke={thickBorderColor}
                    strokeOpacity={0.5}
                    strokeWidth={thickBorderWidth}
                    clipPath={`url(#${prefix}-clip-${id})`}
                    xlinkHref={`#${prefix}-${id}`}
                />
                <use
                    stroke={thinBorderColor}
                    strokeWidth={highlighted ? highlightedThinBorderWidth : thinBorderWidth}
                    fillOpacity={0.2}
                    strokeDasharray={thinDashArray}
                    clipPath={`url(#${prefix}-clip-${id})`}
                    xlinkHref={`#${prefix}-${id}`}
                />
            </svg>
            {/* Polygon is only required for tooltip */}
            <Polygon
                key={'overlay-po' + id}
                positions={leafletGeom}
                interactive={false}
                pathOptions={{ weight: 0, fillOpacity: 0 }}
            >
                {children}
            </Polygon>
        </SVGOverlay>
    );
});
