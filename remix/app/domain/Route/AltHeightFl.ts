import { pipe } from 'fp-ts/lib/function';
import * as C from 'io-ts/lib/Codec.js';
import type { CodecType } from '~/iots';
import { taggedVersionedClassCodec } from '~/iots';

export namespace AltHeightFl {
    export const codec = (codecType: CodecType) =>
        C.sum('_tag')({
            AltitudeInFeet: AltitudeInFeet.codec(codecType),
        });
}

export type AltHeightFl = C.TypeOf<typeof AltHeightFl.codec>;

export class AltitudeInFeet {
    _tag = 'AltitudeInFeet' as const;
    _version = 1 as const;
    _props;

    altitudeInFeet;

    constructor(props: AltitudeInFeetProps) {
        this._props = props;
        this.altitudeInFeet = props.altitudeInFeet;
    }

    static of = (altitudeInFeet: number) => new AltitudeInFeet({ altitudeInFeet });

    static propsCodec = (codecType: CodecType) =>
        pipe(
            C.struct({
                altitudeInFeet: C.number, // TODO Implement IcaoCode codec
            }),
        );

    static codec = (codecType: CodecType) =>
        taggedVersionedClassCodec(this.propsCodec(codecType), this);
}

export type AltitudeInFeetProps = C.TypeOf<ReturnType<typeof AltitudeInFeet.propsCodec>>;
