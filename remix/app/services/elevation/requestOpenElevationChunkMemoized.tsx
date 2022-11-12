import memoize from 'memoizee';
import type { Response as NodeFetchResponse } from 'node-fetch';
import type { LatLng } from './ElevationService.server';
import { sha1 } from './sha1';

type Result = {
    latitude: number;
    longitude: number;
    elevation: number;
};

const requestOpenElevationChunk = async (chunk: LatLng[]): Promise<any> => {
    try {
        const response = await fetch(`https://api.open-elevation.com/api/v1/lookup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                locations: chunk.map(([lat, lng]) => ({ latitude: lat, longitude: lng })),
            }),
        });

        const r = checkStatus(response);

        const json = (await r.json()) as { results: Result[] };
        return json.results.map((result) => result.elevation.toFixed(2));
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const requestOpenElevationChunkMemoized = memoize(requestOpenElevationChunk, {
    promise: true,
    max: 500,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    normalizer: (args: [LatLng[]]) => {
        const hash = sha1(args[0].join(','));
        return hash;
    },
});

const checkStatus = (response: Response | NodeFetchResponse) => {
    if (response.ok) {
        // response.status >= 200 && response.status < 300
        return response;
    } else {
        throw new HTTPResponseError(response);
    }
};

class HTTPResponseError extends Error {
    response: Response | NodeFetchResponse;

    constructor(response: Response | NodeFetchResponse) {
        super(`HTTP Error Response: ${response.status} ${response.statusText}`);
        this.response = response;
    }
}
