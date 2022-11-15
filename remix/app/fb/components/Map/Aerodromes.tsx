import { destination, point } from '@turf/turf';
import { differenceInMinutes } from 'date-fns';
import { pipe } from 'fp-ts/lib/function';
import { divIcon } from 'leaflet';
import { Fragment, memo, useEffect, useMemo, useState } from 'react';
import { Marker, Pane, Polygon, SVGOverlay, Tooltip, useMap } from 'react-leaflet';
import styled from 'styled-components';
import type { Aerodrome } from 'ts-aerodata-france';
import { fromtTurfPoint, toCheapRulerPoint, toLatLng } from '~/domain';
import { MetarTaf } from '~/generated/icons';
import { StyledAerodromeLogo } from '../StyledAerodromeLogo';
import { useAiracData } from '../useAiracData';
import { useWeather } from '../WeatherContext';
import { boxAround, boxAroundP } from './boxAround';
import type { MapBounds } from './DisplayedContent';
import { useFixtureFocus } from './FixtureFocusContext';
import { getWeatherInfoFromMetar } from './getWeatherInfoFromMetar';
import { Z_INDEX_AD_NAMES, Z_INDEX_MOUSE_TOOLTIP } from './zIndex';

export type WeatherInfo = {
    metarDate: Date;
    tafDate: Date;
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
        ${({ $weatherInfo: { taf } }) => taf === 'unknown' && 'display: none'}
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
            {weatherInfo && <MetarTafC aerodrome={aerodrome} weatherInfo={weatherInfo} />}
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
                                key={`tooltip-wpt-${aerodrome.icaoCode}-${
                                    aerodrome.mapShortName
                                }-${!!weatherInfo}`}
                                permanent
                                direction={'bottom'}
                                $makeSpaceForWeatherInfo={!!weatherInfo}
                            >
                                <AdDescription style={{ color: getColor(aerodrome.status) }}>
                                    <AdIcaoCode>{`${aerodrome.icaoCode}`}</AdIcaoCode>
                                    <AdShortName>{aerodrome.mapShortName}</AdShortName>
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
                    const metar = metarsByIcaoCode[`${icaoCode}`];

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
                                    !weatherLoading && metar
                                        ? {
                                              ...getWeatherInfoFromMetar(metar),
                                              display: !mapZoom || mapZoom <= 9 ? 'big' : 'small',
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
    border-radius: 3px;
`;

const AdIcaoCode = styled.div`
    font-family: 'Univers Next 630';
    font-weight: bold;
    font-size: 0.8em;
`;

const AdShortName = styled.div`
    border-radius: 3px;
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

const StyledTooltip = styled(Tooltip)<{ $makeSpaceForWeatherInfo: boolean }>`
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
    ${({ $makeSpaceForWeatherInfo }) => $makeSpaceForWeatherInfo && 'margin-top: 13px;'}
    padding-top: 0px;
    font-family: 'Univers';

    ::before {
        display: none;
    }
`;

const MetarTafC = ({
    weatherInfo,
    aerodrome: { icaoCode, latLng },
}: {
    weatherInfo: WeatherInfo;
    aerodrome: Aerodrome;
}) => {
    const l = toLatLng(latLng);

    const UPDATE_INTERVAL_MS = 5000; // 5 seconds

    const [elapsedMinutes, setElapsedMinutes] = useState<number>();

    useEffect(() => {
        const updateLabels = () => {
            console.log('Logs every minute');
            setElapsedMinutes(differenceInMinutes(new Date(), weatherInfo.metarDate));
        };
        updateLabels();
        const interval = setInterval(updateLabels, UPDATE_INTERVAL_MS);

        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, []);

    const metarInfoCenter = pipe(
        destination(point([l.lng, l.lat]), 3000, 340, {
            units: 'meters',
        }).geometry.coordinates,
        fromtTurfPoint,
    );

    const metarInfoLabelCenter = pipe(
        destination(point([l.lng, l.lat]), 4000, 310, {
            units: 'meters',
        }).geometry.coordinates,
        fromtTurfPoint,
    );

    return (
        <>
            <SVGOverlay
                key={`aerodrome-metartaf-${icaoCode}-${weatherInfo.display}`}
                bounds={
                    weatherInfo.display === 'big'
                        ? boxAround(toCheapRulerPoint(l), 10000)
                        : pipe(metarInfoCenter, toCheapRulerPoint, boxAroundP(3000))
                }
                attributes={{ class: 'overflow-visible' }}
            >
                <MetarTafIcon $weatherInfo={weatherInfo} />
            </SVGOverlay>
            {elapsedMinutes && (
                <Pane name={`metar-info-${icaoCode}`} style={{ zIndex: Z_INDEX_MOUSE_TOOLTIP }}>
                    <Marker position={metarInfoLabelCenter} icon={divIcon({})} opacity={0}>
                        <MetarTooltip
                            $old={elapsedMinutes > 30}
                            direction="left"
                            offset={[0, 0]}
                            opacity={1}
                            permanent
                            className="overflow-visible"
                        >
                            {/* {elapsedMinutes <= 15 ? `• ${elapsedMinutes}m` : 'Old data'} */}
                            {elapsedMinutes > 30 ? `⚠️ ${elapsedMinutes}m` : `• ${elapsedMinutes}m`}
                        </MetarTooltip>
                    </Marker>
                </Pane>
            )}
        </>
    );
};

const MetarTooltip = styled(Tooltip)<{ $old?: boolean }>`
    display: flex;
    gap: 0.5rem;
    background-color: #ececec;
    border: none;
    box-shadow: none;
    border-radius: 30px;
    border: 1px solid #000000;
    ${({ $old }) =>
        $old &&
        `
        background-color: #000000;
        border: 1px dashed #f7f300;
        color: #f7f300;
        
        `}
    line-height: 0.5em;
    ::before {
        display: none;
    }
`;
