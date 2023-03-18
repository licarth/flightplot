import { collection, getFirestore, onSnapshot, query, where } from 'firebase/firestore';
import _ from 'lodash';
import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { PjeNotam, RtbaNotam } from '~/domain/Notam/RichNotam/RichNotam';
import { isZoneActivationNotam } from '~/domain/Notam/RichNotam/RichNotam';
import { isPjeNotam } from '~/domain/Notam/RichNotam/RichNotam';
import { isRtbaNotam } from '~/domain/Notam/RichNotam/RichNotam';
import { useAiracData } from '../components/useAiracData';
import { decodeNotamDocsForToday } from './decodeNotamDocsForToday';

export type RtbaActivation = {
    activeZone: RtbaNotam['zones'][number];
    notam: RtbaNotam;
};

export type PjeActivation = {
    notam: PjeNotam;
};

export const isCurrentlyActive = (activation: RtbaActivation) => {
    const now = new Date();
    return (
        now.getTime() >= activation.activeZone.startDate.getTime() &&
        now.getTime() <= activation.activeZone.endDate.getTime()
    );
};

export const RtbaZonesContext = createContext<{
    activeRestrictedAreasNext24h: RtbaActivation[];
    activePjeNext24h: PjeActivation[];
}>({
    activeRestrictedAreasNext24h: [],
    activePjeNext24h: [],
});

export const RtbaZonesProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { airacData } = useAiracData();
    const [activeRestrictedAreasNext24h, setActiveRestrictedAreasNext24h] = useState<
        RtbaActivation[]
    >([]);

    const [activePjeNext24h, setActivePjeNext24h] = useState<PjeActivation[]>([]);

    const [enabled] = useState(true);

    useEffect(() => {
        const db = getFirestore();
        const notamsRef = collection(db, 'notams');

        // See https://github.com/firebase/firebase-js-sdk/issues/212#issuecomment-338046703
        // We have to fetch all documents (2 queries) and filter them in the client, which is incredibly expensive
        // We should query them on the server side and return only the relevant documents here.

        if (enabled && airacData) {
            const q = query(notamsRef, where('code1234', 'in', ['WPLW', 'RRCA']));
            return onSnapshot(q, { includeMetadataChanges: false }, (querySnapshot) => {
                const docs = decodeNotamDocsForToday(querySnapshot.docs, airacData).map(
                    (n) => n.richNotam,
                );

                const pjeActivations: PjeActivation[] = _.flatMap(
                    docs.map((pjeNotam) => {
                        if (pjeNotam && isPjeNotam(pjeNotam)) {
                            console.log('pjeNotam', pjeNotam);
                            return [{ notam: pjeNotam } as PjeActivation];
                        } else {
                            return [];
                        }
                    }),
                );
                const rtbaActivations: RtbaActivation[] = _.flatMap(
                    docs.map((rtbaNotam) => {
                        if (
                            rtbaNotam &&
                            (isRtbaNotam(rtbaNotam) || isZoneActivationNotam(rtbaNotam))
                        ) {
                            return rtbaNotam.zones.map((zone) => {
                                return {
                                    activeZone: zone,
                                    notam: rtbaNotam,
                                } as RtbaActivation;
                            });
                        } else {
                            return [];
                        }
                    }),
                );
                setActiveRestrictedAreasNext24h(rtbaActivations);
                setActivePjeNext24h(pjeActivations);
            });
        } else {
            setActiveRestrictedAreasNext24h([]);
            setActivePjeNext24h([]);
        }
    }, [enabled, airacData]);

    return (
        <RtbaZonesContext.Provider
            value={{
                activeRestrictedAreasNext24h,
                activePjeNext24h,
            }}
        >
            {children}
        </RtbaZonesContext.Provider>
    );
};

export const useRtbaZones = () => {
    return useContext(RtbaZonesContext);
};
