import { Agent } from 'https';
import memoize from 'memoizee';
import type { LatLng } from './ElevationService';
import { checkStatus } from './ElevationService';
import { sha1 } from './sha1';

const requestOpenElevationChunk = async (chunk: LatLng[]): Promise<any> => {
    //@ts-ignore
    const fetch = (await import('node-fetch')).default;
    console.log(`issuing a request to open elevation`);
    const response = await fetch(`https://api.open-elevation.com/api/v1/lookup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            locations: chunk.map(([lat, lng]) => ({ latitude: lat, longitude: lng })),
        }),
        agent: new Agent({
            rejectUnauthorized: false,
        }),
    });
    try {
        const r = checkStatus(response);

        const json = await r.json();
        //@ts-ignore
        return json.results.map((result) => result.elevation.toFixed(2));
    } catch (e) {
        // console.log(e);
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
