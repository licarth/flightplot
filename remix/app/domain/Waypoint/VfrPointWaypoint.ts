import { pipe } from 'fp-ts/lib/function';
import * as Codec from 'io-ts/lib/Codec';
import * as Decoder from 'io-ts/lib/Decoder';
import type { AiracData, LatLng as SiaLatLng, VfrPoint } from 'ts-aerodata-france';
import type { LatLng } from '../LatLng';
import { toLatLng } from '../LatLng';

type VfrPointWaypointProps = {
    vfrPoint: VfrPoint;
    altitude: number | null;
};

export class VfrPointWaypoint {
    private readonly _vfrPoint;
    altitude: number | null;

    constructor({ vfrPoint, altitude }: VfrPointWaypointProps) {
        this._vfrPoint = vfrPoint;
        this.altitude = altitude;
    }

    get latLng() {
        const vfrPointLatLng = this._vfrPoint.latLng;
        const res = toLeafletLatLng(vfrPointLatLng);
        return res;
    }

    get name() {
        return `${this._vfrPoint.name}`;
    }

    get id() {
        return this._vfrPoint.id;
    }

    get vfrPoint() {
        return this._vfrPoint;
    }

    static isVfrPointWaypoint(waypoint: any): waypoint is VfrPointWaypoint {
        return waypoint._vfrPoint !== undefined;
    }

    clone({
        vfrPoint = this._vfrPoint,
        altitude = this.altitude,
    }: Partial<VfrPointWaypointProps> = {}) {
        return new VfrPointWaypoint({
            vfrPoint,
            altitude,
        });
    }

    static codec = (airacData: AiracData): Codec.Codec<unknown, SerialType, VfrPointWaypoint> =>
        Codec.make(
            pipe(
                serialCodec,
                Decoder.compose({
                    decode: ({ id, altitude }) =>
                        Decoder.success(
                            new VfrPointWaypoint({
                                vfrPoint: airacData.vfrPoints.find(
                                    (v) => `${v.icaoCode}/${v.name}` === id,
                                )!,
                                altitude,
                            }),
                        ),
                }),
            ),
            {
                encode: ({ vfrPoint, altitude }) => ({
                    id: `${vfrPoint.id}`,
                    altitude: altitude,
                }),
            },
        );
}

export const toLeafletLatLng = (vfrPointLatLng: SiaLatLng): LatLng => {
    const latLng = toLatLng(vfrPointLatLng);
    const res = { lat: latLng.lat, lng: latLng.lng };
    return res;
};

const serialCodec = Codec.struct({
    id: Codec.string,
    altitude: Codec.nullable(Codec.number),
});

type SerialType = Codec.TypeOf<typeof serialCodec>;
