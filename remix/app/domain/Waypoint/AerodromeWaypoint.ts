import { pipe } from 'fp-ts/lib/function';
import * as Codec from 'io-ts/lib/Codec';
import * as Decoder from 'io-ts/lib/Decoder';
import type { Aerodrome, AiracData, LatLng as SiaLatLng } from 'ts-aerodata-france';
import { AltitudeInFeet, IcaoCode } from 'ts-aerodata-france';
import { fromEnumCodec } from '../../iots/enum';
import type { LatLng } from '../LatLng';
import { toLatLng } from '../LatLng';
export type AerodromeWaypointId = IcaoCode;

export enum AerodromeWaypointType {
    OVERFLY = 'OVERFLY',
    RUNWAY = 'RUNWAY',
}

type AerodromeWaypointProps = {
    aerodrome: Aerodrome;
    waypointType: AerodromeWaypointType;
    altitude: number | null;
};

export class AerodromeWaypoint {
    private readonly _aerodrome;
    private _altitude: number | null;
    readonly waypointType;

    constructor({ aerodrome, waypointType, altitude }: AerodromeWaypointProps) {
        this._aerodrome = aerodrome;
        this.waypointType = waypointType;
        this._altitude = altitude;
    }

    get latLng() {
        const aerodromeLatLng = this._aerodrome.latLng;
        const res = toLeafletLatLng(aerodromeLatLng);
        return res;
    }

    get name() {
        return IcaoCode.getValue(this._aerodrome.icaoCode);
    }

    get id() {
        return `${this._aerodrome.icaoCode}`;
    }

    get aerodrome() {
        return this._aerodrome;
    }

    get altitude() {
        return this.waypointType === AerodromeWaypointType.OVERFLY
            ? this._altitude
            : AltitudeInFeet.getValue(this.aerodrome.aerodromeAltitude);
    }

    set altitude(altitude: number | null) {
        this._altitude = altitude;
    }

    static isAerodromeWaypoint(waypoint: any): waypoint is AerodromeWaypoint {
        return waypoint._aerodrome !== undefined;
    }

    clone({
        aerodrome = this._aerodrome,
        waypointType = this.waypointType,
        altitude = this._altitude,
    }: Partial<AerodromeWaypointProps> = {}) {
        return new AerodromeWaypoint({
            aerodrome,
            waypointType,
            altitude,
        });
    }

    static codec = (airacData: AiracData): Codec.Codec<unknown, SerialType, AerodromeWaypoint> =>
        Codec.make(
            pipe(
                serialCodec,
                Decoder.compose({
                    decode: ({ icaoCode, altitude, waypointType }) =>
                        Decoder.success(
                            new AerodromeWaypoint({
                                aerodrome: airacData.getAerodromeByIcaoCode(icaoCode),
                                altitude,
                                waypointType,
                            }),
                        ),
                }),
            ),
            {
                encode: ({ aerodrome, _altitude, waypointType }) => ({
                    icaoCode: `${aerodrome.icaoCode}`,
                    altitude: _altitude,
                    waypointType,
                }),
            },
        );
}

export const toLeafletLatLng = (aerodromeLatLng: SiaLatLng): LatLng => {
    const latLng = toLatLng(aerodromeLatLng);
    const res = { lat: latLng.lat, lng: latLng.lng };
    return res;
};

const serialCodec = Codec.struct({
    icaoCode: Codec.string,
    altitude: Codec.nullable(Codec.number),
    waypointType: fromEnumCodec('AerodromeWaypointType', AerodromeWaypointType),
});

type SerialType = Codec.TypeOf<typeof serialCodec>;
