import CheapRuler from 'cheap-ruler';
import { Fragment } from 'react';
import { Polygon, SVGOverlay, Tooltip } from 'react-leaflet';
import styled from 'styled-components';
import { VfrPoint } from 'ts-aerodata-france';
import { toLeafletLatLng } from '../../domain';
import { useAiracData } from '../useAiracData';
import { boxAround } from './boxAround';
import { MapBounds } from './DisplayedContent';
import { pointToLeafletLatLng, toCheapRulerPoint } from './FlightPlanningLayer';
import { preventDefault } from './preventDefault';

export const VfrPoints = ({
    onClick,
    mapBounds,
}: {
    onClick: (vfrPoint: VfrPoint) => void;
    mapBounds: MapBounds;
}) => {
    const { airacData } = useAiracData();
    let components: JSX.Element[] | undefined = [];
    if (mapBounds) {
        components = airacData.getVfrPointsInBbox(...mapBounds).map((vfrPoint) => {
            const { name, latLng, icaoCode } = vfrPoint;
            const ruler = new CheapRuler(Number(latLng.lat), 'nauticalmiles');
            const center = toCheapRulerPoint(toLeafletLatLng(latLng));
            const bottomRight = pointToLeafletLatLng(ruler.offset(center, 0.5, -0.5));
            const top = pointToLeafletLatLng(ruler.offset(center, 0, 0.4));
            const left = pointToLeafletLatLng(ruler.offset(center, -0.35, -0.2));
            const right = pointToLeafletLatLng(ruler.offset(center, 0.35, -0.2));

            const bounds = boxAround(toCheapRulerPoint(bottomRight), 10);
            return (
                <Fragment key={`${icaoCode}/${name}`}>
                    {
                        <div title={`${icaoCode}`}>
                            <SVGOverlay
                                attributes={{
                                    stroke: 'red',
                                    class: 'overflow-visible',
                                }}
                                bounds={bounds}
                                interactive={true}
                                eventHandlers={{
                                    click: (e) => {
                                        preventDefault(e);
                                        onClick(vfrPoint);
                                    },
                                }}
                            >
                                <Polygon
                                    color="#002e94"
                                    positions={[top, left, right]}
                                    eventHandlers={{
                                        click: (e) => {
                                            preventDefault(e);
                                            onClick(vfrPoint);
                                        },
                                    }}
                                ></Polygon>
                                <Polygon color="#002e94" positions={[right]}>
                                    <StyledTooltip
                                        key={`tooltip-wpt-${icaoCode}-${name}`}
                                        permanent
                                        direction={'right'}
                                    >
                                        {name}
                                    </StyledTooltip>
                                </Polygon>
                            </SVGOverlay>
                        </div>
                    }
                </Fragment>
            );
        });
    }
    return <>{components}</>;
};

const StyledTooltip = styled(Tooltip)`
    background-color: transparent;
    box-shadow: unset;
    background-color: none;
    border: none;
    border-radius: none;
    color: #002e94;
    /* -webkit-text-stroke: 0.5px white; */
    white-space: nowrap;
    text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;
    text-align: left;
    margin: 0px;
    font-family: 'Folio XBd BT';
    font-style: bold;

    ::before {
        display: none;
    }
`;
