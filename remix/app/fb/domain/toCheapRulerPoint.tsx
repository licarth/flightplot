import { LatLng } from '../LatLng';

export const toCheapRulerPoint = (latLng: LatLng): [number, number] => [latLng.lng, latLng.lat];
