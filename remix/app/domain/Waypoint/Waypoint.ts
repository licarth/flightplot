import * as Codec from 'io-ts/lib/Codec';
import * as Decoder from 'io-ts/lib/Decoder';
import type { Aerodrome, AiracData, VfrPoint, Vor } from 'ts-aerodata-france';
import { v4 as uuidv4 } from 'uuid';
import type { LatLng } from '../LatLng';
import { AerodromeWaypoint, AerodromeWaypointType } from './AerodromeWaypoint';
import { LatLngWaypoint, latLngWaypointCodec } from './LatLngWaypoint';
import { VfrPointWaypoint } from './VfrPointWaypoint';
import { VorPointWaypoint } from './VorPointWaypoint';

export type WaypointProps = {
    latLng: LatLng;
    name: string | null;
    id: string;
    altitude: number | null;
};

// export interface Waypoint {
//   latLng: LatLng;
//   name: string | null;
//   id: string;
//   altitude: number | null;
//   clone: (props: Partial<WaypointProps>) => Waypoint;
// }

export type Waypoint = AerodromeWaypoint | LatLngWaypoint | VfrPointWaypoint | VorPointWaypoint;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace Waypoint {
    export const create = (props: Omit<WaypointProps, 'id'>) => {
        return new LatLngWaypoint({ ...props, id: uuidv4() });
    };
    export const fromAerodrome = ({
        aerodrome,
        waypointType = AerodromeWaypointType.RUNWAY,
    }: {
        aerodrome: Aerodrome;
        waypointType: AerodromeWaypointType;
    }) => {
        return new AerodromeWaypoint({
            aerodrome,
            waypointType,
            altitude: null,
        });
    };
    export const fromVfrPoint = ({ vfrPoint }: { vfrPoint: VfrPoint }) => {
        return new VfrPointWaypoint({
            vfrPoint,
            altitude: null,
        });
    };
    export const fromVorDme = ({
        vorDme,
        distanceInNm = 0,
        qdr = 0,
    }: {
        vorDme: Vor;
        distanceInNm?: VorPointWaypoint['distanceInNm'];
        qdr?: VorPointWaypoint['qdr'];
    }) => {
        return new VorPointWaypoint({
            vorDme,
            altitude: null,
            distanceInNm,
            qdr,
        });
    };
}

export const waypointCodec = (airacData: AiracData) =>
    Codec.make(
        Decoder.union(
            latLngWaypointCodec,
            AerodromeWaypoint.codec(airacData),
            VfrPointWaypoint.codec(airacData),
            VorPointWaypoint.codec(airacData),
        ),
        {
            encode: (a) => {
                if (AerodromeWaypoint.isAerodromeWaypoint(a)) {
                    return AerodromeWaypoint.codec(airacData).encode(a);
                } else if (VfrPointWaypoint.isVfrPointWaypoint(a)) {
                    return VfrPointWaypoint.codec(airacData).encode(a);
                } else if (VorPointWaypoint.isVorPointWaypoint(a)) {
                    return VorPointWaypoint.codec(airacData).encode(a);
                } else {
                    return latLngWaypointCodec.encode(a);
                }
            },
        },
    );
