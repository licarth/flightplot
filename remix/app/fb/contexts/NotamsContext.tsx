import { collection, getFirestore, onSnapshot, query, where } from 'firebase/firestore';
import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { PjeNotam, RtbaNotam } from '~/domain/Notam/RichNotam/RichNotam';
import { useAiracData } from '../components/useAiracData';
import { decodeNotamDocsForToday } from './decodeNotamDocsForToday';

export type RtbaActivation = {
    activeZone: RtbaNotam['zones'][number];
    notam: RtbaNotam;
};

export type PjeActivation = {
    notam: PjeNotam;
};

type NotamObjectType = ReturnType<typeof decodeNotamDocsForToday>[number];

export const NotamsContext = createContext<{
    notams: NotamObjectType[];
}>({
    notams: [],
});

export const NotamsProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { airacData } = useAiracData();

    const [notams, setNotams] = useState<NotamObjectType[]>([]);

    const [enabled] = useState(true);

    useEffect(() => {
        const db = getFirestore();
        const notamsRef = collection(db, 'notams');

        if (enabled && airacData) {
            const q = query(
                notamsRef,
                // where('code1234', 'in', ['WPLW', 'RRCA'])
            );
            return onSnapshot(q, { includeMetadataChanges: false }, (querySnapshot) => {
                setNotams(decodeNotamDocsForToday(querySnapshot.docs, airacData));
            });
        } else {
            setNotams([]);
        }
    }, [enabled, airacData]);

    return (
        <NotamsContext.Provider
            value={{
                notams,
            }}
        >
            {children}
        </NotamsContext.Provider>
    );
};

export const useNotams = () => {
    return useContext(NotamsContext);
};
