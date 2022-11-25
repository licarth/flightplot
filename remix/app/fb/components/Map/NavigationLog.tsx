import { pipe } from 'fp-ts/lib/function';
import * as Option from 'fp-ts/lib/Option';
import styled, { css } from 'styled-components';
import type { Aerodrome, VhfFrequencyWithRemarks } from 'ts-aerodata-france';
import type { Route } from '../../../domain';
import { AerodromeWaypoint } from '../../../domain';
import { useWeather } from '../WeatherContext';
import { joinReactElements } from './joinReactElements';

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
                <LegHeader>Alti.</LegHeader>
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
                ({ arrivalWaypoint: waypoint, trueHdg, distanceInNm, durationInMinutes }, i) => (
                    <NavRow key={`navlog-row-${i}`}>
                        <LegCell>
                            {altitudeInfo(
                                route.inferredAltitudes[i],
                                route.inferredAltitudes[i + 1],
                            )}
                        </LegCell>
                        <LegCell>
                            <TextValue>
                                {formatHeading(trueHdg)}
                                <Unit> °T</Unit>
                            </TextValue>
                        </LegCell>
                        <LegCell>
                            <TextValue>
                                {Math.round(distanceInNm)} <Unit>nm</Unit>
                            </TextValue>
                        </LegCell>
                        <LegCell>
                            <TextValue>
                                {Math.round(durationInMinutes)} <Unit>min</Unit>
                            </TextValue>
                        </LegCell>
                        {paperVersion && (
                            <>
                                <EmptyUserCell />
                                <EmptyUserCell />
                            </>
                        )}
                        <WaypointCell>
                            <TextValue>{waypoint.name}</TextValue>
                            {i !== route.length - 1 && waypoint instanceof AerodromeWaypoint && (
                                <WaypointFrequencies aerodrome={waypoint.aerodrome} />
                            )}
                        </WaypointCell>
                    </NavRow>
                ),
            )}
            <TotalNavRow>
                <TotalBlackCell />
                <TotalBlackCell />
                <TotalLegCell>
                    <TextValue>
                        {Math.round(route.totalDistance)}
                        <Unit> nm</Unit>
                    </TextValue>
                </TotalLegCell>
                <TotalLegCell>
                    <TextValue>
                        {Math.round(route.totalDurationInMinutes)}
                        <Unit> min</Unit>
                    </TextValue>
                </TotalLegCell>
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

const WaypointFrequencies = ({ aerodrome }: { aerodrome: Aerodrome }) => {
    const { autoinfo, tower, afis } = aerodrome.frequencies;
    return (
        <SmallFrequencyInfo>
            {tower.length > 0 && <FrequencyLine type="TWR" frequencies={tower} />}
            {afis.length > 0 && <FrequencyLine type="AFIS" frequencies={afis} />}
            {autoinfo.length > 0 && <FrequencyLine type="A/A" frequencies={autoinfo} />}
        </SmallFrequencyInfo>
    );
};

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
                    <Vertical>
                        {aerodrome.runways.runways.map(({ name, lengthInMeters, surface }, i) => (
                            <Horizontal key={`runways-${aerodrome.icaoCode}-${i}`}>
                                <FrequencyTypeBadge $active type={name} />
                                <TextValue>{`${lengthInMeters}m - ${surface}`}</TextValue>
                            </Horizontal>
                        ))}
                    </Vertical>
                </AerodromeInfoCell>
                <FrequenciesCell>
                    <FrequencyLine type="TWR" frequencies={aerodrome.frequencies.tower} />
                    <FrequencyLine type="GND" frequencies={aerodrome.frequencies.ground} />
                    <FrequencyLine type="AFIS" frequencies={aerodrome.frequencies.afis} />
                    <FrequencyLine type="ATIS" frequencies={aerodrome.frequencies.atis} />
                    <FrequencyLine type="A/A" frequencies={aerodrome.frequencies.autoinfo} />
                    <MetarLine>{metarString || null}</MetarLine>
                </FrequenciesCell>
            </AirportRow>
        </AirportTable>
    );
};

const SmallFrequencyInfo = styled.div`
    font-size: 1em;
    margin-left: 0.2em;
    position: absolute;
    bottom: 0;
    left: 0;
`;

const altitudeInfo = (from: number, to: number) => {
    if (from < to) {
        return (
            <Vertical>
                <TextValue>
                    {`${to} `}
                    <Unit>ft.</Unit>
                </TextValue>
                <TextValue>{`↗`}</TextValue>
            </Vertical>
        );
    } else if (from > to) {
        return (
            <Vertical>
                <TextValue>{`↘`}</TextValue>
                <TextValue>
                    {`${to} `}
                    <Unit>ft.</Unit>
                </TextValue>
            </Vertical>
        );
    } else
        return (
            <TextValue>
                {`${from} `}
                <Unit>ft.</Unit>
            </TextValue>
        );
};

