import type { LoaderFunction } from '@remix-run/node';
import { convertToLambert } from '~/image-generation/coordsConverter';
import { OaciCropper } from '~/image-generation/OaciCropper';
import * as turf from '@turf/turf';

export const loader: LoaderFunction = async ({ params }) => {
    try {
        const [bottomLeftLat, bottomLeftLng] = `${params.bottomLeft}`.split(',').map(Number);

        const [dxMillimeters, dyMillimeters] = `${params.format}`.split('x').map(Number);

        const scale = 1 / 500_000;
        const origin = { lat: 46, lng: 2 };

        const destinationPoint = turf.destination(
            [origin.lng, origin.lat],
            dxMillimeters / scale / 1e6,
            90,
        ).geometry.coordinates;
        const destination = { lat: destinationPoint[1], lng: destinationPoint[0] };

        const pageWidthInLambert = convertToLambert(destination).x - convertToLambert(origin).x;

        const bottomLeft = { lat: bottomLeftLat, lng: bottomLeftLng };

        // A la latitude 44, on a une pageWidthInLambert

        // const pageWidthInLambert = 105_000;
        const lambertBottomLeft = convertToLambert(bottomLeft);

        const pageHeightInLambert = (pageWidthInLambert * dyMillimeters) / dxMillimeters;

        const lambertTopRight = {
            x: lambertBottomLeft.x + pageWidthInLambert,
            y: lambertBottomLeft.y + pageHeightInLambert, //This is intentional
        };

        const imageBuffer = await new OaciCropper().crop({
            bottomLeft: lambertBottomLeft,
            topRight: lambertTopRight,
        });

        if (imageBuffer === null) {
            return new Response(null, {
                status: 500,
            });
        }

        return new Response(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'image/tiff',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error(error);
        return new Response(null, {
            status: 500,
        });
    }
};
