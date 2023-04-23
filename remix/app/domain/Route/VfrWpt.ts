import { pipe } from 'fp-ts/lib/function';
import * as Codec from 'io-ts/lib/Codec.js';
import type { CodecType } from '~/iots';
import { taggedVersionedClassCodec } from '~/iots';
import { AltHeightFl } from './AltHeightFl';

export class VfrWpt {
    _tag = 'VfrWpt' as const;
    _version = 1 as const;
    _props;

    icaoCode;
    ident;
    altHeightFl;

    constructor(props: VfrWptProps) {
        this._props = props;
        this.icaoCode = props.icaoCode;
        this.ident = props.ident;
        this.altHeightFl = props.altHeightFl;
    }

    static propsCodec = (codecType: CodecType) =>
        pipe(
            Codec.struct({
                icaoCode: Codec.string, // TODO Implement IcaoCode codec
                ident: Codec.string,
                altHeightFl: Codec.nullable(AltHeightFl.codec(codecType)),
            }),
        );

    static codec = (codecType: CodecType) =>
        taggedVersionedClassCodec(this.propsCodec(codecType), this);
}

export type VfrWptProps = Codec.TypeOf<ReturnType<typeof VfrWpt.propsCodec>>;
