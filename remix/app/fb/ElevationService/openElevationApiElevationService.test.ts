import { openElevationApiElevationService } from './openElevationApiElevationService';

describe('openElevationApiElevationService', () => {
    it.skip('should return correct elevation for 2 points in the sea', async () => {
        const res = await openElevationApiElevationService.getElevationsForLatLngs([
            { lat: 42, lng: 2 },
            { lat: 43, lng: 2.1 },
            { lat: 43, lng: 2.2 },
        ]);
        expect(res).toEqual([0]);
    });
});
