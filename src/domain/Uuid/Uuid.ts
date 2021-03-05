import * as Either from "fp-ts/lib/Either";
import { flow, pipe } from "fp-ts/lib/function";
import * as Codec from "io-ts/lib/Codec";
import * as Decoder from "io-ts/lib/Decoder";
import { validate } from "uuid";

export class UUID {
  private value;

  constructor(value: string) {
    this.value = value;
  }

  static parse: (value: string) => Either.Either<Error, UUID> = flow(
    Either.fromPredicate(
      validate,
      (value) => new Error(`Uuid ${value} is not a valid uuid.`),
    ),
    Either.map((validValue) => new UUID(validValue)),
  );
}

export const uuidCodec = pipe(
  Codec.string,
  Codec.compose(
    Codec.make<string, string, UUID>(
      {
        decode: (value) =>
          pipe(
            value,
            UUID.parse,
            Either.fold(
              (err) => Decoder.failure(value, err.message),
              (ip) => Decoder.success(ip),
            ),
          ),
      },
      { encode: (ip) => ip.toString() },
    ),
  ),
);
