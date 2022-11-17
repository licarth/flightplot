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
    filters: Filters;
    setFilters: React.Dispatch<SetStateAction<Filters>>;
    airspaceTypesToDisplay: AirspaceType[];
    setCurrentBackgroundLayer: (layer: DisplayedLayerProps['layer']) => void;
}>({
    setMap: () => {},
    currentBackgroundLayer: 'osm',
    filters: DEFAULT_FILTERS,
    setFilters: () => {},
    airspaceTypesToDisplay: [],
    setCurrentBackgroundLayer: () => {},
});

export const MainMapProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [map, setMap] = useState<Map>();
    const [bounds, setBounds] = useState<MapBounds>();
    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
    const [currentBackgroundLayer, setCurrentBackgroundLayer] =
        useState<DisplayedLayerProps['layer']>('osm');

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
                filters,
                setFilters,
                airspaceTypesToDisplay,
                setCurrentBackgroundLayer,
            }}
        >
            {children}
        </MainMapContext.Provider>
    );
};

export const useMainMap = () => {
    return useContext(MainMapContext);
};
