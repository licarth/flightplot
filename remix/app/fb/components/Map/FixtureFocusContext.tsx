import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useState } from 'react';
import type { Aerodrome, LatLng, VfrPoint, Vor } from 'ts-aerodata-france';

export type FocusableFixture = Aerodrome | VfrPoint | Vor | LatLng;

export const FixtureFocusContext = createContext<{
    fixture?: FocusableFixture;
    setFixture: React.Dispatch<React.SetStateAction<FocusableFixture | undefined>>;
    clear: () => void;
}>({
    setFixture: () => {},
    clear: () => {},
});

export const FixtureFocusProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [fixture, setFixture] = useState<FocusableFixture>();
    const clear = () => setFixture(() => undefined);
    return (
        <FixtureFocusContext.Provider
            value={{
                fixture,
                setFixture,
                clear,
            }}
        >
            {children}
        </FixtureFocusContext.Provider>
    );
};

export const useFixtureFocus = () => {
    return useContext(FixtureFocusContext);
};
