import { pipe } from 'fp-ts/lib/function';
import * as Codec from 'io-ts/lib/Codec.js';
import type { CodecType } from '~/iots';
import { taggedVersionedClassCodec } from '~/iots';
import { latLngCodec } from '../LatLng';
import { uuidCodec } from '../Uuid';
import { AltHeightFl } from './AltHeightFl';

export class LatLngWpt {
    _tag = 'LatLngWpt' as const;
    _version = 1 as const;
    _props;

    id;
    latLng;
    name;
    altHeightFl;

    constructor(props: LatLngWptProps) {
        this._props = props;
        this.id = props.id;
        this.latLng = props.latLng;
        this.name = props.name;
        this.altHeightFl = props.altHeightFl;
    }

    static propsCodec = (codecType: CodecType) =>
        pipe(
            Codec.struct({
                id: uuidCodec, // TODO Implement IcaoCode codec
                latLng: latLngCodec,
                name: Codec.string,
                altHeightFl: AltHeightFl.codec(codecType),
            }),
        );

    static codec = (codecType: CodecType) =>
        taggedVersionedClassCodec(this.propsCodec(codecType), this);
}

export type LatLngWptProps = Codec.TypeOf<ReturnType<typeof LatLngWpt.propsCodec>>;
