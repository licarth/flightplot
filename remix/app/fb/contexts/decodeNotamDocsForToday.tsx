import { format } from 'date-fns';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import type { DecodeError } from 'io-ts/lib/Decoder';
import type { AiracData } from 'ts-aerodata-france';
import { Notam } from '~/domain/Notam/Notam';
import { RichNotam } from '~/domain/Notam/RichNotam/RichNotam';

export const decodeNotamDocsForToday = (docs: QueryDocumentSnapshot[], airacData: AiracData) => {
    return docs.flatMap((doc) => {
        const notamObject = pipe(
            E.of({ rawNotam: doc.data().rawNotam }),
            E.bindW('notam', (o) => Notam.decoder.decode(o.rawNotam)),
            E.bindW(
                'richNotam',
                (o) =>
                    pipe(
                        o.notam,
                        RichNotam.decoder(airacData).decode,
                        E.getOrElseW((e) => E.right(null)),
                    ) as E.Either<DecodeError, RichNotam | null>,
            ),
            E.getOrElseW(() => ({
                notam: null,
            })),
        );

        const { notam } = notamObject;
        if (!notam || !notam.isActiveOnDay(format(new Date(), 'yyyyMMdd'))) {
            return [];
        }
        return notamObject;
    });
};
