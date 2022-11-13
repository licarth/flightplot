import { collection, getDocs, getFirestore, limit, orderBy, query } from '@firebase/firestore';
import _ from 'lodash';
import type { PropsWithChildren } from 'react';
import React, { createContext, useEffect, useState } from 'react';

type Metar = string;

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
        getDocs(q).then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                setMetarsByIcaoCode(_.keyBy(doc.get('metars'), (m: string) => m.split(' ')[0]));
            });
        });
    }, []);

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
