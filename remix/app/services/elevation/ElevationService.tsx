import retry from 'async-retry';
import _ from 'lodash';
import memoize from 'memoizee';
import type { Response } from 'node-fetch';
import { requestOpenElevationChunkMemoized } from './requestOpenElevationChunkMemoized';
import { sha1 } from './sha1';

export type LatLng = [lat: number, lng: number];

const requestGoogleChunk = memoize(
    async (chunk: LatLng[]): Promise<any> => {
        return await fetch(
            `https://maps.googleapis.com/maps/api/elevation/json?key=${null}&locations=${chunk
                .map(([lat, lng]) => `${lat},${lng}`)
                .join('|')}`,
        )
            .then((res) => res.json())
            //@ts-ignore
            .then((json) => json.results.map((result) => result.elevation.toFixed(2)));
    },
    {
        promise: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        max: 100,
        normalizer: (args: [LatLng[]]) => sha1(args[0].join(',')),
    },
);

const requestOpenElevationChunkMemoizedWithRetry = async (chunk: LatLng[]) => {
    console.log('requesting', chunk.length);
    return await retry(async (bail) => await requestOpenElevationChunkMemoized(chunk), {
        retries: 3,
        minTimeout: 500,
        onRetry: () => console.log('retrying'),
    });
};

async function googleElevationService(latLngs: [lat: number, lng: number][]) {
    const chunks = _.chunk(latLngs, 300);
    console.log(chunks.map((c) => c.length));
    const dataSets = await Promise.all(chunks.map(requestGoogleChunk));

    return _.flatten(dataSets);
}

export async function openElevationApiElevationService(latLngs: [lat: number, lng: number][]) {
    const chunks = _.chunk(latLngs, 300);

    const dataSets = await Promise.all(
        chunks.map((chunk) => requestOpenElevationChunkMemoizedWithRetry(chunk)),
    );

    return _.flatten(dataSets);
}

class HTTPResponseError extends Error {
    response: Response;

    constructor(response: Response) {
        super(`HTTP Error Response: ${response.status} ${response.statusText}`);
        this.response = response;
    }
}

export const checkStatus = (response: Response) => {
    if (response.ok) {
        // response.status >= 200 && response.status < 300
        return response;
    } else {
        throw new HTTPResponseError(response);
    }
};
