import { Button } from 'antd';
import formatcoords from 'formatcoords';
import styled from 'styled-components';
import type { Aerodrome, VfrPoint, Vor } from 'ts-aerodata-france';
import type { LatLng } from '~/domain';
import { latLngWaypointFactory, toLeafletLatLng } from '~/domain';
import { Target } from '~/generated/icons';
import VfrPointLogo from '~/generated/icons/VfrPoint';
import { useHelpPage } from '../HelpPageContext';
import { StyledAerodromeLogo } from '../StyledAerodromeLogo';
import { StyledVor } from '../StyledVor';
import { useRoute } from '../useRoute';
import { addFixtureToRoute } from './addFixtureToRoute';
import { Colors } from './Colors';
import type { FocusableFixture } from './FixtureFocusContext';
import { useFixtureFocus } from './FixtureFocusContext';

type UseFixtureContextProps = ReturnType<typeof useFixtureFocus>;

type FixtureDetailsProps = {
    fixtures: UseFixtureContextProps['fixtures'];
    clickedLocation: UseFixtureContextProps['clickedLocation'];
    onClose: () => void;
};

export const FixtureDetails = ({ fixtures, clickedLocation, onClose }: FixtureDetailsProps) => {
    const { highlightedFixture } = useFixtureFocus();
    // const routeContext = useRoute();
    const content = fixtures.map((fixture, i) => {
        return <FixtureRow key={`fixture-${i}`} fixture={fixture} />;
    });

    const { isOpen: isHelpOpen } = useHelpPage();

    return (
        <FixtureDetailsContainer isHelpOpen={isHelpOpen}>
            {highlightedFixture ? (
                <FixtureRow fixture={highlightedFixture} />
            ) : (
                <>
                    <CloseButton onClick={onClose} />
                    {clickedLocation && (
                        <Row key={`fixture-selected-point`}>
                            <TargetCard latLng={toLeafletLatLng(clickedLocation)} />
                        </Row>
                    )}
                    <ContentList>{content}</ContentList>
                </>
            )}
        </FixtureDetailsContainer>
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

    const { aerodromeAltitude, icaoCode, name } = aerodrome;
    return (
        <>
            <Description>
                <LogoContainer>
                    <StyledAerodromeLogo aerodrome={aerodrome} />
                </LogoContainer>
                <div>
                    {icaoCode} - {name} ({aerodromeAltitude} ft)
                </div>
            </Description>
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

const CloseButton = styled.div`
    position: absolute;
    :after {
        content: '×';
    }
    top: 2px;
    right: 8px;
    font-size: 1.5rem;
    cursor: pointer;
`;

const FixtureDetailsContainer = styled.div<{ isHelpOpen: boolean }>`
    transition: all 0.3s;
    padding: 1rem;
    padding-top: 2rem;
    padding-right: 0.5rem;
    right: ${({ isHelpOpen }) => (isHelpOpen ? 620 : 90)}px;
    top: 10px;
    width: 350px;
    max-width: 500px;
    max-height: 40vh;
    position: absolute;
    z-index: 600;
    background-color: white;
    filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    font-family: 'Futura';
    color: ${Colors.ctrBorderBlue};

    @media (hover: none) {
        max-width: 80vw;
    }
`;

const Frequency = styled.span`
    font-family: 'Folio XBd BT';
    font-weight: bold;
`;

const replaceHashWithLineBreak = (txt: string) => txt.replace(/#/g, '\n');
