// import "leaflet.tilelayer.pouchdbcached";
//@ts-ignore
// import PouchDB from "pouchdb";
import { TileLayer } from 'react-leaflet';

//@ts-ignore
// window.PouchDB = PouchDB;

const key = 'ldbdzgph6hmabnfgrokzuimh';
const layer = 'GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-OACI';

export const OaciLayer = () => (
    <TileLayer
        maxNativeZoom={11}
        minZoom={7}
        opacity={0.8}
        url={`http://wxs.ign.fr/${key}/geoportail/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg`}
        attribution='&copy; <a href="https://geoservices.ign.fr/scanoaci">IGN SCAN OACI 2022</a>'
        //@ts-ignore
        useCache={true}
    />
);
