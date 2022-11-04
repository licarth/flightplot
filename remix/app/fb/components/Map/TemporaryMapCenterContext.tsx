import type { FitBoundsOptions, LatLngBounds, LatLngBoundsLiteral } from 'leaflet';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useState } from 'react';
import type { SearcheableElement } from '../SearchBar';
import { useMainMap } from './MainMapContext';

export const TemporaryMapBoundsContext = createContext<{
    temporaryBounds?: LatLngBoundsLiteral;
    setTemporaryBounds: (bounds: LatLngBoundsLiteral, highlightedItem: SearcheableElement) => void;
    clearTemporaryBounds: () => void;
    highlightedItem?: SearcheableElement;
}>({
    setTemporaryBounds: () => {},
    clearTemporaryBounds: () => {},
});

type TemporaryBoundsState = {
    bounds: LatLngBoundsLiteral;
    previousBounds: LatLngBounds;
    highlightedItem: SearcheableElement;
};

const flyToBoundsOptions: FitBoundsOptions = {
    // maxZoom: 11,
    animate: false,
    // padding: [100, 100],
};

export const TemporaryMapBoundsProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { map } = useMainMap();
    const [temporaryBoundsState, setTemporaryBoundsState] = useState<TemporaryBoundsState>();
    return (
        <TemporaryMapBoundsContext.Provider
            value={{
                temporaryBounds: temporaryBoundsState?.bounds,
                setTemporaryBounds: (bounds, highlightedItem) => {
                    if (!map) {
                        return;
                    }
                    setTemporaryBoundsState((previousState) => {
                        const currentBounds = map.getBounds();
                        const previousBounds = previousState
                            ? previousState.previousBounds
                            : currentBounds;

                        if (bounds) {
                            if (previousBounds.contains(bounds)) {
                                if (previousBounds.toBBoxString() !== currentBounds.toBBoxString())
                                    map.flyToBounds(previousBounds, flyToBoundsOptions);
                                // map.flyToBounds(previousBounds, flyToBoundsOptions);
                            } else {
                                map.flyToBounds(bounds, {
                                    ...flyToBoundsOptions,
                                    maxZoom: 11,
                                    padding: [100, 100],
                                    animate: false,
                                });
                            }
                        } else {
                            map.flyToBounds(previousBounds, flyToBoundsOptions);
                        }

                        return {
                            bounds,
                            previousBounds: previousBounds,
                            highlightedItem,
                        };
                    });
                    // only fly to bounds if highlightedItem is not in current bounds
                },
                clearTemporaryBounds: () => {
                    map &&
                        temporaryBoundsState?.previousBounds &&
                        map.flyToBounds(temporaryBoundsState.previousBounds, { animate: false });
                    setTemporaryBoundsState(undefined);
                },
                highlightedItem: temporaryBoundsState?.highlightedItem,
            }}
        >
            {children}
        </TemporaryMapBoundsContext.Provider>
    );
};

export const useTemporaryMapBounds = () => {
    return useContext(TemporaryMapBoundsContext);
};
