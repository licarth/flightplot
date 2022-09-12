import type { Map } from 'leaflet';
import type { MapBounds } from './DisplayedContent';

export const getMapBounds = (leafletMap: Map): MapBounds => {
    return [
        leafletMap.getBounds().getWest(),
        leafletMap.getBounds().getSouth(),
        leafletMap.getBounds().getEast(),
        leafletMap.getBounds().getNorth(),
    ];
};
