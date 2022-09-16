import type { LatLng } from '../../domain/LatLng';

export interface ElevationService {
    getElevationsForLatLngs(latLngs: LatLng[]): Promise<number[]>;
}
