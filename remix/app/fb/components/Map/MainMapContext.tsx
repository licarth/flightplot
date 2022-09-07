import { Map } from 'leaflet';
import React, { createContext, PropsWithChildren, useContext, useState } from 'react';

export const MainMapContext = createContext<{
    map?: Map;
    setMap: (map: Map) => void;
}>({
    setMap: () => {},
});

export const MainMapProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [map, setMap] = useState<Map>();

    return (
        <MainMapContext.Provider
            value={{
                map,
                setMap,
            }}
        >
            {children}
        </MainMapContext.Provider>
    );
};

export const useMainMap = () => {
    return useContext(MainMapContext);
};
