import type { LatLngTuple } from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, ZoomControl } from 'react-leaflet';
import { useResizeDetector } from 'react-resize-detector';
import styled from 'styled-components';
import { useMouseMode } from '../MouseModeContext';
import { FixtureDetails } from './FixtureDetails';
import { useFixtureFocus } from './FixtureFocusContext';
import { InnerMapContainer } from './InnerMapContainer';
import { useMainMap } from './MainMapContext';

const defaultLatLng: LatLngTuple = [43.5, 3.95];
const zoom: number = 8;

export const LeafletMapContainer = () => {
    const params = { center: defaultLatLng, zoom };
    const { width, height, ref } = useResizeDetector();
    const { map, setMap } = useMainMap();
    const [cursor, setCursor] = useState('crosshair');
    const { mouseMode } = useMouseMode();

    useEffect(() => {
        if (mouseMode === 'command' || mouseMode === 'command+shift') {
            setCursor('copy');
        } else {
            setCursor('crosshair');
        }
    }, [mouseMode]);

    const mapRef = useRef(null);

    useEffect(() => {
        mapRef.current && setMap(mapRef.current);
    }, [mapRef.current]);

    useEffect(() => {
        map?.invalidateSize();
    }, [width, height, map]);

    return (
        <MapSizeDetector ref={ref}>
            <FixtureDetailsWindow />
            {MapContainer && (
                <Outer $cursor={cursor}>
                    <StyledMapContainer ref={mapRef} id="mapId" zoomControl={false} {...params}>
                        <InnerMapContainer />
                        <ZoomControl position="topright" />
                    </StyledMapContainer>
                </Outer>
            )}
        </MapSizeDetector>
    );
};

const FixtureDetailsWindow = () => {
    const { clickedLocation, fixtures, clear: clearFixture } = useFixtureFocus();
    return (
        <>
            {clickedLocation ? (
                <FixtureDetails
                    fixtures={fixtures}
                    clickedLocation={clickedLocation}
                    onClose={clearFixture}
                />
            ) : null}
        </>
    );
};

const StyledMapContainer = styled(MapContainer)``;

const MapSizeDetector = styled.div`
    position: relative;
    justify-items: stretch;
    flex-grow: 1;
    display: flex;
    * {
        color-scheme: only light;
    }
`;
const Outer = styled.div<{ $cursor: string }>`
    /* ${({ $cursor }) => $cursor && `cursor: ${$cursor}`}; */
    * {
        ${({ $cursor }) => $cursor && `cursor: ${$cursor}`};
    }
    /* justify-items: stretch; */
    flex-grow: 1;
    display: flex;
`;
