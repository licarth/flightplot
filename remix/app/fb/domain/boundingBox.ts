import { LatLng } from "../LatLng";

export const boundingBox = (latLngs: LatLng[]): [number, number][] => {
  const lats: number[] = [];
  const lngs: number[] = [];

  for (let i = 0; i < latLngs.length; i++) {
    const { lat, lng } = latLngs[i];
    lats.push(lat);
    lngs.push(lng);
  }

  // calc the min and max lng and lat
  const minlat = Math.min(...lats);
  const maxlat = Math.max(...lats);
  const minlng = Math.min(...lngs);
  const maxlng = Math.max(...lngs);

  // create a bounding rectangle that can be used in leaflet
  return [
    [minlat, minlng],
    [maxlat, maxlng],
  ];
};
