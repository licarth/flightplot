import type { Row } from '@gregoranders/csv';
import Parser from '@gregoranders/csv';
import parse from 'date-fns/parse';
import * as FPArray from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import { flow, pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import type * as Decoder from 'io-ts/lib/Decoder';

export type GpsRecord = {
    // type: ,
    datetime: Date;
    latitude: number;
    longitude: number;
    // accuracy: ,
    altitude: number;
    // geoid_height: number;
    speed: number;
    // bearing: number;
    // sat_used: ,
    // sat_inview: ,
    // name: ,
    // desc
};

const gpsRecordDecoder: Decoder.Decoder<Row, GpsRecord> = {
    decode: (row) =>
        E.right({
            latitude: Number(row[2]),
            longitude: Number(row[3]),
            altitude: Number(row[5]) * 3.28,
            speed: (Number(row[7]) * 3.6) / 1.852,
            datetime: parse(row[1], 'yyyy-MM-dd HH:mm:ss', new Date()),
        }),
};

export const getFlightData = ({
    file,
    start,
    end,
}: {
    file: string;
    start?: number;
    end?: number;
}) => {
    const parser = new Parser();
    return pipe(
        TE.tryCatch(
            () => fetch(`/flightplot/flights/${file}`),
            (reason) => new Error(`Could not fetch: ${reason}`),
        ),
        TE.chain((file) =>
            TE.tryCatch(
                () => file.text(),
                () => new Error('Could not parse as text'),
            ),
        ),
        TE.chain((text) =>
            TE.fromEither(
                E.tryCatch(
                    () => parser.parse(text),
                    (e) => new Error(`Parser.parse() failed: ${e}`),
                ),
            ),
        ),
        TE.map(([_headers, ...lines]) =>
            lines.slice(start ? start : 0, end ? end : lines.length - 1),
        ),
        TE.chainW(FPArray.traverse(TE.taskEither)(flow(gpsRecordDecoder.decode, TE.fromEither))),
        // TE.map((x) =>
        //   x.map(({ latitude, longitude }) => [latitude, longitude] as LatLngTuple),
        // ),
    );
};
