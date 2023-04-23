import { pipe } from 'fp-ts/lib/function';
import * as Codec from 'io-ts/lib/Codec';
import * as Decoder from 'io-ts/lib/Decoder';
import type { AiracData, LatLng as SiaLatLng, Vor } from 'ts-aerodata-france';
import type { LatLng } from '../LatLng';
import { toLatLng } from '../LatLng';

type VorPointWaypointProps = {
    vorDme: Vor;
    altitude: number | null;
    qdr: number;
    distanceInNm: number;
};

export class VorPointWaypoint {
    readonly _vorDme;
    altitude: number | null;
    qdr;
    distanceInNm;

    constructor(props: VorPointWaypointProps) {
        this._vorDme = props.vorDme;
        this.altitude = props.altitude;
        this.qdr = props.qdr;
        this.distanceInNm = props.distanceInNm;
    }

    get latLng() {
        const vorDmePointLatLng = this._vorDme.latLng;
        const res = toLeafletLatLng(vorDmePointLatLng);
        return res;
    }

    get name() {
        return `${this._vorDme.name}`;
    }

    get id() {
        return this._vorDme.ident;
    }

    get vorDmePoint() {
        return this._vorDme;
    }

    static isVorPointWaypoint(waypoint: any): waypoint is VorPointWaypoint {
        return waypoint._vorDme !== undefined;
    }

    clone({
        vorDme = this._vorDme,
        altitude = this.altitude,
        distanceInNm = this.distanceInNm,
        qdr = this.qdr,
    }: Partial<VorPointWaypointProps> = {}) {
        return new VorPointWaypoint({
            vorDme,
            altitude,
            distanceInNm,
            qdr,
        });
    }

    static codec = (airacData: AiracData): Codec.Codec<unknown, SerialType, VorPointWaypoint> =>
        Codec.make(
            pipe(
                serialCodec,
                Decoder.compose({
                    decode: ({ id, altitude, distanceInNm, qdr }) =>
                        Decoder.success(
                            new VorPointWaypoint({
                                distanceInNm,
                                qdr,
                                vorDme: airacData.vors.find((v) => `${v.ident}` === id)!,
                                altitude,
                            }),
                        ),
                }),
            ),
            {
                encode: ({ id, altitude, qdr, distanceInNm }) => ({
                    id,
                    altitude,
                    qdr,
                    distanceInNm,
                }),
            },
        );
}

export const toLeafletLatLng = (vorDmePointLatLng: SiaLatLng): LatLng => {
    const latLng = toLatLng(vorDmePointLatLng);
    const res = { lat: latLng.lat, lng: latLng.lng };
    return res;
};

const serialCodec = Codec.struct({
    id: Codec.string,
    altitude: Codec.nullable(Codec.number),
    qdr: Codec.number,
    distanceInNm: Codec.number,
});

type SerialType = Codec.TypeOf<typeof serialCodec>;
