import * as Codec from 'io-ts/Codec';
import * as Decoder from 'io-ts/Decoder';

/**
 * @deprecated
 */
export const fromClassCodec = <S, T extends S>(type: new (s: S) => T): Codec.Codec<S, S, T> =>
    Codec.fromDecoder({ decode: (props: S) => Decoder.success(new type(props)) });
