import type { ICloud, Visibility } from 'metar-taf-parser';
import { CloudQuantity, DistanceUnit, parseMetar } from 'metar-taf-parser';
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
import { Z_INDEX_AD_NAMES } from './zIndex';

type WeatherInfo = {
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
    const leafletMap = useMap();
    const displayAerodromesLabels = leafletMap.getZoom() > 8;
    const { highlightedFixture } = useFixtureFocus();
    const { loading: weatherLoading, metarsByIcaoCode } = useWeather();

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

const getWeatherInfoFromMetar = (metarString: string): Omit<WeatherInfo, 'display'> => {
    const metar = parseMetar(metarString);
    const { visibility, clouds, verticalVisibility } = metar;
    const flightCategory = getFlightCategory(visibility, clouds, verticalVisibility);
    return {
        metar: flightCategory === 'VFR' ? 'good' : flightCategory === 'MVFR' ? 'medium' : 'bad',
        taf: 'unknown',
    };
};

export function getFlightCategory(
    visibility: Visibility | undefined,
    clouds: ICloud[],
    verticalVisibility?: number,
): FlightCategory {
    const convertedVisibility = convertToMiles(visibility);
    const distance = convertedVisibility != null ? convertedVisibility : Infinity;
    const height = determineCeilingFromClouds(clouds)?.height ?? verticalVisibility ?? Infinity;

    let flightCategory = FlightCategory.VFR;

    if (height <= 3000 || distance <= 5) flightCategory = FlightCategory.MVFR;
    if (height <= 1000 || distance <= 3) flightCategory = FlightCategory.IFR;
    if (height <= 500 || distance <= 1) flightCategory = FlightCategory.LIFR;

    return flightCategory;
}

/**
 * Finds the ceiling. If no ceiling exists, returns the lowest cloud layer.
 */
export function determineCeilingFromClouds(clouds: ICloud[]): ICloud | undefined {
    let ceiling: ICloud | undefined;

    clouds.forEach((cloud) => {
        if (
            cloud.height != null &&
            cloud.height < (ceiling?.height || Infinity) &&
            (cloud.quantity === CloudQuantity.OVC || cloud.quantity === CloudQuantity.BKN)
        )
            ceiling = cloud;
    });

    return ceiling;
}

function convertToMiles(visibility?: Visibility): number | undefined {
    if (!visibility) return;

    switch (visibility.unit) {
        case DistanceUnit.StatuteMiles:
            return visibility.value;
        case DistanceUnit.Meters:
            const distance = visibility.value * 0.000621371;

            if (visibility.value % 1000 === 0 || visibility.value === 9999)
                return Math.round(distance);

            return +distance.toFixed(2);
    }
}

export enum FlightCategory {
    VFR = 'VFR',
    MVFR = 'MVFR',
    IFR = 'IFR',
    LIFR = 'LIFR',
}

export function getFlightCategoryCssColor(category: FlightCategory): string {
    switch (category) {
        case FlightCategory.LIFR:
            return `rgb(255, 0, 255)`;
        case FlightCategory.IFR:
            return `rgb(255, 0, 0)`;
        case FlightCategory.MVFR:
            return `rgb(0, 150, 255)`;
        case FlightCategory.VFR:
            return `rgb(0, 150, 0)`;
    }
}
