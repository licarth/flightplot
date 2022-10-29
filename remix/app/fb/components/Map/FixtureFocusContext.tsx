import CheapRuler from 'cheap-ruler';
import _ from 'lodash';
import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useMemo, useState } from 'react';
import type {
    Aerodrome,
    AiracData,
    Airspace,
    DangerZone,
    LatLng,
    VfrPoint,
    Vor,
} from 'ts-aerodata-france';
import type { LatLngWaypoint } from '~/domain';
import { toLatLng, toPoint } from '~/domain';
import { useAiracData } from '../useAiracData';

export type FocusableFixture = Aerodrome | VfrPoint | Vor | LatLngWaypoint;

export type UnderMouse = {
    airspaces: (Airspace | DangerZone)[];
};

export const FixtureFocusContext = createContext<{
    highlightedFixture?: FocusableFixture;
    mouseLocation?: LatLng;
    highlightedLocation?: LatLng;
    setMouseLocation: React.Dispatch<React.SetStateAction<LatLng | undefined>>;
    setHighlightedLocation: React.Dispatch<React.SetStateAction<LatLng | undefined>>;
    clickedLocation?: LatLng;
    setClickedLocation: (latLng: LatLng) => void;
    fixtures: FocusableFixture[];
    atClickedLocation: UnderMouse;
    underMouse: UnderMouse;
    clear: () => void;
}>({
    fixtures: [],
    clear: () => {},
    setClickedLocation: () => {},
    setHighlightedLocation: () => {},
    setMouseLocation: () => {},
    atClickedLocation: {
        airspaces: [],
    },
    underMouse: { airspaces: [] },
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

const getAirspaces = (airacData: AiracData, l?: LatLng) => {
    const location = l && toLatLng(l);
    return (
        location && [
            ..._.uniqBy(airacData.getAirspacesIntersecting(location.lat, location.lng), 'name'),
            ..._.uniqBy(airacData.getDangerZonesIntersecting(location.lat, location.lng), 'name'),
        ]
    );
};

export const FixtureFocusProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [clickedLocation, setClickedLocation] = useState<LatLng>();
    const [highlightedLocation, setHighlightedLocation] = useState<LatLng>();
    const [mouseLocation, setMouseLocation] = useState<LatLng>();
    const clear = () => setClickedLocation(() => undefined);
    const { airacData, loading } = useAiracData();
    const fixtures = loading ? [] : getFixtures(airacData, clickedLocation);
    const airspacesUnderMouse =
        loading || !mouseLocation ? [] : getAirspaces(airacData, mouseLocation);
    const airspacesAtClickedLocation =
        loading || !clickedLocation ? [] : getAirspaces(airacData, clickedLocation);
    const highlightedFixtures = loading ? [] : getFixtures(airacData, highlightedLocation);
    const highlightedFixture = highlightedFixtures ? highlightedFixtures[0] : undefined;

    const throttledSetMouseLocation = useMemo(() => _.throttle(setMouseLocation, 50), []);
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
                mouseLocation,
                setMouseLocation: throttledSetMouseLocation,
                underMouse: { airspaces: airspacesUnderMouse || [] },
                atClickedLocation: { airspaces: airspacesAtClickedLocation || [] },
            }}
        >
            {children}
        </FixtureFocusContext.Provider>
    );
};

export const useFixtureFocus = () => {
    return useContext(FixtureFocusContext);
};
