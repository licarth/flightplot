import { Fragment, useState } from 'react';
import { Polygon, SVGOverlay, Tooltip } from 'react-leaflet';
import styled from 'styled-components';
import type { Vor } from 'ts-aerodata-france';
import { toLeafletLatLng } from '~/fb/domain';
import { toCheapRulerPoint } from '~/fb/domain/toCheapRulerPoint';
import { toLatLng } from '~/fb/LatLng';
import VorDmeIcon from '~/generated/icons/VorDme';
import { boxAround } from '../boxAround';

type PropsType = {
    $dme?: boolean;
    $mouseOver?: boolean;
};

export const VorMarker = ({
    vor: { name, latLng, dme, mapShortName, frequency, ident },
}: {
    vor: Vor;
}) => {
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
                {<StyledVor $dme={dme} $mouseOver={mouseOver} />}
                {mouseOver && (
                    <Polygon
                        fill={false}
                        stroke={false}
                        positions={[[l.lat + 0.015, l.lng + 0.015]]}
                    >
                        <StyledTooltip key={`tooltip-vor-${name}`} permanent direction={'bottom'}>
                            {mapShortName} {ident !== mapShortName && `- ${ident}`} -{' '}
                            {frequency.toString()}
                        </StyledTooltip>
                    </Polygon>
                )}
            </SVGOverlay>
        </Fragment>
    );
};

const StyledVor = styled(VorDmeIcon)<PropsType>`
    ${({ $mouseOver }) => $mouseOver && `filter: drop-shadow(3px 5px 1px rgb(0 0 0 / 0.4));`}
    #dme {
        ${({ $dme }) => !$dme && `display: none !important;`}
    }
`;

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
