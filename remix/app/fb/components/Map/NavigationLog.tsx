import { pipe } from 'fp-ts/lib/function';
import * as Option from 'fp-ts/lib/Option';
import styled, { css } from 'styled-components';
import type { Aerodrome, VhfFrequencyWithRemarks } from 'ts-aerodata-france';
import type { Route } from '../../../domain';
import { AerodromeWaypoint } from '../../../domain';
import { useWeather } from '../WeatherContext';

const REF_RELATIVE_WIDTH = 10;

// Middle lines
const WAYPOINT_COLUMN_RELATIVE_WIDTH = 50;
const USER_COLUMNS_RELATIVE_WIDTH = 15;

// Header and footer
const TOP_BOTTOM_FREQUENCIES_COLUMN_RELATIVE_WIDTH = 30;

export const NavigationLog = ({
    route,
    paperVersion = false,
}: {
    route: Route;
    paperVersion?: boolean;
}) => (
    <NavlogContainer paperVersion={paperVersion}>
        {route.departure && AerodromeWaypoint.isAerodromeWaypoint(route.departure) && (
            <AirportDetails aerodrome={route.departure.aerodrome} />
        )}
        <LegTable route={route}>
            <HeaderRow>
                <LegHeader>Altitude</LegHeader>
                <LegHeader>Rm</LegHeader>
                <LegHeader>Dist</LegHeader>
                <LegHeader>TSV</LegHeader>
                {paperVersion && (
                    <>
                        <UserHeader>Act.</UserHeader>
                        <UserHeader>Est.</UserHeader>
                    </>
                )}
                <WaypointHeader>Report</WaypointHeader>
            </HeaderRow>
            {route.legs.length > 0 && (
                <NavRow>
                    <BlackCell />
                    <BlackCell />
                    <BlackCell />
                    <BlackCell />
                    {paperVersion && (
                        <>
                            <EmptyUserCell />
                            <BlackUserCell />
                        </>
                    )}
                    <WaypointCell>{route.legs[0].departureWaypoint.name}</WaypointCell>
                </NavRow>
            )}
            {route.legs.map(
                ({ arrivalWaypoint: { name }, trueHdg, distanceInNm, durationInMinutes }, i) => (
                    <NavRow key={`navlog-row-${i}`}>
                        <LegCell>
                            {altitudeInfo(
                                route.inferredAltitudes[i],
                                route.inferredAltitudes[i + 1],
                            )}
                        </LegCell>
                        <LegCell>{formatHeading(trueHdg)}°T</LegCell>
                        <LegCell>{Math.round(distanceInNm)} NM</LegCell>
                        <LegCell>{Math.round(durationInMinutes)} min</LegCell>
                        {paperVersion && (
                            <>
                                <EmptyUserCell />
                                <EmptyUserCell />
                            </>
                        )}
                        <WaypointCell>{name}</WaypointCell>
                    </NavRow>
                ),
            )}
            <TotalNavRow>
                <TotalBlackCell />
                <TotalBlackCell />
                <TotalLegCell>{Math.round(route.totalDistance)} NM</TotalLegCell>
                <TotalLegCell>{Math.round(route.totalDurationInMinutes)} min</TotalLegCell>
                <TotalUserBlackCell />
                <TotalUserBlackCell />
                <TotalWaypointBlackCell />
            </TotalNavRow>
        </LegTable>
        {route.arrival && AerodromeWaypoint.isAerodromeWaypoint(route.arrival) && (
            <AirportDetails aerodrome={route.arrival.aerodrome} />
        )}
    </NavlogContainer>
);

const AirportDetails = function ({ aerodrome }: { aerodrome: Aerodrome }) {
    const { metarsByIcaoCode } = useWeather();
    const metarString = metarsByIcaoCode[`${aerodrome.icaoCode}`]?.metarString;

    return (
        <AirportTable>
            <AirportRow>
                <AerodromeInfoCell>
                    <div>{aerodrome.name}</div>
                    <div>{`${aerodrome.icaoCode}`}</div>
                    <div>{`${aerodrome.aerodromeAltitude}`} ft.</div>
                    <div>
                        {aerodrome.runways.runways
                            .map(
                                ({ name, lengthInMeters, surface }) =>
                                    `${name}(${lengthInMeters}m - ${surface})`,
                            )
                            .join(', ')}
                    </div>
                </AerodromeInfoCell>
                <FrequenciesCell>
                    <div>
                        <b>TWR</b> {formatFrequencyTable(aerodrome.frequencies.tower)}
                    </div>
                    <div>
                        <b>GND</b> {formatFrequencyTable(aerodrome.frequencies.ground)}
                    </div>
                    <div>
                        <b>AFIS</b> {formatFrequencyTable(aerodrome.frequencies.afis)}
                    </div>
                    <div>
                        <b>ATIS</b> {formatFrequencyTable(aerodrome.frequencies.atis)}
                    </div>
                    <div>
                        <b>A/A</b> {formatFrequencyTable(aerodrome.frequencies.autoinfo)}
                    </div>
                    <MetarLine>{metarString || null}</MetarLine>
                </FrequenciesCell>
            </AirportRow>
        </AirportTable>
    );
};

