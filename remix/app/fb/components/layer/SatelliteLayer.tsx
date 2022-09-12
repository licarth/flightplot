import { TileLayer } from 'react-leaflet';

export const SatelliteLayer = () => (
    <TileLayer
        url="http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}"
        attribution="&copy; "
    />
);
