import type { WebMercatorCoords } from '../fb/components/Map/CtrSVGPolygon/coordsConverter';
import type { LatLng } from './LatLng';

export const boundingBox = (latLngs: LatLng[] | WebMercatorCoords[]): [number, number][] => {
    const yy: number[] = [];
    const xx: number[] = [];

    for (let i = 0; i < latLngs.length; i++) {
        //@ts-ignore
        const y = latLngs[i].lat || latLngs[i].y;
        //@ts-ignore
        const x = latLngs[i].lng || latLngs[i].x;
        yy.push(y);
        xx.push(x);
    }

    // calc the min and max lng and lat
    const minlat = Math.min(...yy);
    const maxlat = Math.max(...yy);
    const minlng = Math.min(...xx);
    const maxlng = Math.max(...xx);

    // create a bounding rectangle that can be used in leaflet
    return [
        [minlat, minlng],
        [maxlat, maxlng],
    ];
};
