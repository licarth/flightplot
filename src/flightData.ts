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

export const getFlightData = (fileName: string) => {
  const parser = new Parser();
  return pipe(
    TE.tryCatch(
      () => fetch(`/flightplot/flights/${fileName}`),
      (reason) => new Error(`Could not fetch: ${reason}`),
    ),
    TE.chain((file) =>
      TE.tryCatch(
        () => file.text(),
        () => new Error("Could not parse as text"),
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
    TE.map(([_headers, ...lines]) => lines.slice(4500, 8000)),
    TE.chainW(
      FPArray.traverse(TE.taskEither)(
        flow(gpsRecordDecoder.decode, TE.fromEither),
      ),
    ),
    TE.map((x) =>
      x.map(({ latitude, longitude }) => [latitude, longitude] as LatLngTuple),
    ),
  );
};
