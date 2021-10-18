import { Latitude, Longitude } from "ts-aerodata-france";
import * as Codec from "io-ts/lib/Codec";

export type LatLng = { lat: number; lng: number };

export const toLatLng = (latLng: { lat: Latitude; lng: Longitude }) => ({
  lat: latLng.lat as unknown as number,
  lng: latLng.lng as unknown as number,
});

export const latLngCodec = Codec.type({
  lat: Codec.number,
  lng: Codec.number,
});