const FrequencyAndRemarks = ({
    frequencies,
    remarks = true,
}: {
    frequencies: readonly VhfFrequencyWithRemarks[];
    remarks?: boolean;
}) => (
    <>
        {joinReactElements(
            ' - ',
            frequencies.map(({ frequency, remarks }) => (
                <>
                    <FrequencyNumber>{`${frequency}`}</FrequencyNumber>
                    {remarks &&
                        pipe(
                            remarks,
                            Option.fold(
                                () => null,
                                (remarks) => <FrequencyDescription>{remarks}</FrequencyDescription>,
                            ),
                        )}
                </>
            )),
        )}
    </>
);

const FrequencyDescription = styled.span`
    font-family: monospace;
    margin-left: 1rem;
`;

const FrequencyLine = ({
    type,
    frequencies,
}: {
    type: string;
    frequencies: Aerodrome['frequencies']['afis'];
}) => (
    <FrequencyLineContainer>
        <FrequencyTypeBadge $active={frequencies.length > 0} type={type} />{' '}
        <FrequencyAndRemarks frequencies={frequencies} />
    </FrequencyLineContainer>
);

const FrequencyLineContainer = styled.div`
    display: flex;
    align-items: center;
`;

const FrequencyTypeBadge = ({ type, $active }: { type: string; $active: boolean }) => (
    <FrequencyTypeBadgeContainer $active={$active}>
        <FrequencyType>{type}</FrequencyType>
    </FrequencyTypeBadgeContainer>
);

const FrequencyTypeBadgeContainer = styled.div<{ $active: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 1em;
    padding: 0 0.2em;
    margin-right: 0.2em;

    ${({ $active }) =>
        $active
            ? `
    color: white;
    background-color: black;
    border-radius: 5px;
    `
            : `
    text-decoration: line-through;
    `}
`;

const FrequencyType = styled.span`
    // Total height should fit font
    /* height: 1em; */
    // center text vertically and remove padding
    /* line-height: 0.8em; */
    /* padding: 0; */
    font-size: 80%;

    /* padding: 1px 5px;
    font-size: 80%;
    align-self: center; */
`;

const FrequencyNumber = styled.span`
    font-family: 'Univers';
`;

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

    /* height: ${({ route }) => (route.length < 1 ? 1 : route.legs.length * 2 + 3)}cm; */
`;

const Row = styled.div`
    display: flex;
    justify-content: stretch;

    > :last-child {
        border-right: solid;
    }
`;

const NavRow = styled(Row)`
    display: flex;
    height: 2cm;
`;

const TotalNavRow = styled(NavRow)`
    margin-top: -1cm;
    height: 1cm;
`;

const AirportRow = styled(Row)`
    min-height: 4cm;
    display: flex;
    align-content: stretch;
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
    /* box-sizing: border-box; */
    background-color: white;
    border-color: black;
    white-space: no-wrap;
    overflow: hidden;
    flex: ${() => REF_RELATIVE_WIDTH} 0;

    font-family: 'Univers';

    padding: 3px;

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

const totalCellCss = css`
    height: 1cm;
`;

const CenteredContentCell = styled(Cell)`
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
`;

const AerodromeInfoCell = styled(Cell)`
    font-family: 'Univers';
`;

const FrequenciesCell = styled(Cell)``;

const LegCell = styled(CenteredContentCell)`
    transform: translateY(-1cm);
    // preserve white spaces
    white-space: pre-wrap;
`;

const TotalLegCell = styled(CenteredContentCell)`
    ${totalCellCss}
    line-height: 100%;
`;

const WaypointCell = styled(CenteredContentCell)`
    ${waypointColumnCss}
    z-index: 1;
    page-break-inside: avoid;
    position: relative;
`;

const BlackCell = styled(CenteredContentCell)`
    ${blackCellCss}
    z-index: -10;
`;

const TotalBlackCell = styled(BlackCell)`
    ${totalCellCss}
`;

const TotalUserBlackCell = styled(CenteredContentCell)`
    ${userColumnCss}
    ${blackCellCss}
    background-color: black;
    z-index: -10;
    ${totalCellCss}
`;

const TotalWaypointBlackCell = styled(CenteredContentCell)`
    ${waypointColumnCss}
    ${blackCellCss}
    ${totalCellCss}
    z-index: -10;
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
    font-size: 1.3em;
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

const MetarLine = styled.div`
    font-family: monospace;
`;

const Unit = styled.span`
    font-size: 80%;
`;

const TextValue = styled.span`
    white-space: pre-wrap;
`;

const Vertical = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const Horizontal = styled.div`
    display: flex;
    align-items: center;
`;
