import retry from 'async-retry';
import _ from 'lodash';
import { requestOpenElevationChunkMemoized } from './requestOpenElevationChunkMemoized';

export type LatLng = [lat: number, lng: number];

const requestOpenElevationChunkMemoizedWithRetry = async (chunk: LatLng[]) => {
    return await retry(async (bail) => await requestOpenElevationChunkMemoized(chunk), {
        retries: 3,
        minTimeout: 500,
        onRetry: () => console.log('retrying'),
    });
};

export async function openElevationApiElevationService(
    latLngs: [lat: number, lng: number][],
): Promise<any> {
    const chunks = _.chunk(latLngs, 300);

    const dataSets = await Promise.all(
        chunks.map((chunk) => requestOpenElevationChunkMemoizedWithRetry(chunk)),
    );

    return _.flatten(dataSets);
}

export const log = () => '';
