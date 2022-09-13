import { useState } from 'react';
import { Polygon, SVGOverlay, Tooltip } from 'react-leaflet';
import styled from 'styled-components';
import type { Airspace } from 'ts-aerodata-france';
import { toLeafletLatLng } from '~/fb/domain';
import { boundingBox } from '~/fb/domain/boundingBox';
import { Colors } from '../Colors';
import { convertToWebMercator, WebMercatorCoords } from './coordsConverter';

type CtrSVGPolygonProps = {
    ctr: Airspace;
    i: number;
};

// Convert coords

export const CtrSVGPolygon = ({ ctr, i }: CtrSVGPolygonProps) => {
    const [mouseOver, setMouseOver] = useState(false);
    const { geometry, name, lowerLimit, higherLimit, airspaceClass } = ctr;
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
                    class: 'map-svg-text-label',
                }}
                key={'overlay' + i}
                bounds={bbox}
            >
                <svg
                    xmlSpace={'preserve'}
                    overflow={'visible'}
                    id={ctr.name}
                    viewBox={`${minlng / 1000} ${minlat / 1000} ${(maxlng - minlng) / 1000} ${
                        (maxlat - minlat) / 1000
                    }`}
                >
                    <clipPath id={`airspace-clip-${i}`}>
                        <path d={d}></path>
                    </clipPath>
                    <g
                        style={{
                            display: 'none',
                        }}
                    >
                        <path id={`ctr-${i}`} d={d}></path>
                    </g>
                    <use
                        stroke={Colors.ctrBorderLightBlue}
                        strokeOpacity={0.5}
                        strokeWidth={3}
                        clipPath={`url(#airspace-clip-${i})`}
                        xlinkHref={`#ctr-${i}`}
                    />
                    <path
                        stroke={Colors.ctrBorderBlue}
                        strokeWidth={mouseOver ? 0.6 : 0.3}
                        fillOpacity={0.2}
                        strokeDasharray={'5, 5'}
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
                    <Tooltip sticky opacity={1} offset={[10, 0]} key={`tooltip-airspace-${name}`}>
                        <IgnAirspaceNameFont>
                            <b>
                                {name} [{airspaceClass}]
                            </b>
                            <br />
                            <div>
                                <i>
                                    {higherLimit.toString()}
                                    <hr />
                                    {lowerLimit.toString()}
                                </i>
                            </div>
                        </IgnAirspaceNameFont>
                    </Tooltip>
                </Polygon>
            </SVGOverlay>
        </>
    );
};

const IgnAirspaceNameFont = styled.span`
    text-align: center;
    font-family: 'Futura';
    color: ${Colors.ctrBorderBlue};
`;
