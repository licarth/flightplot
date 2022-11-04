import { Fragment, memo, useState } from 'react';
import { Pane, Polygon, SVGOverlay, Tooltip } from 'react-leaflet';
import styled from 'styled-components';
import type { Vor } from 'ts-aerodata-france';
import { toLeafletLatLng } from '~/domain';
import { toLatLng } from '~/domain/LatLng';
import { toCheapRulerPoint } from '~/domain/toCheapRulerPoint';
import { StyledVor } from '../../StyledVor';
import { boxAround } from '../boxAround';
import { Z_INDEX_VFR_NAMES } from '../zIndex';

export type PropsType = {
    $dme?: boolean;
    $mouseOver?: boolean;
    $highlit?: boolean;
};

export const VorMarker = memo(function VorMarker({
    vor: { name, latLng, dme, mapShortName, frequency, ident },
    highlit,
}: {
    vor: Vor;
    highlit?: boolean;
}) {
    const [mouseOver, setMouseOver] = useState(false);
    const l = toLatLng(latLng);
    const center = toCheapRulerPoint(toLeafletLatLng(latLng));
    const bounds = boxAround(center, 1500);

    return (
        <Fragment key={`vor-${name}`}>
            <SVGOverlay
                interactive={true}
                bounds={bounds}
                attributes={{ class: 'overflow-visible' }}
                eventHandlers={{
                    mouseover: () => {
                        setMouseOver(true);
                    },
                    mouseout: () => {
                        setMouseOver(false);
                    },
                }}
            >
                {<StyledVor $dme={dme} $mouseOver={mouseOver} $highlit={highlit} />}
                {mouseOver && (
                    <Polygon
                        fill={false}
                        stroke={false}
                        positions={[[l.lat + 0.015, l.lng + 0.015]]}
                    >
                        <Pane name={`vor-tooltip-${name}`} style={{ zIndex: Z_INDEX_VFR_NAMES }}>
                            <StyledTooltip
                                key={`tooltip-vor-${name}`}
                                permanent
                                direction={'bottom'}
                            >
                                {mapShortName} {ident !== mapShortName && `- ${ident}`} -{' '}
                                {frequency.toString()}
                            </StyledTooltip>
                        </Pane>
                    </Polygon>
                )}
            </SVGOverlay>
        </Fragment>
    );
});

const StyledTooltip = styled(Tooltip)`
    background-color: transparent;
    box-shadow: unset;
    background-color: none;
    border: none;
    border-radius: none;
    color: #002e94;
    text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;
    white-space: nowrap;
    font-weight: bold;
    text-align: left;
    margin: 0px;
    padding-top: 0px;
    font-family: 'Folio XBd BT';
    font-weight: 800;

    ::before {
        display: none;
    }
`;
