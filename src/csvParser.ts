import Parser, { Row } from "@gregoranders/csv";
import * as FPArray from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import { flow, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as Decoder from "io-ts/lib/Decoder";
import { LatLngTuple } from "leaflet";

type GpsRecord = {
  // type: ,
  // date time: ,
  latitude: number;
  longitude: number;
  // accuracy: ,
  altitude: number;
  // geoid_height: number;
  // speed: number;
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
      altitude: Number(row[5]),
    }),
};

export const parseFile = (
  fileName: string,
): TE.TaskEither<any, LatLngTuple[]> => {
  const parser = new Parser();
  return pipe(
    TE.tryCatch(
      () => fetch(`/${fileName}`),
      (reason) => new Error(`Could not fetch: ${reason}`),
    ),
    TE.chain((file) =>
      TE.tryCatch(
        () => file.text(),
        () => new Error("Could not parse as text"),
      ),
    ),
    TE.map((text) => parser.parse(text)),
    TE.map(([_headers, ...lines]) => lines.slice(4500, 8000)),
    TE.chainW(TEOfmapOfGpsRecord),
    TE.map((x) => x.map(({ latitude, longitude }) => [latitude, longitude])),
    // TE.map((x) => {
      // console.log(x);
    //   return [[1, 1]];
    // }),
  );
};
const TEOfmapOfGpsRecord = FPArray.traverse(TE.taskEither)(
  flow(gpsRecordDecoder.decode, TE.fromEither),
);
