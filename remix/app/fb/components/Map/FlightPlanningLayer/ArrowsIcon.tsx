import L from 'leaflet';
import aerodrome from '../../../icons/aerodrome.min.svg';

export const aerodromeIcon = new L.Icon({
    iconUrl: aerodrome,
    iconRetinaUrl: aerodrome,
    // iconAnchor: null,
    // popupAnchor: null,
    // shadowUrl: null,
    // shadowSize: null,
    // shadowAnchor: null,
    iconSize: new L.Point(60, 75),
    className: 'leaflet-div-icon',
});
