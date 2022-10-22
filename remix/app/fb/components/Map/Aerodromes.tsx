import { Fragment } from 'react';
import { Polygon, SVGOverlay, Tooltip, useMap } from 'react-leaflet';
import styled from 'styled-components';
import type { Aerodrome } from 'ts-aerodata-france';
import { toLatLng } from '../../../domain/LatLng';
import { useAiracData } from '../useAiracData';
import type { MapBounds } from './DisplayedContent';
import { useFixtureFocus } from './FixtureFocusContext';
import { StyledAerodromeLogo } from './StyledAerodromeLogo';

export const Aerodromes = ({ mapBounds }: { mapBounds: MapBounds }) => {
    const { airacData, loading } = useAiracData();
    const leafletMap = useMap();
    const displayAerodromesLabels = leafletMap.getZoom() > 8;
    const { highlightedFixture } = useFixtureFocus();

    return (
        <>
            {mapBounds &&
                !loading &&
                airacData.getAerodromesInBbox(...mapBounds).map((aerodrome) => {
                    const { latLng, icaoCode, status } = aerodrome;
                    const l = toLatLng(latLng);

                    const shouldBeHighlighted = highlightedFixture?.name === aerodrome.name;
                    return (
                        <Fragment key={`ad-${icaoCode}`}>
                            <SVGOverlay
                                key={`aerodrome-${icaoCode}`}
                                bounds={[
                                    // Note: this is pure guess.
                                    [l.lat + 0.02, l.lng - 0.02],
                                    [l.lat - 0.02, l.lng + 0.02],
                                ]}
                                attributes={{ class: 'overflow-visible' }}
                            >
                                {<Logo aerodrome={aerodrome} $highlighted={shouldBeHighlighted} />}
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
                                                <AdIcaoCode>{`${aerodrome.icaoCode}`}</AdIcaoCode>
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

const Logo = styled(StyledAerodromeLogo)<{ $highlighted: boolean }>`
    ${({ $highlighted }) => $highlighted && `filter: drop-shadow(3px 5px 1px rgb(0 0 0 / 0.4));`}
`;

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
