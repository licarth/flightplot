import type { ActionFunction } from '@remix-run/node';
import type { LatLng } from '~/services/elevation';
import { openElevationApiElevationService } from '~/services/elevation';
export const action: ActionFunction = async ({ request }) => {
    const body = await request.json();
    const latLngs = body?.locations as LatLng[];

    // return await googleElevationService(latLngs);
    return await openElevationApiElevationService(latLngs);
};
