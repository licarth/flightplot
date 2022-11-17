import styled from 'styled-components';
import { useHelpPage } from '../HelpPageContext';
import type { SearcheableElement } from '../SearchBar';
import { Colors } from './Colors';

type SearchableElementDetailsProps = {
    searchableElement: SearcheableElement;
    onClose: () => void;
};

export const SearchElementDetails = ({
    searchableElement,
    onClose,
}: SearchableElementDetailsProps) => {
    const { isOpen: isHelpOpen } = useHelpPage();

    return (
        <FixtureDetailsContainer isHelpOpen={isHelpOpen}>
            {searchableElement?.name}
        </FixtureDetailsContainer>
    );
};

const FixtureDetailsContainer = styled.div<{ isHelpOpen: boolean }>`
    transition: all 0.3s;
    padding: 1rem;
    padding-top: 2rem;
    padding-right: 0.5rem;
    right: ${({ isHelpOpen }) => 120 + (isHelpOpen ? 600 : 0)}px;
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
    border: 2px solid ${Colors.flightplotLogoBlue};

    @media (hover: none) {
        max-width: 80vw;
    }
`;
