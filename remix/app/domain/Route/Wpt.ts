import * as C from 'io-ts/lib/Codec.js';
import type { CodecType } from '~/iots';
import { AerodromeWpt } from './AerodromeWpt';
import { LatLngWpt } from './LatLngWpt';
import { VfrWpt } from './VfrWpt';
import { VorWpt } from './VorWpt';

export namespace Wpt {
    export const codec = (codecType: CodecType) =>
        C.sum('_tag')({
            AerodromeWpt: AerodromeWpt.codec(codecType),
            LatLngWpt: LatLngWpt.codec(codecType),
            VfrWpt: VfrWpt.codec(codecType),
            VorWpt: VorWpt.codec(codecType),
        });
}

export type Wpt = C.TypeOf<typeof Wpt.codec>;
