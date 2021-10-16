import { LatLng } from "../LatLng";

export interface ElevationService {
  getElevationsForLatLngs(latLngs: LatLng[]): Promise<number[]>;
}
