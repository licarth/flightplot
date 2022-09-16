import { pipe } from 'fp-ts/lib/function';
import * as Codec from 'io-ts/lib/Codec';
import * as D from 'io-ts/lib/Decoder';
import type { LatLng } from '../LatLng';
import { latLngCodec } from '../LatLng';
import type { WaypointProps } from './Waypoint';
export class LatLngWaypoint {
    protected _latLng;
    public name;
    public altitude: number | null;
    private _id: string;

    constructor({ latLng, name, id, altitude }: WaypointProps) {
        this._latLng = latLng;
        this.name = name;
        this.altitude = altitude;
        this._id = id;
    }

    static create(props: WaypointProps) {
        return new LatLngWaypoint(props);
    }

    clone({
        id = this._id,
        latLng = this._latLng,
        name = this.name,
        altitude = this.altitude,
    }: Partial<WaypointProps> = {}) {
        return new LatLngWaypoint({
            latLng,
            name,
            id,
            altitude,
        });
    }

    get latLng() {
        return this._latLng;
    }

    get id() {
        return this._id;
    }

    set latLng(latLng: LatLng) {
        this._latLng = latLng;
    }
}

const newLocal = Codec.struct({
    id: Codec.string,
    latLng: latLngCodec,
    altitude: Codec.nullable(Codec.number),
    name: Codec.nullable(Codec.string),
});

export const latLngWaypointCodec: Codec.Codec<unknown, WaypointProps, LatLngWaypoint> = Codec.make(
    pipe(
        newLocal,
        D.map((props) => new LatLngWaypoint(props)),
    ),
    {
        encode: ({ altitude, id, latLng, name }: LatLngWaypoint) => ({
            altitude,
            id,
            latLng,
            name,
        }),
    },
);
