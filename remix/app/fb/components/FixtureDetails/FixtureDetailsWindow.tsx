import { Button } from 'antd';
import formatcoords from 'formatcoords';
import styled from 'styled-components';
import type { LatLng } from '~/domain';
import { latLngWaypointFactory, toLeafletLatLng } from '~/domain';
import { Target } from '~/generated/icons';
import { useHelpPage } from '../HelpPageContext';
import { addFixtureToRoute } from '../Map/addFixtureToRoute';
import { Colors } from '../Map/Colors';
import { useFixtureFocus } from '../Map/FixtureFocusContext';
import { FixtureDetailsContainer } from '../Map/LeafletMapContainer.client';
import { useSearchElement } from '../SearchItemContext';
import { useRoute } from '../useRoute';
import { Buttons, Description, FixtureDetails, LogoContainer } from './FixtureDetails';
import { SearchElementDetails } from './SearchableElementDetails';

export const FixtureDetailsWindow = () => {
    const { item } = useSearchElement();

    const { isOpen: isHelpOpen } = useHelpPage();

    const { clickedLocation, fixtures, clear: clearFixture } = useFixtureFocus();

    const onClose = () => {
        clearFixture();
    };

    const isOpen = clickedLocation || item;

    return isOpen ? (
        <FixtureDetailsContainer isHelpOpen={isHelpOpen}>
            <Header key={`fixture-selected-point`}>
                {clickedLocation ? <TargetCard latLng={toLeafletLatLng(clickedLocation)} /> : null}
                <CloseButton onClick={onClose}>x</CloseButton>
            </Header>
            {clickedLocation && !item ? (
                <FixtureDetails fixtures={fixtures} clickedLocation={clickedLocation} />
            ) : null}
            {item && <SearchElementDetails searchableElement={item} onClose={() => {}} />}
        </FixtureDetailsContainer>
    ) : null;
};

const CloseButton = styled.div`
    z-index: 1;
    padding-right: 1rem;
    padding-left: 1rem;
    cursor: pointer;
    flex-grow: 0;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    padding-left: 0.25rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    background-color: ${() => Colors.mainThemeColor};
    color: ${() => Colors.white};
`;

const TargetCard = ({ latLng }: { latLng: LatLng }) => {
    const routeContext = useRoute();
    return (
        <>
            <Description>
                <LogoContainer>
                    <WhiteTarget />
                </LogoContainer>
                <div>{formatcoords(latLng.lat, latLng.lng).format({ decimalPlaces: 0 })}</div>
            </Description>
            <Buttons>
                <Button
                    size="small"
                    type="default"
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
        </>
    );
};

const WhiteTarget = styled(Target)`
    g * {
        stroke: ${() => Colors.white} !important;
        stroke-width: 5 !important;
    }
`;
