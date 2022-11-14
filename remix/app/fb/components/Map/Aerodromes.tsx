import { Fragment, memo, useMemo } from 'react';
import { Pane, Polygon, SVGOverlay, Tooltip, useMap } from 'react-leaflet';
import styled from 'styled-components';
import type { Aerodrome } from 'ts-aerodata-france';
import { toCheapRulerPoint, toLatLng } from '~/domain';
import { MetarTaf } from '~/generated/icons';
import { StyledAerodromeLogo } from '../StyledAerodromeLogo';
import { useAiracData } from '../useAiracData';
import { useWeather } from '../WeatherContext';
import { boxAround } from './boxAround';
import type { MapBounds } from './DisplayedContent';
import { useFixtureFocus } from './FixtureFocusContext';
import { getWeatherInfoFromMetar } from './getWeatherInfoFromMetar';
import { Z_INDEX_AD_NAMES } from './zIndex';

export type WeatherInfo = {
    metar: 'good' | 'medium' | 'bad' | 'unknown';
    taf: 'good' | 'medium' | 'bad' | 'unknown';
    display: 'big' | 'small';
};

const MetarTafIcon = styled(MetarTaf)<{ $weatherInfo: WeatherInfo }>`
    #metar {
        fill: ${({ $weatherInfo }) => {
            if ($weatherInfo.metar === 'good') return '#00ff00';
            if ($weatherInfo.metar === 'medium') return '#ffff00';
            if ($weatherInfo.metar === 'bad') return '#ff0000';
            return 'none';
        }} !important;
    }
    #taf {
        fill: ${({ $weatherInfo: { taf } }) => {
            if (taf === 'good') return '#00ff00';
            if (taf === 'medium') return '#ffff00';
            if (taf === 'bad') return '#ff0000';
            return '#ff0000';
        }} !important;
    }
`;

export const AdPolygon: React.FC<{
    aerodrome: Aerodrome;
    displayAerodromesLabels: boolean;
    shouldBeHighlighted: boolean;
    weatherInfo?: WeatherInfo;
}> = memo(function AdPolygon({
    aerodrome,
    displayAerodromesLabels,
    shouldBeHighlighted,
    weatherInfo,
}) {
    const l = toLatLng(aerodrome.latLng);
    return (
        <>
            {weatherInfo && (
                <SVGOverlay
                    key={`aerodrome-metartaf-${aerodrome.icaoCode}`}
                    bounds={
                        weatherInfo.display === 'big'
                            ? boxAround(toCheapRulerPoint(l), 10000)
                            : boxAround(toCheapRulerPoint(l), 1000)
                    }
                    attributes={{ class: 'overflow-visible' }}
                >
                    {<MetarTafIcon $weatherInfo={weatherInfo} />}
                </SVGOverlay>
            )}
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
        </>
    );
});

export const Aerodromes = ({
    mapBounds,
    mapZoom,
}: {
    mapBounds: MapBounds;
    mapZoom: number | undefined;
}) => {
    const { airacData, loading } = useAiracData();
    const { highlightedFixture } = useFixtureFocus();

    const highlightedFixtureName = useMemo(() => highlightedFixture?.name, [highlightedFixture]);

    const aerodromesInBbox = useMemo(
        () => airacData?.getAerodromesInBbox(...mapBounds),
        [mapBounds, airacData],
    );

    if (loading) {
        return null;
    }

    const props = { mapBounds, mapZoom, highlightedFixtureName, aerodromesInBbox };

    return <>{loading || <AerodromesC {...props} />}</>;
};

const AerodromesC = memo(function AerodromesC({
    mapBounds,
    mapZoom,
    highlightedFixtureName,
    aerodromesInBbox,
}: {
    mapBounds: MapBounds;
    mapZoom: number | undefined;
    highlightedFixtureName?: string;
    aerodromesInBbox?: Aerodrome[];
}) {
    const leafletMap = useMap();
    const displayAllAerodromesLabels = leafletMap.getZoom() >= 9;
    const { loading: weatherLoading, metarsByIcaoCode } = useWeather();
    return (
        <>
            {mapBounds &&
                aerodromesInBbox?.map((aerodrome) => {
                    const { icaoCode } = aerodrome;

                    const shouldBeHighlighted = highlightedFixtureName === aerodrome.name;
                    return (
                        <Fragment key={`ad-${icaoCode}`}>
                            <AdPolygon
                                aerodrome={aerodrome}
                                displayAerodromesLabels={
                                    displayAllAerodromesLabels ||
                                    (aerodrome.status === 'CAP' &&
                                        (aerodrome.runways.mainRunway?.lengthInMeters > 2500 ||
                                            (leafletMap.getZoom() >= 7 &&
                                                aerodrome.runways.mainRunway?.lengthInMeters >
                                                    2000) ||
                                            (leafletMap.getZoom() >= 8 &&
                                                aerodrome.runways.mainRunway?.lengthInMeters >
                                                    1000)))
                                }
                                shouldBeHighlighted={shouldBeHighlighted}
                                weatherInfo={
                                    !weatherLoading && metarsByIcaoCode[`${icaoCode}`]
                                        ? {
                                              ...getWeatherInfoFromMetar(
                                                  metarsByIcaoCode[`${icaoCode}`],
                                              ),
                                              display: !mapZoom || mapZoom < 9 ? 'big' : 'big',
                                          }
                                        : undefined
                                }
                            />
                        </Fragment>
                    );
                })}
        </>
    );
});

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
