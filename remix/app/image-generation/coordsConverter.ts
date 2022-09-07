import proj4 from "proj4";

const LAMBERT93_PROJ =
  "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";

export type LatLng = {
  lat: number;
  lng: number;
};

export type Lambert93Coords = {
  x: number;
  y: number;
};

export const convertToLambert = ({ lat, lng }: LatLng): Lambert93Coords => {
  const [x, y] = proj4("WGS84", LAMBERT93_PROJ, [lng, lat]);
  return { x, y };
};

export const convertToCoords = ({ x, y }: Lambert93Coords): LatLng => {
  const [lng, lat] = proj4(LAMBERT93_PROJ, "WGS84", [x, y]);
  return { lat, lng };
};
