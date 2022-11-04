import { Fragment, memo, useMemo } from 'react';
import { Pane, Polygon, SVGOverlay, Tooltip, useMap } from 'react-leaflet';
import styled from 'styled-components';
import type { Aerodrome } from 'ts-aerodata-france';
import { toLatLng } from '~/domain';
import { StyledAerodromeLogo } from '../StyledAerodromeLogo';
import { useAiracData } from '../useAiracData';
import type { MapBounds } from './DisplayedContent';
import { useFixtureFocus } from './FixtureFocusContext';
import { Z_INDEX_AD_NAMES } from './zIndex';

export const AdPolygon: React.FC<{
    aerodrome: Aerodrome;
    displayAerodromesLabels: boolean;
    shouldBeHighlighted: boolean;
}> = memo(function AdPolygon({ aerodrome, displayAerodromesLabels, shouldBeHighlighted }) {
    const l = toLatLng(aerodrome.latLng);
    return (
        <SVGOverlay
            key={`aerodrome-${aerodrome.icaoCode}`}
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
                    <Pane
                        name={`aerodrome-tooltip-${aerodrome.icaoCode}-${aerodrome.mapShortName}`}
                        style={{ zIndex: Z_INDEX_AD_NAMES }}
                    >
                        <StyledTooltip
                            key={`tooltip-wpt-${aerodrome.icaoCode}-${aerodrome.mapShortName}`}
                            permanent
                            direction={'bottom'}
                        >
                            <AdDescription style={{ color: getColor(aerodrome.status) }}>
                                <AdIcaoCode>{`${aerodrome.icaoCode}`}</AdIcaoCode>
                                <div>{aerodrome.mapShortName}</div>
                            </AdDescription>
                        </StyledTooltip>
                    </Pane>
                </Polygon>
            )}
        </SVGOverlay>
    );
});

export const Aerodromes = ({ mapBounds }: { mapBounds: MapBounds }) => {
    const { airacData, loading } = useAiracData();
    const leafletMap = useMap();
    const displayAerodromesLabels = leafletMap.getZoom() > 8;
    const { highlightedFixture } = useFixtureFocus();

    const highlightedFixtureName = useMemo(() => highlightedFixture?.name, [highlightedFixture]);

    const aerodromesInBbox = useMemo(
        () => airacData?.getAerodromesInBbox(...mapBounds),
        [mapBounds, airacData],
    );

    if (loading) {
        return null;
    }

    return (
        <>
            {mapBounds &&
                !loading &&
                aerodromesInBbox?.map((aerodrome) => {
                    const { icaoCode } = aerodrome;

                    const shouldBeHighlighted = highlightedFixtureName === aerodrome.name;
                    return (
                        <Fragment key={`ad-${icaoCode}`}>
                            <AdPolygon
                                aerodrome={aerodrome}
                                displayAerodromesLabels={displayAerodromesLabels}
                                shouldBeHighlighted={shouldBeHighlighted}
                            />
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
    ${({ $highlighted }) =>
        $highlighted &&
        `
    filter: drop-shadow(3px 5px 1px rgb(0 0 0 / 0.4));
    path {
        // fill in red
        fill: red !important;
        stroke: red !important;
    }
    circle {
        stroke: red !important;
    }
    `}
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
