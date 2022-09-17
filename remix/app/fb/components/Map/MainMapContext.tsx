import type { Map } from 'leaflet';
import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { MapBounds } from './DisplayedContent';
import { getMapBounds } from './getMapBounds';
import type { DisplayedLayerProps } from './InnerMapContainer';

export const MainMapContext = createContext<{
    map?: Map;
    setMap: (map: Map) => void;
    bounds?: MapBounds;
    currentBackgroundLayer: DisplayedLayerProps['layer'];
    nextBackgroundLayer: () => void;
}>({
    setMap: () => {},
    currentBackgroundLayer: 'osm',
    nextBackgroundLayer: () => {},
});

const availableLayers: DisplayedLayerProps['layer'][] = ['osm', 'oaci', 'sat'];

export const MainMapProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [map, setMap] = useState<Map>();
    const [bounds, setBounds] = useState<MapBounds>();
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

    return (
        <MainMapContext.Provider
            value={{
                map,
                setMap,
                bounds,
                currentBackgroundLayer,
                nextBackgroundLayer,
            }}
        >
            {children}
        </MainMapContext.Provider>
    );
};

export const useMainMap = () => {
    return useContext(MainMapContext);
};
