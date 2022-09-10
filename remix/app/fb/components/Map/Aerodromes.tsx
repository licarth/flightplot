import { Fragment } from 'react';
import { Polygon, SVGOverlay, Tooltip, useMap } from 'react-leaflet';
import styled from 'styled-components';
import { Aerodrome } from 'ts-aerodata-france';
import { toLatLng } from '../../LatLng';
import { useAiracData } from '../useAiracData';
import { MapBounds } from './DisplayedContent';
import { preventDefault } from './preventDefault';
import { StyledAerodromeLogo } from './StyledAerodromeLogo';

export const Aerodromes = ({
    onClick,
    mapBounds,
}: {
    onClick: (aerodrome: Aerodrome) => void;
    mapBounds: MapBounds;
}) => {
    const { airacData } = useAiracData();
    const leafletMap = useMap();
    const displayAerodromesLabels = leafletMap.getZoom() > 8;
    return (
        <>
            {mapBounds &&
                airacData.getAerodromesInBbox(...mapBounds).map((aerodrome) => {
                    const { latLng, icaoCode, magneticVariation, runways } = aerodrome;
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
                                    [l.lat + 0.02, l.lng - 0.02],
                                    [l.lat - 0.02, l.lng + 0.02],
                                ]}
                                attributes={{ class: 'map-svg-text-label' }}
                                eventHandlers={{
                                    click: (e) => {
                                        preventDefault(e);
                                        onClick(aerodrome);
                                    },
                                }}
                            >
                                {
                                    <StyledAerodromeLogo
                                        title={`${icaoCode}`}
                                        $military={aerodrome.status === 'MIL'}
                                        $pavedRunway={hasPavedRunway}
                                        $magneticVariation={magneticVariation}
                                        $magneticOrientation={magneticOrientation}
                                    />
                                }
                                {/* <text
                  x="50%"
                  y="120%"
                  style={{ textAnchor: "middle" }}
                  stroke="#002e94"
                >
                  {aerodrome.mapShortName}
                </text> */}
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
                                            {aerodrome.mapShortName}
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

const StyledTooltip = styled(Tooltip)`
    background-color: transparent;
    box-shadow: unset;
    background-color: none;
    border: none;
    border-radius: none;
    color: #002e94;
    text-shadow: -2px 0 white, 0 2px white, 2px 0 white, 0 -2px white;
    white-space: nowrap;
    font-weight: bold;
    text-align: left;
    margin: 0px;
    padding-top: 0px;

    ::before {
        display: none;
    }
`;
