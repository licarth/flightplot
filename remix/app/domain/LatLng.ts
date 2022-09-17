import * as Codec from 'io-ts/lib/Codec';
import type { Latitude, Longitude } from 'ts-aerodata-france';

export type LatLng = { lat: number; lng: number };

export const toLatLng = (latLng: { lat: Latitude; lng: Longitude }) => ({
    lat: latLng.lat as unknown as number,
    lng: latLng.lng as unknown as number,
});

export const latLngCodec = Codec.struct({
    lat: Codec.number,
    lng: Codec.number,
});
