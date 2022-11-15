import { collection, getFirestore, limit, onSnapshot, orderBy, query } from '@firebase/firestore';
import type { Dictionary } from 'lodash';
import _ from 'lodash';
import type { PropsWithChildren } from 'react';
import React, { createContext, useEffect, useState } from 'react';

export type Metar = { metarString: string; queriedAt: Date };

export const WeatherContext = createContext<{
    loading: boolean;
    metarsByIcaoCode: Record<string, Metar>;
}>({
    loading: false,
    metarsByIcaoCode: {},
});

export const WeatherProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [metarsByIcaoCode, setMetarsByIcaoCode] = useState<Record<string, Metar> | undefined>();
    useEffect(() => {
        const db = getFirestore();
        const metarsRef = collection(db, 'metars');

        const q = query(metarsRef, orderBy('queriedAt', 'desc'), limit(1));

        const unsub = onSnapshot(q, { includeMetadataChanges: false }, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const queriedAt = doc.get('queriedAt').toDate();
                const metarsByIcaoCode = _.keyBy(
                    doc.get('metars'),
                    (m: string) => m.split(' ')[0],
                ) as Dictionary<string>;
                setMetarsByIcaoCode(
                    _.mapValues(metarsByIcaoCode, (metarString: string) => ({
                        metarString,
                        queriedAt,
                    })),
                );
            });
        });
        return unsub;
    }, []);

    console.log(metarsByIcaoCode);

    return (
        <WeatherContext.Provider
            value={{
                loading: metarsByIcaoCode === undefined,
                metarsByIcaoCode: metarsByIcaoCode || {},
            }}
        >
            {children}
        </WeatherContext.Provider>
    );
};

export const useWeather = () => React.useContext(WeatherContext);
