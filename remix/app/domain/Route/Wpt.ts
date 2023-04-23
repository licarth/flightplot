import * as C from 'io-ts/lib/Codec.js';
import type { Aerodrome, VfrPoint, Vor } from 'ts-aerodata-france';
import type { CodecType } from '~/iots';
import { UUID } from '../Uuid';
import { AerodromeWaypointType } from '../Waypoint';
import { AerodromeWpt } from './AerodromeWpt';
import type { LatLngWptProps } from './LatLngWpt';
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

    export const create = (props: Omit<LatLngWptProps, 'id'>) => {
        return new LatLngWpt({ ...props, id: UUID.generatev4() });
    };
    export const fromAerodrome = ({
        aerodrome,
        waypointType = AerodromeWaypointType.RUNWAY,
    }: {
        aerodrome: Aerodrome;
        waypointType: AerodromeWaypointType;
    }) => {
        return new AerodromeWpt({
            icaoCode: `${aerodrome.icaoCode}`,
            waypointType,
            altHeightFl: null,
        });
    };
    export const fromVfrPoint = ({ vfrPoint }: { vfrPoint: VfrPoint }) => {
        return new VfrWpt({
            ident: vfrPoint.id,
            icaoCode: `${vfrPoint.icaoCode}`,
            altHeightFl: null,
        });
    };
    export const fromVorDme = ({
        vorDme,
        distanceInNm = 0,
        qdr = 0,
    }: {
        vorDme: Vor;
        distanceInNm?: VorWpt['distanceInNm'];
        qdr?: VorWpt['qdr'];
    }) => {
        return new VorWpt({
            ident: vorDme.ident,
            altHeightFl: null,
            distanceInNm,
            qdr,
        });
    };
}

export type Wpt = C.TypeOf<typeof Wpt.codec>;
