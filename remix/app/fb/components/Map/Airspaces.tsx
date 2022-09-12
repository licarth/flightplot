import { Fragment, useState } from 'react';
import { Polygon, SVGOverlay, Tooltip } from 'react-leaflet';
import { Airspace, AirspaceType } from 'ts-aerodata-france';
import { toLeafletLatLng } from '../../domain';
import { boundingBox } from '../../domain/boundingBox';
import { useAiracData } from '../useAiracData';
import { MapBounds } from './DisplayedContent';

const AirspaceSvg = ({ airspace }: { airspace: Airspace }) => {
    const { geometry, name, lowerLimit, higherLimit, airspaceClass } = airspace;
    const leafletLatLngs = geometry.map(toLeafletLatLng);
    const [mouseOver, setMouseOver] = useState(false);
    const color = '#002e94';
    return (
        <Fragment key={`airspace-${name}`}>
            {
                <>
                    <SVGOverlay
                        attributes={{
                            stroke: 'red',
                            class: 'map-svg-text-label',
                        }}
                        bounds={boundingBox(
                            airspace.geometry.map(({ lat, lng }) => ({
                                lat: Number(lat),
                                lng: Number(lng),
                            })),
                        )}
                    >
                        <Polygon
                            positions={leafletLatLngs}
                            interactive={true}
                            pathOptions={{
                                color,
                                fillColor: color,
                                stroke: true,
                                fillOpacity: mouseOver ? 0.3 : 0.2,
                                dashArray: [30, 10],
                                weight: mouseOver ? 4 : 2,
                            }}
                            eventHandlers={{
                                mouseover: () => {
                                    setMouseOver(true);
                                },
                                mouseout: () => {
                                    setMouseOver(false);
                                },
                            }}
                        >
                            <Tooltip
                                sticky
                                opacity={0.8}
                                offset={[10, 0]}
                                key={`tooltip-airspace-${name}`}
                                className=""
                            >
                                <b>
                                    {name} [{airspaceClass}]
                                </b>
                                <br />
                                <div
                                    style={{
                                        textAlign: 'center',
                                        fontStyle: 'italic',
                                        backgroundColor: 'grey',
                                        color: 'white',
                                    }}
                                >
                                    {higherLimit.toString()}
                                    <hr />
                                    {lowerLimit.toString()}
                                </div>
                            </Tooltip>
                        </Polygon>
                    </SVGOverlay>
                </>
            }
        </Fragment>
    );
};

export const Airspaces = ({ mapBounds }: { mapBounds: MapBounds }) => {
    const { airacData } = useAiracData();

    return (
        <>
            {mapBounds &&
                airacData
                    .getAirspacesInBbox(...mapBounds)
                    .filter(({ type }) => type === AirspaceType.CTR)
                    .map((airspace) => (
                        <AirspaceSvg
                            airspace={airspace}
                            key={`${airspace.type}-${airspace.name}`}
                        />
                    ))}
        </>
    );
};
