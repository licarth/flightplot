import { format } from 'date-fns';
import { collection, getFirestore, onSnapshot, query, where } from 'firebase/firestore';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { draw } from 'io-ts/lib/Decoder';
import _ from 'lodash';
import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Notam } from '~/domain/Notam/Notam';
import type { RtbaNotam } from '~/domain/Notam/RichNotam/RichNotam';
import { isPjeNotam, RichNotam } from '~/domain/Notam/RichNotam/RichNotam';
import { useAiracData } from '../components/useAiracData';

export type RtbaActivation = {
    activeZone: RtbaNotam['zones'][number];
    rtbaNotam: RtbaNotam;
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
}>({
    activeRestrictedAreasNext24h: [],
});

export const RtbaZonesProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { airacData } = useAiracData();
    const [activeRestrictedAreasNext24h, setActiveRestrictedAreasNext24h] = useState<
        RtbaActivation[]
    >([]);

    const [enabled] = useState(true);

    // Call firebase to query documents in notam collection
    useEffect(() => {
        const db = getFirestore();
        const notamsRef = collection(db, 'notams');

        // See https://github.com/firebase/firebase-js-sdk/issues/212#issuecomment-338046703
        // We have to fetch all documents (2 queries) and filter them in the client, which is incredibly expensive
        // We should query them on the server side and return only the relevant documents here.

        if (enabled && airacData) {
            const q = query(notamsRef, where('subject', '==', 'RR'), where('modifier', '==', 'CA'));
            return onSnapshot(q, { includeMetadataChanges: false }, (querySnapshot) => {
                const docs = querySnapshot.docs.flatMap((doc) => {
                    const notam = pipe(
                        doc.data().rawNotam,
                        Notam.decoder.decode,
                        E.chain(RichNotam.decoder(airacData).decode),
                        E.getOrElseW((e) => {
                            console.error(draw(e));
                            return null;
                        }),
                    );
                    // if (notam?.n.e.includes('R139')) {
                    //     console.log(notam);
                    // }
                    if (
                        !notam ||
                        !notam.n.isActiveOnDay(format(new Date(), 'yyyyMMdd')) ||
                        isPjeNotam(notam)
                    ) {
                        return [];
                    }
                    return notam;
                });

                const activations: RtbaActivation[] = _.flatMap(
                    docs.map((rtbaNotam) => {
                        if (rtbaNotam) {
                            return rtbaNotam.zones.map((zone) => {
                                return {
                                    activeZone: zone,
                                    rtbaNotam,
                                } as RtbaActivation;
                            });
                        } else {
                            return [];
                        }
                    }),
                );

                setActiveRestrictedAreasNext24h(activations);
            });
        } else {
            setActiveRestrictedAreasNext24h([]);
        }
    }, [enabled, airacData]);

    return (
        <RtbaZonesContext.Provider
            value={{
                activeRestrictedAreasNext24h,
            }}
        >
            {children}
        </RtbaZonesContext.Provider>
    );
};

export const useRtbaZones = () => {
    return useContext(RtbaZonesContext);
};
