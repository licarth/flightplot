import type Fuse from 'fuse.js';
import _ from 'lodash';
import React from 'react';
import styled from 'styled-components';
import VfrPointLogo from '~/generated/icons/VfrPoint';
import { isAerodrome, isVfrPoint, isVor } from '../Map/FixtureDetails';
import { StyledAerodromeLogo } from '../StyledAerodromeLogo';
import { StyledVor } from '../StyledVor';
import type { SearchableAirspace, SearchableFixture, SearcheableElement } from './SearchBar';
import { HighlightedMatches, LogoContainer } from './SearchBar';

export const Content = ({
    item,
    matches,
    highlit,
}: {
    item: SearcheableElement;
    matches: readonly Fuse.FuseResultMatch[] | undefined;
    highlit: boolean;
}) => {
    if (isAerodrome(item)) {
        const { name, icaoCode } = item;
        return (
            <>
                <LogoContainer>
                    <StyledAerodromeLogo aerodrome={item} />
                </LogoContainer>
                <HighlightedMatches
                    currentlySelected={highlit}
                    text={`${icaoCode}`}
                    matchTuples={_.flatten(
                        matches?.filter((m) => m.key === 'icaoCode').map((m) => m.indices),
                    )}
                />
                {` - `}
                <HighlightedMatches
                    currentlySelected={highlit}
                    text={name}
                    matchTuples={_.flatten(matches?.map((m) => m.indices))}
                />
            </>
        );
    } else if (isVfrPoint(item)) {
        const { name, description } = item;

        return (
            <ContentLine item={item} highlit={highlit} logoComponent={<VfrPointLogo />}>
                <HighlightedMatches
                    currentlySelected={highlit}
                    text={name}
                    matchTuples={_.flatten(
                        matches?.filter((m) => m.key === 'name').map((m) => m.indices),
                    )}
                />
                {` - `}
                <HighlightedMatches
                    currentlySelected={highlit}
                    text={description}
                    matchTuples={_.flatten(
                        matches?.filter((m) => m.key === 'description').map((m) => m.indices),
                    )}
                />
            </ContentLine>
        );
    } else if (isVor(item)) {
        const { name, ident } = item;
        return (
            <ContentLine
                item={item}
                highlit={highlit}
                logoComponent={<StyledVor $dme={item.dme} />}
            >
                <HighlightedMatches
                    currentlySelected={highlit}
                    text={name}
                    matchTuples={_.flatten(
                        matches?.filter((m) => m.key === 'name').map((m) => m.indices),
                    )}
                />
                {` - `}
                <HighlightedMatches
                    currentlySelected={highlit}
                    text={ident}
                    matchTuples={_.flatten(
                        matches?.filter((m) => m.key === 'ident').map((m) => m.indices),
                    )}
                />
            </ContentLine>
        );
    } else {
        // Airspace & DangerZone
        return (
            <HighlightedMatches
                currentlySelected={highlit}
                text={item.name}
                matchTuples={_.flatten(matches?.map((m) => m.indices))}
            />
        );
    }
};

const ContentLine = ({
    logoComponent,
    highlit,
    item,
    children,
}: {
    logoComponent: JSX.Element;
    highlit: boolean;
    children: React.ReactNode;
    item: SearcheableElement;
}) => {
    return (
        <ContentLineContainer>
            <LogoContainer>{logoComponent}</LogoContainer>
            <div>{children}</div>
            {isFixture(item) && highlit && <AddToRouteHint />}
        </ContentLineContainer>
    );
};

const AddToRouteHint = () => {
    return (
        <AddToRouteDiv>
            <Kbd className="kbc-button kbc-button-xxs">Command</Kbd>+
            <Kbd className="kbc-button kbc-button-xxs">Enter</Kbd> pour ajouter
        </AddToRouteDiv>
    );
};

const isFixture = (item: SearcheableElement): item is SearchableFixture => {
    return isVor(item) || isAerodrome(item) || isVfrPoint(item);
};

const isAirspace = (item: SearcheableElement): item is SearchableAirspace => {
    return !isFixture(item);
};

const ContentLineContainer = styled.div`
    display: flex;
    align-items: center;
    flex-grow: 1;
`;

const AddToRouteDiv = styled.div`
    justify-self: flex-end;
    margin-left: auto;
`;

const Kbd = styled.kbd`
    line-height: 0.4rem;
`;
