import { Button } from 'antd';
import formatcoords from 'formatcoords';
import styled from 'styled-components';
import type { Aerodrome, VfrPoint, Vor } from 'ts-aerodata-france';
import type { LatLng } from '~/domain';
import { latLngWaypointFactory, toLeafletLatLng } from '~/domain';
import { Target } from '~/generated/icons';
import VfrPointLogo from '~/generated/icons/VfrPoint';
import { StyledAerodromeLogo } from '../StyledAerodromeLogo';
import { StyledVor } from '../StyledVor';
import { useRoute } from '../useRoute';
import { useWeather } from '../WeatherContext';
import { addFixtureToRoute } from './addFixtureToRoute';
import type { FocusableFixture } from './FixtureFocusContext';
import { useFixtureFocus } from './FixtureFocusContext';

type UseFixtureContextProps = ReturnType<typeof useFixtureFocus>;

type FixtureDetailsProps = {
    fixtures: UseFixtureContextProps['fixtures'];
    clickedLocation: UseFixtureContextProps['clickedLocation'];
};

export const FixtureDetails = ({ fixtures, clickedLocation }: FixtureDetailsProps) => {
    const { highlightedFixture } = useFixtureFocus();
    // const routeContext = useRoute();
    const content = fixtures.map((fixture, i) => {
        return <FixtureRow key={`fixture-${i}`} fixture={fixture} />;
    });

    return (
        <>
            {highlightedFixture ? (
                <FixtureRow fixture={highlightedFixture} />
            ) : (
                <>
                    {clickedLocation && (
                        <Row key={`fixture-selected-point`}>
                            <TargetCard latLng={toLeafletLatLng(clickedLocation)} />
                        </Row>
                    )}
                    <ContentList>{content}</ContentList>
                </>
            )}
        </>
    );
};

const FixtureRow = ({ fixture }: { fixture: FocusableFixture }) => {
    return (
        <Row>
            {isVfrPoint(fixture) && <VfrPointCard vfrPoint={fixture} />}
            {isAerodrome(fixture) && <AerodromeCard aerodrome={fixture} />}
            {isVor(fixture) && <VorCard vor={fixture} />}
        </Row>
    );
};

const VfrPointCard = ({ vfrPoint }: { vfrPoint: VfrPoint }) => {
    const routeContext = useRoute();

    const { name, description } = vfrPoint;
    return (
        <>
            <Description>
                <LogoContainer>
                    <VfrPointLogo />
                </LogoContainer>
                <div>
                    <span>
                        {name} {description && ` - ${replaceHashWithLineBreak(description)}`}
                    </span>
                </div>
            </Description>
            <Buttons>
                <Button
                    size="small"
                    type="primary"
                    onClick={() => addFixtureToRoute({ fixture: vfrPoint, routeContext })}
                >
                    +
                </Button>
            </Buttons>
        </>
    );
};
const VorCard = ({ vor }: { vor: Vor }) => {
    const { name, ident } = vor;
    const routeContext = useRoute();
    return (
        <>
            <Description>
                <LogoContainer>
                    <StyledVor $dme={vor.dme} />
                </LogoContainer>
                <div>
                    {ident} - {name}
                </div>
            </Description>
            <Buttons>
                <Button
                    size="small"
                    type="primary"
                    onClick={() => addFixtureToRoute({ fixture: vor, routeContext })}
                >
                    +
                </Button>
            </Buttons>
        </>
    );
};
const AerodromeCard = ({ aerodrome }: { aerodrome: Aerodrome }) => {
    const routeContext = useRoute();

    const { metarsByIcaoCode } = useWeather();

    const aerodromeMetar = metarsByIcaoCode[`${aerodrome.icaoCode}`];

    const { aerodromeAltitude, icaoCode, name } = aerodrome;
    return (
        <>
            <AerodromeDescription>
                <FirstLine>
                    <LogoContainer>
                        <StyledAerodromeLogo aerodrome={aerodrome} />
                    </LogoContainer>
                    <div>
                        {icaoCode} - {name} ({aerodromeAltitude} ft)
                    </div>
                </FirstLine>
                {aerodromeMetar && <Metar>{aerodromeMetar.metarString}</Metar>}
            </AerodromeDescription>
            <Buttons>
                <Button
                    size="small"
                    type="primary"
                    onClick={() => addFixtureToRoute({ fixture: aerodrome, routeContext })}
                >
                    +
                </Button>
            </Buttons>
        </>
    );
};

const TargetCard = ({ latLng }: { latLng: LatLng }) => {
    const routeContext = useRoute();
    return (
        <>
            <Description>
                <LogoContainer>
                    <Target />
                </LogoContainer>
                <div>{formatcoords(latLng.lat, latLng.lng).format({ decimalPlaces: 0 })}</div>
            </Description>
            <Buttons>
                <Button
                    size="small"
                    type="primary"
                    onClick={() => {
                        addFixtureToRoute({
                            fixture: latLngWaypointFactory({ latLng }),
                            routeContext,
                        });
                    }}
                >
                    +
                </Button>
            </Buttons>
            {/* <span>
                {aerodrome.status === 'RST' && 'Usage restreint'}
                {aerodrome.status === 'CAP' && 'Ouvert à la CAP'}
                {aerodrome.status === 'MIL' && 'Terrain Militaire'}
                {aerodrome.status === 'OFF' && 'Terrain Fermé'}
                {aerodrome.status === 'PRV' && 'Terrain Privé'}
            </span> */}
        </>
    );
};

export const isAerodrome = (fixture: any): fixture is Aerodrome => {
    return fixture?.aerodromeAltitude !== undefined;
};
export const isVor = (fixture: any): fixture is Vor => {
    return fixture?.ident !== undefined;
};

export const isVfrPoint = (fixture: any): fixture is VfrPoint => {
    return fixture?.description !== undefined;
};

const Row = styled.div`
    display: flex;
    padding-left: 0.25rem;
    padding-right: 0.25rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    justify-content: space-between;
    border-radius: 5px;
`;

const FirstLine = styled.div`
    display: flex;
`;

const Metar = styled.div`
    display: flex;
    font-weight: 100;
    font-family: 'Courier New', Courier, monospace;
`;

const AerodromeDescription = styled.div`
    display: flex;
    flex-direction: column;
`;

const Description = styled.div`
    display: flex;
`;
const ContentList = styled.div`
    overflow-y: scroll;
`;

const Buttons = styled.div`
    align-self: center;
    display: flex;
    justify-self: flex-end;
    padding-right: 0.5rem;
    /* justify-content: space-between; */
    /* justify-items: stretch; */
`;

const LogoContainer = styled.div`
    align-self: center;
    width: 0.75rem;
    margin-right: 0.5rem;
`;

const replaceHashWithLineBreak = (txt: string) => txt.replace(/#/g, '\n');
