import { Button, Space } from 'antd';
import styled from 'styled-components';
import type { Aerodrome, VfrPoint } from 'ts-aerodata-france';
import { useRoute } from '../useRoute';
import { addFixtureToRoute } from './addFixtureToRoute';
import { Colors } from './Colors';
import type { FocusableFixture } from './FixtureFocusContext';
import { StyledAerodromeLogo } from './StyledAerodromeLogo';

type FixtureDetailsProps = {
    fixture: FocusableFixture;
    onClose: () => void;
};

export const FixtureDetails = ({ fixture, onClose }: FixtureDetailsProps) => {
    const routeContext = useRoute();
    let content: React.ReactNode = <></>;
    if (fixture && isAerodrome(fixture)) {
        const frequency = fixture.frequencies.atis[0]?.frequency;
        content = (
            <Description>
                <Inline>
                    <AerodromeLogoContainer>
                        <StyledAerodromeLogo aerodrome={fixture} />
                    </AerodromeLogoContainer>{' '}
                    {fixture.name} ({fixture.aerodromeAltitude} ft)
                </Inline>

                <span>
                    {fixture.status === 'RST' && 'Usage restreint'}
                    {fixture.status === 'CAP' && 'Ouvert à la CAP'}
                    {fixture.status === 'MIL' && 'Terrain Militaire'}
                    {fixture.status === 'OFF' && 'Terrain Fermé'}
                    {fixture.status === 'PRV' && 'Terrain Privé'}
                </span>
                <span>
                    <Frequency>
                        <span
                            style={{
                                textDecoration: frequency ? undefined : 'line-through',
                            }}
                        >
                            ATIS
                        </span>
                        {` ${frequency ? frequency : ''}`}
                    </Frequency>
                </span>
                <Space />
            </Description>
        );
    } else if (isVfrPoint(fixture)) {
        content = (
            <Description>
                <span>{fixture.name}</span>
                <span>{`${fixture.description}`}</span>
            </Description>
        );
    }

    return (
        <FixtureDetailsContainer>
            <CloseButton onClick={onClose} />
            {content}
            {isAerodrome(fixture) && !['MIL', 'OFF', 'PRV'].includes(fixture.status) && (
                <Button
                    onClick={() => {
                        window.open(
                            `https://us-central1-outintown-eu.cloudfunctions.net/vacpdf?q=${fixture.icaoCode}`,
                        );
                    }}
                >
                    Carte VAC
                </Button>
            )}
            <Button
                onClick={() => {
                    addFixtureToRoute({ fixture, routeContext });
                    onClose();
                }}
            >
                Ajouter
            </Button>
        </FixtureDetailsContainer>
    );
};

export const isAerodrome = (fixture: any): fixture is Aerodrome => {
    return fixture?.aerodromeAltitude !== undefined;
};

export const isVfrPoint = (fixture: any): fixture is VfrPoint => {
    return fixture?.description !== undefined;
};

const Description = styled.div`
    display: flex;
    flex-direction: column;
`;
const Inline = styled.div`
    display: flex;
`;

const AerodromeLogoContainer = styled.div`
    width: 0.75rem;
    height: 0.75rem;
    margin-right: 0.25rem;
`;

const CloseButton = styled.div`
    position: absolute;
    :after {
        content: '×';
    }
    top: 3px;
    right: 5px;
    cursor: pointer;
`;

const FixtureDetailsContainer = styled.div`
    opacity: 0.9;
    padding: 16px;
    right: 50px;
    top: 10px;
    min-height: 200px;
    width: 300px;
    max-width: 500px;
    position: absolute;
    z-index: 10000;
    background-color: white;
    filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    border-radius: 5px;
    color: black;
    font-family: 'Futura';
    color: ${Colors.ctrBorderBlue};
`;

const Frequency = styled.span`
    font-family: 'Folio XBd BT';
    font-weight: bold;
`;
