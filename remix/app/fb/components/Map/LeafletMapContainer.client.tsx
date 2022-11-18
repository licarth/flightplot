import type { LatLngTuple } from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { MapContainer } from 'react-leaflet';
import { useResizeDetector } from 'react-resize-detector';
import styled from 'styled-components';
import { useHelpPage } from '../HelpPageContext';
import { useMouseMode } from '../MouseModeContext';
import { useSearchElement } from '../SearchItemContext';
import { AirspacesFilters } from '../TopBar/AirspacesFilters';
import { Colors } from './Colors';
import { FixtureDetails } from './FixtureDetails';
import { useFixtureFocus } from './FixtureFocusContext';
import { InnerMapContainer } from './InnerMapContainer';
import { useMainMap } from './MainMapContext';
import { SearchElementDetails } from './SearchableElementDetails';

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
            <AirspacesFilters />
            {MapContainer && (
                <Outer $cursor={cursor}>
                    <StyledMapContainer ref={mapRef} id="mapId" zoomControl={false} {...params}>
                        <InnerMapContainer />
                    </StyledMapContainer>
                </Outer>
            )}
        </MapSizeDetector>
    );
};

const FixtureDetailsWindow = () => {
    const { item } = useSearchElement();

    const { isOpen: isHelpOpen } = useHelpPage();

    const { clickedLocation, fixtures, clear: clearFixture } = useFixtureFocus();

    const onClose = () => {
        clearFixture();
    };

    const isOpen = clickedLocation || item;

    return (
        isOpen && (
            <FixtureDetailsContainer isHelpOpen={isHelpOpen}>
                <CloseButton onClick={onClose} />
                {clickedLocation && !item ? (
                    <FixtureDetails fixtures={fixtures} clickedLocation={clickedLocation} />
                ) : null}
                {item && <SearchElementDetails searchableElement={item} onClose={() => {}} />}
            </FixtureDetailsContainer>
        )
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
    overflow: hidden;
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

const FixtureDetailsContainer = styled.div<{ isHelpOpen: boolean }>`
    transition: all 0.3s;
    padding: 1rem;
    padding-top: 2rem;
    padding-right: 0.5rem;
    right: ${({ isHelpOpen }) => (window.innerWidth > 600 ? 120 : 0) + (isHelpOpen ? 500 : 0)}px;
    top: 10px;
    width: ${() => (window.innerWidth > 600 ? '350px' : '100%')};
    max-height: 40vh;
    position: absolute;
    z-index: 600;
    background-color: white;
    filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    font-family: 'Futura';
    color: ${Colors.ctrBorderBlue};
    border: 2px solid ${Colors.flightplotLogoBlue};
`;

const CloseButton = styled.div`
    position: absolute;
    :after {
        content: '×';
    }
    top: 2px;
    right: 8px;
    font-size: 1.5rem;
    cursor: pointer;
`;
