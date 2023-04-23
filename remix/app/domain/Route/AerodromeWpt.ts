import { pipe } from 'fp-ts/lib/function';
import * as Codec from 'io-ts/lib/Codec.js';
import type { CodecType } from '~/iots';
import { taggedVersionedClassCodec } from '~/iots';
import { AltHeightFl } from './AltHeightFl';

export class AerodromeWpt {
    _tag = 'AerodromeWpt' as const;
    _version = 1 as const;
    _props;

    icaoCode;
    altHeightFl;
    waypointType;

    constructor(props: AerodromeWptProps) {
        this._props = props;
        this.icaoCode = props.icaoCode;
        this.altHeightFl = props.altHeightFl;
        this.waypointType = props.waypointType;
    }

    static propsCodec = (codecType: CodecType) =>
        pipe(
            Codec.struct({
                icaoCode: Codec.string, // TODO Implement IcaoCode codec
                altHeightFl: Codec.nullable(AltHeightFl.codec(codecType)),
                waypointType: Codec.literal('OVERFLY', 'RUNWAY'),
            }),
        );

    static codec = (codecType: CodecType) =>
        taggedVersionedClassCodec(this.propsCodec(codecType), this);
}

export type AerodromeWptProps = Codec.TypeOf<ReturnType<typeof AerodromeWpt.propsCodec>>;
