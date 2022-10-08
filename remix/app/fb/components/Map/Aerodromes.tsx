import { Fragment } from 'react';
import { Polygon, SVGOverlay, Tooltip, useMap } from 'react-leaflet';
import styled from 'styled-components';
import type { Aerodrome } from 'ts-aerodata-france';
import { toLatLng } from '../../../domain/LatLng';
import { useAiracData } from '../useAiracData';
import type { MapBounds } from './DisplayedContent';
import { preventDefault } from './preventDefault';
import { StyledAerodromeLogo } from './StyledAerodromeLogo';

export const Aerodromes = ({
    onClick,
    mapBounds,
}: {
    onClick: (event: MouseEvent, aerodrome: Aerodrome) => void;
    mapBounds: MapBounds;
}) => {
    const { airacData } = useAiracData();
    const leafletMap = useMap();
    const displayAerodromesLabels = leafletMap.getZoom() > 8;
    return (
        <>
            {mapBounds &&
                airacData.getAerodromesInBbox(...mapBounds).map((aerodrome) => {
                    const { latLng, icaoCode, magneticVariation, runways, status } = aerodrome;
                    const {
                        mainRunway: { magneticOrientation },
                    } = runways;
                    const hasPavedRunway = runways.runways.some((r) => r.surface === 'asphalt');
                    const l = toLatLng(latLng);

                    return (
                        <Fragment key={`ad-${icaoCode}`}>
                            <SVGOverlay
                                key={`aerodrome-${icaoCode}`}
                                interactive={true}
                                bounds={[
                                    // Note: this is pure guess.
                                    [l.lat + 0.02, l.lng - 0.02],
                                    [l.lat - 0.02, l.lng + 0.02],
                                ]}
                                attributes={{ class: 'overflow-visible' }}
                                eventHandlers={{
                                    click: (e) => {
                                        preventDefault(e);
                                        onClick(e.originalEvent, aerodrome);
                                    },
                                }}
                            >
                                {
                                    <StyledAerodromeLogo
                                        title={`${icaoCode}`}
                                        $military={status === 'MIL'}
                                        $pavedRunway={hasPavedRunway}
                                        $magneticVariation={magneticVariation}
                                        $magneticOrientation={magneticOrientation}
                                        $closed={status === 'OFF'}
                                    />
                                }
                                {displayAerodromesLabels && (
                                    <Polygon
                                        fill={false}
                                        fillOpacity={0}
                                        opacity={0}
                                        positions={[[l.lat - 0.015, l.lng]]}
                                    >
                                        <StyledTooltip
                                            key={`tooltip-wpt-${icaoCode}-${aerodrome.mapShortName}`}
                                            permanent
                                            direction={'bottom'}
                                        >
                                            <AdDescription style={{ color: getColor(status) }}>
                                                <AdIcaoCode>{aerodrome.icaoCode}</AdIcaoCode>
                                                <div>{aerodrome.mapShortName}</div>
                                            </AdDescription>
                                        </StyledTooltip>
                                    </Polygon>
                                )}
                            </SVGOverlay>
                        </Fragment>
                    );
                })}
        </>
    );
};

const AdDescription = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;
const AdIcaoCode = styled.div`
    font-family: 'Univers Next 630';
    font-weight: bold;
    font-size: 0.8em;
`;

const getColor = (status: Aerodrome['status']) => {
    switch (status) {
        case 'OFF':
            return '#242424ff';
        case 'MIL':
            return '#ba2020';
        default:
            return '#002e94ff';
    }
};

const StyledTooltip = styled(Tooltip)`
    line-height: 90%;
    background-color: transparent;
    box-shadow: unset;
    background-color: none;
    border: none;
    border-radius: none;
    text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;
    white-space: nowrap;
    font-weight: bold;
    font-size: 1.2em;
    text-align: left;
    margin: 0px;
    padding-top: 0px;
    font-family: 'Univers';

    ::before {
        display: none;
    }
`;
