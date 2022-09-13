import { Fragment } from 'react';
import { LayerGroup } from 'react-leaflet';
import { Airspace, AirspaceType } from 'ts-aerodata-france';
import { useAiracData } from '../useAiracData';
import { CtrSVGPolygon } from './CtrSVGPolygon';
import { MapBounds } from './DisplayedContent';

const color = '#002e94';
const AirspaceSvg = ({ airspace, i }: { airspace: Airspace; i: number }) => {
    return (
        <Fragment key={`airspace-${name}`}>
            {
                <>
                    <CtrSVGPolygon ctr={airspace} i={i} />
                    {/* <Polygon
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
                        </Polygon> */}
                </>
            }
        </Fragment>
    );
};

export const Airspaces = ({ mapBounds }: { mapBounds: MapBounds }) => {
    const { airacData } = useAiracData();

    return (
        <LayerGroup>
            {mapBounds &&
                airacData
                    .getAirspacesInBbox(...mapBounds)
                    .filter(({ type }) => type === AirspaceType.CTR)
                    .map((airspace, i) => (
                        <AirspaceSvg
                            i={i}
                            airspace={airspace}
                            key={`${airspace.type}-${airspace.name}`}
                        />
                    ))}
        </LayerGroup>
    );
};
