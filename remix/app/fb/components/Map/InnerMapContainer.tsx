import { NmScale } from '@marfle/react-leaflet-nmscale';
import type { LatLng } from 'leaflet';
import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { LayerGroup, useMap, useMapEvent } from 'react-leaflet';
import { toDomainLatLng } from '~/domain';
import { OaciLayer, OpenStreetMapLayer } from '../layer';
import { SatelliteLayer } from '../layer/SatelliteLayer';
import { useMouseMode } from '../MouseModeContext';
import { useRoute } from '../useRoute';
import { addFixtureToRoute } from './addFixtureToRoute';
import { Aerodromes } from './Aerodromes';
import { Airspaces } from './Airspaces';
import { DangerZones } from './DangerZones';
import { useFixtureFocus } from './FixtureFocusContext';
import { FlightPlanningLayer } from './FlightPlanningLayer';
import { PrintAreaPreview } from './FlightPlanningLayer/PrintAreaPreview';
import { LayerSwitchButton } from './LayerSwitchButton';
import { useMainMap } from './MainMapContext';
import { MouseEvents } from './MouseEvents';
import { VfrPoints } from './VfrPoints';
import { Vors } from './Vors';

export const InnerMapContainer = () => {
    const routeContext = useRoute();
    const { addLatLngWaypoint } = routeContext;
    const leafletMap = useMap();
    const { currentBackgroundLayer, bounds: mapBounds } = useMainMap();
    const [mouseLocation, setMouseLocation] = useState<LatLng | null>(null);

    const shouldRenderAerodromes = leafletMap.getZoom() > 7;
    const shouldRenderVors = leafletMap.getZoom() > 7;
    const shouldRenderVfrPoints = leafletMap.getZoom() > 9;

    const { setClickedLocation, setHighlightedLocation, highlightedFixture, clear } =
        useFixtureFocus();

    useEffect(() => {
        leafletMap && leafletMap.boxZoom.disable();
    }, [leafletMap]);

    const { mouseMode } = useMouseMode();

    useMapEvent('click', (e) => {
        if (mouseMode === 'command') {
            e.originalEvent.preventDefault();
            highlightedFixture && addFixtureToRoute({ fixture: highlightedFixture, routeContext });
        } else if (mouseMode === 'command+shift') {
            e.originalEvent.preventDefault();
            addLatLngWaypoint({ latLng: e.latlng });
        } else {
            setClickedLocation(toDomainLatLng(e.latlng));
        }
    });

    useMapEvent('mousemove', (e) => {
        setMouseLocation(e.latlng);
    });

    useEffect(() => {
        if (mouseMode === 'none' || mouseMode === 'command+shift') {
            setHighlightedLocation(undefined);
        } else {
            mouseLocation && setHighlightedLocation(toDomainLatLng(mouseLocation));
        }
    }, [mouseMode]);

    useEffect(() => {
        if (mouseLocation && mouseMode === 'command') {
            setHighlightedLocation(toDomainLatLng(mouseLocation));
        }
    }, [mouseLocation]);

    useHotkeys(
        'esc',
        () => {
            clear();
        },
        { keydown: true },
    );

    return (
        <>
            <MouseEvents />
            <DisplayedLayer layer={currentBackgroundLayer} />
            <FlightPlanningLayer routeContext={routeContext} />
            <PrintAreaPreview />
            {mapBounds && (
                <>
                    <Airspaces mapBounds={mapBounds} />
                    <DangerZones mapBounds={mapBounds} />
                    {shouldRenderAerodromes && (
                        <LayerGroup>
                            <Aerodromes mapBounds={mapBounds} />
                        </LayerGroup>
                    )}
                    {shouldRenderVors && (
                        <LayerGroup>
                            <Vors mapBounds={mapBounds} />
                        </LayerGroup>
                    )}
                    {shouldRenderVfrPoints && (
                        <LayerGroup>
                            <VfrPoints mapBounds={mapBounds} />
                        </LayerGroup>
                    )}
                </>
            )}
            <NmScale />
            <LayerSwitchButton />
        </>
    );
};

export type DisplayedLayerProps = { layer: 'oaci' | 'sat' | 'osm' };

const DisplayedLayer = ({ layer }: DisplayedLayerProps) => {
    return (
        <>
            {layer === 'osm' && <OpenStreetMapLayer />}
            {layer === 'oaci' && <SatelliteLayer />}
            {layer === 'sat' && <OaciLayer />}
        </>
    );
};
