import type { LatLngTuple, Map } from 'leaflet';
import { useEffect, useRef } from 'react';
import { MapContainer, ZoomControl } from 'react-leaflet';
import { useResizeDetector } from 'react-resize-detector';
import styled from 'styled-components';
import { FixtureDetails } from './FixtureDetails';
import { useFixtureFocus } from './FixtureFocusContext';
import { InnerMapContainer } from './InnerMapContainer';
import { useMainMap } from './MainMapContext';

const defaultLatLng: LatLngTuple = [43.5, 3.95];
const zoom: number = 8;

export const LeafletMapContainer = ({ setMap }: { setMap: (map: Map) => void }) => {
    const params = { center: defaultLatLng, zoom };
    const { width, height, ref } = useResizeDetector();
    const { map } = useMainMap();

    const mapRef = useRef(null);

    useEffect(() => {
        mapRef.current && setMap(mapRef.current);
    }, [mapRef.current]);

    useEffect(() => {
        map?.invalidateSize();
    }, [width, height, map]);

    const { fixture, clear: clearFixture } = useFixtureFocus();

    return (
        <MapSizeDetector ref={ref}>
            {fixture && <FixtureDetails fixture={fixture} onClose={clearFixture} />}
            {MapContainer && (
                <MapContainer ref={mapRef} id="mapId" zoomControl={false} {...params}>
                    <InnerMapContainer />
                    <ZoomControl position="topright" />
                </MapContainer>
            )}
        </MapSizeDetector>
    );
};

const MapSizeDetector = styled.div`
    position: relative;
    justify-items: stretch;
    flex-grow: 1;
    display: flex;
    * {
        color-scheme: only light;
    }
`;
