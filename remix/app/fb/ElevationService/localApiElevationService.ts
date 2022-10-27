import type { ElevationService } from './ElevationService';

export const localApiElevationService: ElevationService = {
    getElevationsForLatLngs: async (latLngs) => {
        if (latLngs.length === 0) return [];
        const jsonResult: Array<number> = await postData(`/elevation?locations`, {
            locations: latLngs.map(({ lat, lng }) => [lat, lng]),
        });

        return jsonResult.map((elevation) => elevation * 3.28084);
    },
};

async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}
