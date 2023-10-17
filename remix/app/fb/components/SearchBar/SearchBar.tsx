import { Input } from 'antd';
import Fuse from 'fuse.js';
import type { LatLngBoundsLiteral } from 'leaflet';
import _ from 'lodash';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Options } from 'react-hotkeys-hook';
import { useHotkeys } from 'react-hotkeys-hook';
import styled from 'styled-components';
import type { AiracData, Airspace, DangerZone } from 'ts-aerodata-france';
import { boundingBox, toCheapRulerPoint, toLatLng } from '~/domain';
import { isAerodrome, isVfrPoint, isVor } from '../FixtureDetails/FixtureDetails';
import { addFixtureToRoute } from '../Map/addFixtureToRoute';
import { boxAround } from '../Map/boxAround';
import { Colors } from '../Map/Colors';
import type { FocusableFixture } from '../Map/FixtureFocusContext';
import { isLatLngWaypoint } from '../Map/FlightPlanningLayer';
import { useTemporaryMapBounds } from '../Map/TemporaryMapCenterContext';
import { useSearchElement } from '../SearchItemContext';
import { useRoute } from '../useRoute';
import { Content, isFixture } from './Content';

export type SearchableAirspace = Airspace | DangerZone;
export type SearchableFixture = FocusableFixture;
export type SearcheableElement = SearchableAirspace | SearchableFixture;
type AirspaceSearchResult = Fuse.FuseResult<SearchableAirspace>;
type FixtureSearchResult = Fuse.FuseResult<SearchableFixture>;

const MAX_AIRSPACE_RESULTS = 100;
const MAX_FIXTURE_RESULTS = 100;

