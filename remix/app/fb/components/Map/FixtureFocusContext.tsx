import CheapRuler from 'cheap-ruler';
import _ from 'lodash';
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { DangerZoneType } from 'ts-aerodata-france';
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
import type { RtbaActivation } from '~/fb/contexts/RtbaZonesContext';
import { useRtbaZones } from '~/fb/contexts/RtbaZonesContext';
import { useAiracData } from '../useAiracData';
import { sha1 } from '~/services/elevation/sha1';

export type FocusableFixture = Aerodrome | VfrPoint | Vor | LatLngWaypoint;

export type UnderMouse = {
    airspaces: (Airspace | DangerZone)[];
    activeRestrictedAreasNext24hUnderMouse: RtbaActivation[];
};

type CenteredElement = FocusableFixture | Airspace | DangerZone;

export const FixtureFocusContext = createContext<{
    highlightedFixture?: FocusableFixture;
    mouseLocation?: LatLng;
    highlightedLocation?: LatLng;
    setMouseLocation: React.Dispatch<React.SetStateAction<LatLng | undefined>>;
    setHighlightedLocation: React.Dispatch<React.SetStateAction<LatLng | undefined>>;
    clickedLocation?: LatLng;
    setClickedLocation: (latLng: LatLng) => void;
    fixtures: FocusableFixture[];
    underMouse: UnderMouse;
    clear: () => void;
    centeredElement?: CenteredElement;
    setCenteredElement: Dispatch<SetStateAction<CenteredElement | undefined>>;
}>({
    fixtures: [],
    clear: () => {},
    setClickedLocation: () => {},
    setHighlightedLocation: () => {},
    setMouseLocation: () => {},
    underMouse: { airspaces: [], activeRestrictedAreasNext24hUnderMouse: [] },
    setCenteredElement: () => {},
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

const getAirspaces = (airacData: AiracData, mouseLocation?: LatLng) => {
    const l = mouseLocation && toLatLng(mouseLocation);
    return (
        l && [
            ..._.uniqBy(airacData.getAirspacesIntersecting(l.lat, l.lng), 'name'),
            ..._.uniqBy(airacData.getDangerZonesIntersecting(l.lat, l.lng), 'name'),
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
    const airspaces = loading || !mouseLocation ? [] : getAirspaces(airacData, mouseLocation);
    const airspacesSha = useMemo(
        () => sha1(airspaces?.map((a) => a.name).join('') || ''),
        [airspaces],
    );
    const highlightedFixtures = loading ? [] : getFixtures(airacData, highlightedLocation);
    const highlightedFixture = highlightedFixtures ? highlightedFixtures[0] : undefined;
    const [centeredElement, setCenteredElement] = useState<CenteredElement>();
    const { activeRestrictedAreasNext24h } = useRtbaZones();

    const activeRestrictedAreasNext24hUnderMouse = useMemo(() => {
        if (!mouseLocation) {
            return [];
        } else {
            const dangerZonesByName = _.keyBy(
                airspaces?.filter((a) => a.type === DangerZoneType.R),
                'name',
            );
            return activeRestrictedAreasNext24h.filter(
                (r) => dangerZonesByName[r.activeZone.zone.name],
            );
        }
    }, [airspacesSha]);

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
                underMouse: {
                    airspaces: airspaces || [],
                    activeRestrictedAreasNext24hUnderMouse,
                },
                centeredElement,
                setCenteredElement,
            }}
        >
            {children}
        </FixtureFocusContext.Provider>
    );
};

export const useFixtureFocus = () => {
    return useContext(FixtureFocusContext);
};
