import { pipe } from 'fp-ts/lib/function';
import * as Codec from 'io-ts/lib/Codec.js';
import type { CodecType } from '~/iots';
import { taggedVersionedClassCodec } from '~/iots';
import { AltHeightFl } from './AltHeightFl';

export class VorWpt {
    _tag = 'VorWpt' as const;
    _version = 1 as const;
    _props;

    ident;
    altHeightFl;
    qdr;
    distanceInNm;

    constructor(props: VorWptProps) {
        this._props = props;
        this.ident = props.ident;
        this.altHeightFl = props.altHeightFl;
        this.qdr = props.qdr;
        this.distanceInNm = props.distanceInNm;
    }

    static propsCodec = (codecType: CodecType) =>
        pipe(
            Codec.struct({
                ident: Codec.string,
                altHeightFl: Codec.nullable(AltHeightFl.codec(codecType)),
            }),
            Codec.intersect(
                Codec.partial({
                    qdr: Codec.number,
                    distanceInNm: Codec.number,
                }),
            ),
        );

    static codec = (codecType: CodecType) =>
        taggedVersionedClassCodec(this.propsCodec(codecType), this);
}

export type VorWptProps = Codec.TypeOf<ReturnType<typeof VorWpt.propsCodec>>;
