import { addHours, format, subHours } from 'date-fns';
import { collection, getFirestore, onSnapshot, query, where } from 'firebase/firestore';
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import React, { createContext, useContext } from 'react';
import type { DangerZone } from 'ts-aerodata-france';
import { pipe } from 'fp-ts/lib/function';
import { Notam } from '~/domain/Notam/Notam';
import type { RtbaNotam } from '~/domain/Notam/RichNotam/RichNotam';
import { foldRichNotam, RichNotam } from '~/domain/Notam/RichNotam/RichNotam';
import { useAiracData } from '../components/useAiracData';
import * as E from 'fp-ts/lib/Either';
import _ from 'lodash';

type RtbaActivation = {
    zone: DangerZone;
    rtbaNotam: RtbaNotam;
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
        const metarsRef = collection(db, 'notams');

        // See https://github.com/firebase/firebase-js-sdk/issues/212#issuecomment-338046703
        // We have to fetch all documents (2 queries) and filter them in the client, which is incredibly expensive
        // We should query them on the server side and return only the relevant documents here.

        if (enabled && airacData) {
            const q = query(metarsRef, where('subject', '==', 'RR'), where('modifier', '==', 'CA'));
            return onSnapshot(q, { includeMetadataChanges: false }, (querySnapshot) => {
                const docs = querySnapshot.docs.map((doc) => {
                    return pipe(
                        doc.data().rawNotam,
                        Notam.decoder.decode,
                        E.chain(RichNotam.decoder(airacData).decode),
                        E.map(
                            foldRichNotam({
                                pje: (pjeNotam) => {},
                                rtba: (richNotam) => {
                                    const day = format(richNotam.n.b.date!, 'yyyy-MM-dd');
                                    console.log(day);
                                    // if (day === format(new Date(), 'yyyy-MM-dd')) {
                                    //     return null;
                                    // }
                                    return richNotam;
                                },
                            }),
                        ),
                        E.foldW(
                            () => null,
                            (n) => {
                                console.log(n);
                                return n;
                            },
                        ),
                    );
                });
                const activations: RtbaActivation[] = _.flatMap(
                    docs.map((rtbaNotam) => {
                        if (rtbaNotam) {
                            return rtbaNotam.zones.map((zone) => {
                                return {
                                    zone: zone.zone,
                                    rtbaNotam: rtbaNotam,
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
