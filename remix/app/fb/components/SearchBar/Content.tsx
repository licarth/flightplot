import type Fuse from 'fuse.js';
import _ from 'lodash';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import VfrPointLogo from '~/generated/icons/VfrPoint';
import { isAerodrome, isVfrPoint, isVor } from '../FixtureDetails/FixtureDetails';
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
            <ContentLine
                item={item}
                highlit={highlit}
                logoComponent={<StyledAerodromeLogo aerodrome={item} />}
            >
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
            </ContentLine>
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
            <ContentLine item={item} highlit={highlit} logoComponent={<></>}>
                <HighlightedMatches
                    currentlySelected={highlit}
                    text={item.name}
                    matchTuples={_.flatten(matches?.map((m) => m.indices))}
                />
            </ContentLine>
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
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (highlit) {
            ref.current?.scrollIntoView({
                block: 'nearest',
                inline: 'nearest',
            });
        }
    }, [highlit, ref]);
    return (
        <ContentLineContainer ref={ref}>
            <OverflowHidden>
                <LogoContainer>{logoComponent}</LogoContainer>
                <Description>{children}</Description>
                {isFixture(item) && highlit && <AddToRouteHint />}
            </OverflowHidden>
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

export const isFixture = (item: SearcheableElement): item is SearchableFixture => {
    return isVor(item) || isAerodrome(item) || isVfrPoint(item);
};

export const isAirspace = (item: SearcheableElement): item is SearchableAirspace => {
    return !isFixture(item);
};

const ContentLineContainer = styled.div`
    scroll-margin: 0.5rem;
    display: flex;
    align-items: center;
    flex-grow: 1;
`;

const AddToRouteDiv = styled.div`
    justify-self: flex-end;
    margin-left: auto;
    flex-shrink: 0;
    @media (hover: none) {
        display: none;
    }
    @media (max-width: 1200px) {
        display: none;
    }
`;

const Kbd = styled.kbd`
    line-height: 0.4rem;
    transform: translateY(-3px);
`;

const Description = styled.div`
    flex-shrink: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const OverflowHidden = styled.div`
    width: 100px;
    display: flex;
    overflow: hidden;
    flex-grow: 1;
`;
