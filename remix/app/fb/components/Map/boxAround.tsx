import type { Point } from 'cheap-ruler';
import CheapRuler from 'cheap-ruler';

export const boxAround = (point: Point, radiusInMeters: number) => {
    const ruler = new CheapRuler(point[1], 'meters');
    return [
        ruler.destination(point, radiusInMeters, 225),
        ruler.destination(point, radiusInMeters, 45),
    ].map(([lng, lat]) => [lat, lng] as [number, number]);
};
