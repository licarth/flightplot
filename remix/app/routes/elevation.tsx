import type { ActionFunction } from '@remix-run/node';
import retry from 'async-retry';
import _ from 'lodash';
import type { Response } from 'node-fetch';

export const action: ActionFunction = async ({ request }) => {
    const body = await request.json();
    const latLngs = body?.locations as [lat: number, lng: number][];

    // return await googleElevationService(latLngs);
    return await openElevationApiElevationService(latLngs);
};

async function googleElevationService(latLngs: [lat: number, lng: number][]) {
    const chunks = _.chunk(latLngs, 300);

    //@ts-ignore
    const fetch = (await import('node-fetch')).default;

    console.log(chunks.map((c) => c.length));

    const dataSets = await Promise.all(
        chunks.map(
            async (chunk) =>
                await fetch(
                    `https://maps.googleapis.com/maps/api/elevation/json?key=AIzaSyBsW7gGDrOTEe0MI1XZ3S5flJBSePy52eE&locations=${chunk
                        .map(([lat, lng]) => `${lat},${lng}`)
                        .join('|')}`,
                )
                    .then((res) => res.json())
                    //@ts-ignore
                    .then((json) => json.results.map((result) => result.elevation.toFixed(2))),
        ),
    );

    return _.flatten(dataSets);
}

async function openElevationApiElevationService(latLngs: [lat: number, lng: number][]) {
    const chunks = _.chunk(latLngs, 300);

    //@ts-ignore
    const fetch = (await import('node-fetch')).default;

    // console.log(chunks.map((c) => c.length));

    const doRequest = async (chunk: [lat: number, lng: number][]): Promise<any> => {
        const response = await fetch(`https://api.open-elevation.com/api/v1/lookup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                locations: chunk.map(([lat, lng]) => ({ latitude: lat, longitude: lng })),
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

    const dataSets = await Promise.all(
        chunks.map((chunk) =>
            retry(async (bail) => await doRequest(chunk), {
                retries: 3,
                minTimeout: 500,
                onRetry: () => console.log('retrying'),
            }),
        ),
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

const checkStatus = (response: Response) => {
    if (response.ok) {
        // response.status >= 200 && response.status < 300
        return response;
    } else {
        throw new HTTPResponseError(response);
    }
};