export const SearchBar = ({ airacData }: { airacData?: AiracData }) => {
    const [searchTerm, setSearchTerm] = useState<string>();
    const [airspaceResults, setAirspaceResults] = useState<AirspaceSearchResult[]>([]);
    const [fixturesResults, setFixturesResults] = useState<FixtureSearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | undefined>(); //Starts at 1

    const routeContext = useRoute();

    const totalResults = airspaceResults.length + fixturesResults.length;
    const allResults = [...fixturesResults, ...airspaceResults];
    const nextResult = useCallback(() => {
        setSelectedIndex((i) => (i && i !== totalResults ? (i + 1) % (totalResults + 1) : 1));
    }, [airspaceResults, fixturesResults]);
    const previousResult = useCallback(() => {
        setSelectedIndex((i) => (i ? (i - 1) % (totalResults + 1) : undefined));
    }, [airspaceResults, fixturesResults]);

    const { setTemporaryBounds, clearTemporaryBounds } = useTemporaryMapBounds();

    const clearSearch = useCallback(() => {
        setSearchTerm('');
        setSelectedIndex(undefined);
        clearTemporaryBounds();
    }, [setSearchTerm, setSelectedIndex, clearTemporaryBounds]);

    const setBoundsForSelectedItem = _.throttle(
        useCallback(
            (i: number) => {
                if (i) {
                    const index = i - 1;
                    const item = allResults[index];
                    if (item) {
                        const bounds = getBoundsForSearchResult(item.item);
                        if (bounds) {
                            setTemporaryBounds(bounds, item.item);
                        }
                    }
                } else {
                    clearTemporaryBounds();
                }
            },
            [allResults, clearTemporaryBounds, setTemporaryBounds],
        ),
        1000,
    );

    const opts: Options = { enableOnTags: ['INPUT'] };

    useHotkeys('up', previousResult, opts, []);
    useHotkeys('down', nextResult, opts, []);
    useHotkeys(
        'command+enter',
        () => {
            const item = allResults[selectedIndex! - 1].item;
            isFixture(item) && addFixtureToRoute({ fixture: item, routeContext });
        },
        opts,
        [],
    );
    const { setItem } = useSearchElement();

    useEffect(() => {
        selectedIndex && setBoundsForSelectedItem(selectedIndex);
        setItem(allResults[selectedIndex! - 1]?.item);
    }, [selectedIndex]);

    useHotkeys(
        'escape',
        () => {
            clearSearch();
        },
        opts,
        [],
    );

    const [airspacesFuse, fixturesFuse] = useMemo(() => {
        if (!airacData) {
            return [undefined, undefined];
        }
        return [
            new Fuse<SearchableAirspace>([...airacData.airspaces, ...airacData.dangerZones], {
                keys: ['name'],
                includeMatches: true,
                includeScore: true,
                threshold: 0.3,
            }),
            new Fuse(
                [
                    ...airacData.aerodromes,
                    ...airacData.vors,
                    ...airacData.vfrPoints.map((v) => ({ ...v, name: `${v.icaoCode}/${v.name}` })),
                ],
                {
                    keys: ['name', 'description', 'icaoCode', 'ident'],
                    includeMatches: true,
                    includeScore: true,
                    minMatchCharLength: 2,
                    threshold: 0.2,
                },
            ),
        ];
    }, [airacData]);
    const search = useCallback(
        (term: string): [AirspaceSearchResult[], FixtureSearchResult[]] => {
            return [airspacesFuse?.search(term) || [], fixturesFuse?.search(term) || []];
        },
        [airspacesFuse, fixturesFuse],
    );

    useEffect(() => {
        const [airspaceResults, fixturesResults] = searchTerm ? search(searchTerm) : [[], []];
        setAirspaceResults(_.take<AirspaceSearchResult>(airspaceResults, MAX_AIRSPACE_RESULTS));
        setFixturesResults(_.take<FixtureSearchResult>(fixturesResults, MAX_FIXTURE_RESULTS));
    }, [airacData, searchTerm, search]);

    return (
        <Container>
            <StyledInput
                allowClear
                placeholder="Rechercher un aérodrome, un point VFR, une zone..."
                autoFocus
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedIndex(undefined);
                }}
            />
            <MobileStyledInput
                allowClear
                placeholder="Rechercher un aérodrome, un point VFR, une zone..."
                autoFocus
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedIndex(undefined);
                }}
            />
            <ResultsContainer $itemSelected={!!selectedIndex}>
                <FixtureSearchResults
                    results={fixturesResults}
                    selectedIndex={selectedIndex || null}
                    setSelectedIndex={setSelectedIndex}
                />
                <AirspaceSearchResults
                    indexOffset={fixturesResults.length}
                    results={airspaceResults}
                    selectedIndex={
                        selectedIndex ? selectedIndex - fixturesResults.length || null : null
                    }
                    setSelectedIndex={setSelectedIndex}
                />
            </ResultsContainer>
        </Container>
    );
};

const Container = styled.div`
    max-width: 90vw;
    font-family: 'Futura';
    font-weight: 900;
    color: ${Colors.ctrBorderBlue};
    position: relative;
    margin-right: 0.4rem;
`;

const AirspaceSearchResults = ({
    results,
    selectedIndex,
    setSelectedIndex,
    indexOffset,
}: {
    results: AirspaceSearchResult[];
    selectedIndex: number | null;
    setSelectedIndex: Dispatch<SetStateAction<number | undefined>>;
    indexOffset: number;
}) => {
    return (
        <div>
            {_.take<AirspaceSearchResult>(results, MAX_AIRSPACE_RESULTS).map((searchResult, i) => {
                const { item, matches, score } = searchResult;
                const highlit = selectedIndex === i + 1;
                return (
                    <MatchLine
                        key={`airspace-search-result-${i}`}
                        $highlit={highlit}
                        onClick={() => {
                            setSelectedIndex(indexOffset + i + 1);
                        }}
                    >
                        <Score score={score} />
                        <Content item={item} highlit={highlit} matches={matches} />
                    </MatchLine>
                );
            })}
        </div>
    );
};
const FixtureSearchResults = ({
    results,
    selectedIndex,
    setSelectedIndex,
}: {
    results: FixtureSearchResult[];
    selectedIndex: number | null;
    setSelectedIndex: Dispatch<SetStateAction<number | undefined>>;
}) => {
    return (
        <div>
            {results.map((searchResult, i) => {
                const { item, matches, score } = searchResult;

                const highlit = selectedIndex === i + 1;
                return (
                    <MatchLine
                        key={`aerodrome-search-result-${i}`}
                        $highlit={highlit}
                        onClick={() => {
                            setSelectedIndex(i + 1);
                        }}
                    >
                        <Score score={score} />
                        <Content item={item} matches={matches} highlit={highlit} />
                    </MatchLine>
                );
            })}
        </div>
    );
};

