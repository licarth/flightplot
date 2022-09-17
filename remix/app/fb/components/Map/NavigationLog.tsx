import { pipe } from 'fp-ts/lib/function';
import * as Option from 'fp-ts/lib/Option';
import styled from 'styled-components';
import type { Aerodrome, VhfFrequencyWithRemarks } from 'ts-aerodata-france';
import type { Route } from '../../../domain';
import { AerodromeWaypoint } from '../../../domain';

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
                        <LegHeader>Heure Réelle</LegHeader>
                        <LegHeader>Heure Estimée</LegHeader>
                    </>
                )}
                <LegHeader>Report</LegHeader>
            </HeaderRow>
            {route.legs.length > 0 && (
                <NavRow>
                    <BlackCell></BlackCell>
                    <BlackCell></BlackCell>
                    <BlackCell></BlackCell>
                    <BlackCell></BlackCell>
                    {paperVersion && (
                        <>
                            <WaypointCell></WaypointCell>
                            <BlackCell></BlackCell>{' '}
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
                                <WaypointCell></WaypointCell>
                                <EmptyCell></EmptyCell>
                            </>
                        )}
                        <WaypointCell>{name}</WaypointCell>
                    </NavRow>
                ),
            )}
            <TotalNavRow>
                <TotalBlackCell></TotalBlackCell>
                <TotalBlackCell></TotalBlackCell>
                <TotalLegCell>{Math.round(route.totalDistance)} NM</TotalLegCell>
                <TotalLegCell>{Math.round(route.totalDurationInMinutes)} min</TotalLegCell>
                <TotalBlackCell></TotalBlackCell>
            </TotalNavRow>
        </LegTable>
        {route.arrival && AerodromeWaypoint.isAerodromeWaypoint(route.arrival) && (
            <AirportDetails aerodrome={route.arrival.aerodrome} />
        )}
    </NavlogContainer>
);

const AirportDetails = ({ aerodrome }: { aerodrome: Aerodrome }) => (
    <AirportTable>
        <AirportRow>
            <AerodromeNameCell>
                <div>{aerodrome.name}</div>
                <div>{aerodrome.icaoCode}</div>
                <div>{aerodrome.aerodromeAltitude} ft.</div>
                <div>
                    {aerodrome.runways.runways
                        .map(
                            ({ name, lengthInMeters, surface }) =>
                                `${name}(${lengthInMeters}m - ${surface})`,
                        )
                        .join(', ')}
                </div>
            </AerodromeNameCell>
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
            </FrequenciesCell>
        </AirportRow>
    </AirportTable>
);

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

    > :last-child {
        border-right: solid;
    }
`;

const NavRow = styled(Row)`
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

    @media print {
        border-width: 0.05cm;
    }
`;

const CenteredContentCell = styled(Cell)`
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
`;

const LegTableCell = styled(CenteredContentCell)`
    /* width: ${100 / 7}%; */
`;

const AerodromeNameCell = styled(Cell)`
    width: ${100 / 4}%;
`;

const FrequenciesCell = styled(Cell)`
    width: ${(3 * 100) / 4}%;
`;

const LegCell = styled(LegTableCell)`
    transform: translateY(-1cm);
`;

const TotalLegCell = styled(LegTableCell)`
    height: 1cm;
    border-bottom: solid;
`;

const WaypointCell = styled(LegTableCell)`
    /* @media print {
    border-width: 0.05cm;
  } */
    z-index: 1;
    page-break-inside: avoid;
`;

const BlackCell = styled(LegTableCell)`
    background-color: black;
    z-index: -10;
`;

const TotalBlackCell = styled(BlackCell)`
    height: 1cm;
`;

const EmptyCell = styled(LegTableCell)``;

const LegHeader = styled(LegTableCell)`
    transform: none;
    background-color: grey;
`;

const formatHeading = (trueHdg: number) => String(Math.round(trueHdg)).padStart(3, '0');

const NavlogContainer = styled.div<{
    paperVersion: boolean;
}>`
    ${CenteredContentCell} {
        width: ${({ paperVersion }) => (paperVersion ? 100 / 7 : 100 / 5)}%;
    }
    ${FrequenciesCell} {
        width: ${(3 * 100) / 4}%;
    }
    @media print {
        page-break-inside: avoid;
        :not(:first-of-type) {
            margin-top: 2cm;
        }
    }
`;
