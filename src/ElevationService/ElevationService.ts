export type LatLng = { lat: number; lng: number };

export interface ElevationService {
  getElevationsForLatLngs(latLngs: LatLng[]): Promise<number[]>;
}