export const HighlightedMatches = ({
    text,
    matchTuples,
    currentlySelected,
}: {
    text: string | null;
    matchTuples: [number, number][];
    currentlySelected?: boolean;
}) => {
    if (currentlySelected) {
        return <>{text}</>;
    }
    if (text === null) {
        return null;
    }
    let highlightedText = <></>;
    let currentIndex = 0;
    while (matchTuples.length > 0) {
        const [start, end] = matchTuples.shift()!;
        highlightedText = (
            <>
                {highlightedText}
                {text.slice(currentIndex, start)}
                <HighlightedPart>{text.slice(start, end + 1)}</HighlightedPart>
            </>
        );
        currentIndex = end + 1;
    }
    highlightedText = (
        <>
            {highlightedText}
            {text.slice(currentIndex)}
        </>
    );

    return <>{highlightedText}</>;
};

const HighlightedPart = styled.span`
    background-color: #ff0;
`;

const MatchLine = styled.div<{ $highlit: boolean }>`
    vertical-align: middle;
    white-space: pre;
    display: flex;
    padding: 0.5rem;
    background-color: ${(props) =>
        props.$highlit ? `${Colors.ctrBorderBlue} !important` : 'transparent'};
    justify-content: stretch;
    ${(props) =>
        props.$highlit &&
        `
    color: white;
    svg path {
        fill: white !important;
        stroke: white !important;
    }
    svg circle {
        stroke: white !important;
    }
    `};
    cursor: pointer;
    :hover {
        background-color: ${Colors.ctrBorderLightBlue};
    }
`;

const Score = ({ score }: { score?: number }) => {
    return <></>;
    // return <>[{score?.toFixed(2)}] - </>;
};

export const LogoContainer = styled.div`
    align-self: center;
    width: 1rem;
    height: 1rem;
    margin-right: 0.4rem;
    flex-shrink: 0;
`;

const ResultsContainer = styled.div<{ $itemSelected?: boolean }>`
    position: absolute;
    /* top: 100%;
        left: 0; */
    background-color: #fff;
    /* border: 1px solid #000; */
    max-height: ${() => {
        return typeof window !== 'undefined' && window?.visualViewport
            ? `${window.visualViewport.height - 100}px`
            : '80vh';
    }};
    z-index: 1100;
    overflow-y: scroll;
    width: 100%;

    @media (hover: none) {
        width: 95vw;
    }

    @media (max-width: 500px) {
        width: 95vw;
    }

    // shadow except on top
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.5);
    // rounded bottom corners
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
    @media (hover: none) {
        ${(props) => props.$itemSelected && `display: none;`}
    }
`;

const StyledInput = styled(Input)`
    width: 500px;
    max-width: 35vw;
    @media (max-width: 550px) {
        display: none;
    }
    align-self: center;
    margin-right: 0.5rem;
`;

const MobileStyledInput = styled(Input)`
    @media (min-width: 551px) {
        display: none;
    }
    align-self: center;
    margin-right: 0.5rem;
`;

const getBoundsForSearchResult = (item: SearcheableElement): LatLngBoundsLiteral => {
    if (isAerodrome(item) || isVfrPoint(item) || isVor(item) || isLatLngWaypoint(item)) {
        return boxAround(toCheapRulerPoint(toLatLng(item.latLng)), 5_000);
    } else {
        return boundingBox(item.geometry.map(toLatLng));
    }
};
