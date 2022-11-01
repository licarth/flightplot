import { Input } from 'antd';
import Fuse from 'fuse.js';
import type { LatLngBoundsLiteral } from 'leaflet';
import _ from 'lodash';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import styled from 'styled-components';
import type { AiracData, Airspace, DangerZone } from 'ts-aerodata-france';
import { boundingBox, toCheapRulerPoint, toLatLng } from '~/domain';
import VfrPointLogo from '~/generated/icons/VfrPoint';
import { boxAround } from '../Map/boxAround';
import { Colors } from '../Map/Colors';
import { isAerodrome, isVfrPoint, isVor } from '../Map/FixtureDetails';
import type { FocusableFixture } from '../Map/FixtureFocusContext';
import { isLatLngWaypoint } from '../Map/FlightPlanningLayer';
// import { isLatLngWaypoint } from '../Map/FlightPlanningLayer';
import { useTemporaryMapBounds } from '../Map/TemporaryMapCenterContext';
import { StyledAerodromeLogo } from '../StyledAerodromeLogo';
import { StyledVor } from '../StyledVor';

type SearchableAirspace = Airspace | DangerZone;
type SearchableFixture = FocusableFixture;
export type SearcheableElement = SearchableAirspace | SearchableFixture;
type AirspaceSearchResult = Fuse.FuseResult<SearchableAirspace>;
type FixtureSearchResult = Fuse.FuseResult<SearchableFixture>;

const MAX_AIRSPACE_RESULTS = 100;
const MAX_FIXTURE_RESULTS = 100;

export const SearchBar = ({ airacData }: { airacData?: AiracData }) => {
    const [searchTerm, setSearchTerm] = useState<string>();
    const [airspaceResults, setAirspaceResults] = useState<AirspaceSearchResult[]>([]);
    const [fixturesResults, setFixturesResults] = useState<FixtureSearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(); //Starts at 1

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

    useHotkeys('up', previousResult, []);
    useHotkeys('down', nextResult, []);
    // useHotkeys(
    //     'enter',
    //     () => {
    //         selectedIndex && setBoundsForSelectedItem(selectedIndex);
    //     },
    //     [selectedIndex],
    // );
    useEffect(() => {
        selectedIndex && setBoundsForSelectedItem(selectedIndex);
    }, [selectedIndex]);

    useHotkeys(
        'escape',
        () => {
            clearSearch();
        },
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
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === 'Down' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        nextResult();
                    } else if (e.key === 'Up' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        previousResult();
                    } else if (e.key === 'Enter') {
                        // TODO
                    } else if (e.key === 'Escape' || e.key === 'Esc') {
                        clearSearch();
                    }
                }}
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedIndex(undefined);
                }}
            />
            <ResultsContainer>
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
    font-family: 'Futura';
    color: ${Colors.ctrBorderBlue};
    line-height: 1rem;
    position: relative;
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
                const {
                    item: { name },
                    matches,
                    score,
                } = searchResult;
                const highlit = selectedIndex === i + 1;
                return (
                    <MatchLine
                        key={`airspace-search-result-${i}`}
                        $highlit={highlit}
                        onMouseEnter={() => {
                            setSelectedIndex(indexOffset + i + 1);
                        }}
                    >
                        <Score score={score} />
                        <HighlightedMatches
                            currentlySelected={highlit}
                            text={name}
                            matchTuples={_.flatten(matches?.map((m) => m.indices))}
                        />
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
                        onMouseEnter={() => {
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

const Content = ({
    item,
    matches,
    highlit,
}: {
    item: FocusableFixture;
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
            <>
                <LogoContainer>
                    <VfrPointLogo />
                </LogoContainer>
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
            </>
        );
    } else if (isVor(item)) {
        const { name, ident } = item;
        return (
            <>
                <LogoContainer>
                    <StyledVor $dme={item.dme} />
                </LogoContainer>

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
            </>
        );
    } else return <>null</>;
};

const HighlightedMatches = ({
    text,
    matchTuples,
    currentlySelected,
}: {
    text: string;
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

    return <SearchResultContainer>{highlightedText}</SearchResultContainer>;
};

const HighlightedPart = styled.span`
    background-color: #ff0;
`;

const SearchResultContainer = styled.div`
    /* line-height: 1rem; */
`;

const MatchLine = styled.div<{ $highlit: boolean }>`
    vertical-align: middle;
    white-space: pre;
    display: flex;
    padding: 0.5rem;
    background-color: ${(props) => (props.$highlit ? Colors.ctrBorderBlue : 'transparent')};
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
`;

const Score = ({ score }: { score?: number }) => {
    return <></>;
    // return <>[{score?.toFixed(2)}] - </>;
};

const LogoContainer = styled.div`
    align-self: center;
    width: 1rem;
    height: 1rem;
    margin-right: 0.4rem;
`;

const ResultsContainer = styled.div`
    position: absolute;
    /* top: 100%;
        left: 0; */
    background-color: #fff;
    /* border: 1px solid #000; */
    max-height: 80vh;
    z-index: 700;
    overflow-y: scroll;
    width: 100%;
    // shadow except on top
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.5);
    // rounded bottom corners
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
`;

const StyledInput = styled(Input.Search)`
    width: 500px;
    align-self: center;
`;

const getBoundsForSearchResult = (item: SearcheableElement): LatLngBoundsLiteral => {
    if (isAerodrome(item) || isVfrPoint(item) || isVor(item) || isLatLngWaypoint(item)) {
        return boxAround(toCheapRulerPoint(toLatLng(item.latLng)), 5_000);
    } else {
        return boundingBox(item.geometry.map(toLatLng));
    }
};
