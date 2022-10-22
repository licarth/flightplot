import CheapRuler from 'cheap-ruler';
import _ from 'lodash';
import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useState } from 'react';
import type { Aerodrome, AiracData, LatLng, VfrPoint, Vor } from 'ts-aerodata-france';
import type { LatLngWaypoint } from '~/domain';
import { toLatLng, toPoint } from '~/domain';
import { useAiracData } from '../useAiracData';

export type FocusableFixture = Aerodrome | VfrPoint | Vor | LatLngWaypoint;

export const FixtureFocusContext = createContext<{
    highlightedFixture?: FocusableFixture;
    highlightedLocation?: LatLng;
    setHighlightedLocation: React.Dispatch<React.SetStateAction<LatLng | undefined>>;
    clickedLocation?: LatLng;
    setClickedLocation: (latLng: LatLng) => void;
    fixtures: FocusableFixture[];
    clear: () => void;
}>({
    fixtures: [],
    clear: () => {},
    setClickedLocation: () => {},
    setHighlightedLocation: () => {},
});

const getFixtures = (airacData: AiracData, l?: LatLng) => {
    const location = l && toLatLng(l);
    return (
        location &&
        _.orderBy(
            _.uniqBy(airacData.getFixturesWithinRange(location.lng, location.lat, 0.1), 'name'),
            ({ latLng }) => {
                return new CheapRuler(location.lat).distance(toPoint(location), toPoint(latLng));
            },
        )
    );
};

export const FixtureFocusProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [clickedLocation, setClickedLocation] = useState<LatLng>();
    const [highlightedLocation, setHighlightedLocation] = useState<LatLng>();
    const clear = () => setClickedLocation(() => undefined);
    const { airacData, loading } = useAiracData();
    const fixtures = loading ? [] : getFixtures(airacData, clickedLocation);
    const highlightedFixtures = loading ? [] : getFixtures(airacData, highlightedLocation);

    const highlightedFixture = highlightedFixtures ? highlightedFixtures[0] : undefined;
    return (
        <FixtureFocusContext.Provider
            value={{
                fixtures: fixtures || [],
                clear,
                setClickedLocation,
                clickedLocation,
                highlightedFixture,
                highlightedLocation,
                setHighlightedLocation,
            }}
        >
            {children}
        </FixtureFocusContext.Provider>
    );
};

export const useFixtureFocus = () => {
    return useContext(FixtureFocusContext);
};
