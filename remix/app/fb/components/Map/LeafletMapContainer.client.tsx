import { LatLngTuple, Map } from 'leaflet';
import { MapContainer } from 'react-leaflet';
import { InnerMapContainer } from './InnerMapContainer';

const defaultLatLng: LatLngTuple = [43.5, 3.95];
const zoom: number = 8;

export const LeafletMapContainer = ({ setMap }: { setMap: (map: Map) => void }) => {
    const params = { center: defaultLatLng, zoom };

    return (
        <>
            {MapContainer && (
                <MapContainer id="mapId" {...params} whenCreated={setMap}>
                    <InnerMapContainer />
                </MapContainer>
            )}
        </>
    );
};
