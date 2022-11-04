import type { Map } from 'leaflet';
import _ from 'lodash';
import type { PropsWithChildren, SetStateAction } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { MapBounds } from './DisplayedContent';
import { getMapBounds } from './getMapBounds';
import type { DisplayedLayerProps } from './InnerMapContainer';

const DEFAULT_FILTERS = {
    showAirspacesStartingBelowFL: 20,
    displayModePerAirspaceType: {
        R: false,
        D: false,
        SIV: false,
    },
};

type Filters = typeof DEFAULT_FILTERS;

type AirspaceType = 'D' | 'R' | 'TMA' | 'CTR' | 'CTA' | 'P' | 'SIV';

export const MainMapContext = createContext<{
    map?: Map;
    setMap: (map: Map) => void;
    bounds?: MapBounds;
    currentBackgroundLayer: DisplayedLayerProps['layer'];
    nextBackgroundLayer: () => void;
    filters: Filters;
    setFilters: React.Dispatch<SetStateAction<Filters>>;
    airspaceTypesToDisplay: AirspaceType[];
}>({
    setMap: () => {},
    currentBackgroundLayer: 'osm',
    nextBackgroundLayer: () => {},
    filters: DEFAULT_FILTERS,
    setFilters: () => {},
    airspaceTypesToDisplay: [],
});

const availableLayers: DisplayedLayerProps['layer'][] = ['osm', 'oaci', 'sat'];

export const MainMapProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [map, setMap] = useState<Map>();
    const [bounds, setBounds] = useState<MapBounds>();
    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
    const [currentBackgroundLayerIndex, setCurrentBackgroundLayerIndex] = useState<number>(0);

    const currentBackgroundLayer = availableLayers[currentBackgroundLayerIndex];

    const nextBackgroundLayer = () =>
        setCurrentBackgroundLayerIndex((currentBackgroundLayerIndex + 1) % availableLayers.length);

    useEffect(() => {
        const refreshMapBounds = () => map && setBounds(() => getMapBounds(map));
        map?.addEventListener('zoomend', refreshMapBounds);
        map?.addEventListener('moveend', refreshMapBounds);
        map?.addEventListener('resize', refreshMapBounds);
        map?.addEventListener('update', refreshMapBounds);
        refreshMapBounds();
    }, [map]);

    const airspaceTypesToDisplay = [
        ...Object.keys(_.pickBy(filters.displayModePerAirspaceType, (v) => v === true)),
        'P',
        'TMA',
        'CTR',
        'CTA',
    ] as AirspaceType[];

    return (
        <MainMapContext.Provider
            value={{
                map,
                setMap,
                bounds,
                currentBackgroundLayer,
                nextBackgroundLayer,
                filters,
                setFilters,
                airspaceTypesToDisplay,
            }}
        >
            {children}
        </MainMapContext.Provider>
    );
};

export const useMainMap = () => {
    return useContext(MainMapContext);
};