const altitudeInfo = (from: number, to: number) => {
    if (from < to) {
        return `↗ ${to} ft.`;
    } else if (from > to) {
        return `↘ ${to} ft.`;
    } else return `${from} ft.`;
};

const formatFrequencyTable = (frequencies: readonly VhfFrequencyWithRemarks[]) =>
    frequencies
        .map(
            ({ frequency, remarks }) =>
                `${frequency}${pipe(
                    remarks,
                    Option.fold(
                        () => ``,
                        (remarks) => `(${remarks})`,
                    ),
                )}`,
        )
        .join(', ');

const AirportTable = styled.div`
    display: flex;
    flex-direction: column;
    page-break-inside: avoid;
    background-color: black;

    :last-child {
        border-bottom: solid;
    }
`;

const LegTable = styled.div<{
    route: Route;
}>`
    display: flex;
    flex-direction: column;
    @media print {
        border-width: 0.6mm;
    }
    background-color: black;

    :last-child {
        border-bottom: solid;
    }

    height: ${({ route }) => (route.length < 1 ? 1 : route.legs.length * 2 + 3)}cm;
`;

const Row = styled.div`
    display: flex;
    justify-content: stretch;
    width: 100%;

    > :last-child {
        border-right: solid;
    }
`;

const NavRow = styled(Row)`
    display: flex;
    height: 2cm;
`;

const TotalNavRow = styled(NavRow)`
    transform: translateY(-1cm);
    height: 1cm;
`;

const AirportRow = styled(Row)`
    height: 4cm;
`;

const HeaderRow = styled(NavRow)`
    z-index: 100;
    display: flex;
    height: 1cm;
    background-color: grey;
    color: white;
    border-color: black;
    > :last-child {
        border-right: solid;
        border-color: black;
    }
`;

const Cell = styled.span`
    border-top: solid;
    border-left: solid;
    box-sizing: border-box;
    background-color: white;
    border-color: black;
    height: 100%;
    white-space: no-wrap;
    overflow: hidden;
    flex: ${() => REF_RELATIVE_WIDTH} 0;

    @media print {
        border-width: 0.05cm;
    }
`;

const waypointColumnCss = css`
    flex-grow: ${() => WAYPOINT_COLUMN_RELATIVE_WIDTH};
`;

const userColumnCss = css`
    flex-grow: ${() => USER_COLUMNS_RELATIVE_WIDTH};
`;

const blackCellCss = css`
    background-color: black;
`;

const headerCss = css`
    transform: none;
    background-color: grey;
`;

const CenteredContentCell = styled(Cell)`
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
`;

const AerodromeInfoCell = styled(Cell)``;

const FrequenciesCell = styled(Cell)``;

const LegCell = styled(CenteredContentCell)`
    transform: translateY(-1cm);
`;

const TotalLegCell = styled(CenteredContentCell)`
    height: 1cm;
    border-bottom: solid;
`;

const WaypointCell = styled(CenteredContentCell)`
    ${waypointColumnCss}
    z-index: 1;
    page-break-inside: avoid;
`;

const BlackCell = styled(CenteredContentCell)`
    background-color: black;
    z-index: -10;
`;

const TotalBlackCell = styled(BlackCell)`
    height: 1cm;
`;

const TotalUserBlackCell = styled(CenteredContentCell)`
    ${userColumnCss}
    ${blackCellCss}
    background-color: black;
    z-index: -10;
    height: 1cm;
`;

const TotalWaypointBlackCell = styled(CenteredContentCell)`
    ${waypointColumnCss}
    ${blackCellCss}
    z-index: -10;
    height: 1cm;
`;

const BlackUserCell = styled(CenteredContentCell)`
    ${userColumnCss}
    ${blackCellCss}
`;

const EmptyUserCell = styled(CenteredContentCell)`
    ${userColumnCss}
    z-index: 1;
`;

const LegHeader = styled(CenteredContentCell)`
    ${headerCss}
`;

const WaypointHeader = styled(CenteredContentCell)`
    ${waypointColumnCss}
    ${headerCss}
`;

const UserHeader = styled(CenteredContentCell)`
    ${userColumnCss}
    ${headerCss}
`;

const formatHeading = (trueHdg: number) => String(Math.round(trueHdg)).padStart(3, '0');

const NavlogContainer = styled.div<{
    paperVersion: boolean;
}>`
    ${CenteredContentCell} {
    }
    ${FrequenciesCell} {
        flex-grow: ${() => TOP_BOTTOM_FREQUENCIES_COLUMN_RELATIVE_WIDTH};
    }
    @media print {
        page-break-inside: avoid;
        :not(:first-of-type) {
            margin-top: 2cm;
        }
    }
`;

const MetarLine = styled.div``;
