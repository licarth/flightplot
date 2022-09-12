import type { Map } from 'leaflet';
import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { MapBounds } from './DisplayedContent';
import { getMapBounds } from './getMapBounds';

export const MainMapContext = createContext<{
    map?: Map;
    setMap: (map: Map) => void;
    bounds?: MapBounds;
}>({
    setMap: () => {},
});

export const MainMapProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [map, setMap] = useState<Map>();
    const [bounds, setBounds] = useState<MapBounds>();

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
            }}
        >
            {children}
        </MainMapContext.Provider>
    );
};

export const useMainMap = () => {
    return useContext(MainMapContext);
};
