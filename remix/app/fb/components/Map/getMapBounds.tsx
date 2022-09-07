import { Map } from "leaflet";

export const getMapBounds = (leafletMap: Map): [number, number, number, number] => {
  return [
    leafletMap.getBounds().getWest(),
    leafletMap.getBounds().getSouth(),
    leafletMap.getBounds().getEast(),
    leafletMap.getBounds().getNorth(),
  ];
};
