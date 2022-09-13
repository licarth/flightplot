import proj4 from 'proj4';
import type { Opaque } from '~/fb/domain/Opaque';
import type { LatLng } from '~/fb/LatLng';

const WEB_MERCATOR_PROJ =
    '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs';

export type WebMercatorCoords = Opaque<
    'WebMercatorCoords',
    {
        x: number;
        y: number;
    }
>;

export const convertToWebMercator = ({ lat, lng }: LatLng): WebMercatorCoords => {
    const [x, y] = proj4('WGS84', WEB_MERCATOR_PROJ, [lng, lat]);
    return { x, y } as WebMercatorCoords;
};

export const convertToCoords = ({ x, y }: WebMercatorCoords): LatLng => {
    const [lng, lat] = proj4(WEB_MERCATOR_PROJ, 'WGS84', [x, y]);
    return { lat, lng };
};
