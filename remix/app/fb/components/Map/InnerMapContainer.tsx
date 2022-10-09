import { NmScale } from '@marfle/react-leaflet-nmscale';
import { LayerGroup, useMap, useMapEvent } from 'react-leaflet';
import { OaciLayer, OpenStreetMapLayer } from '../layer';
import { SatelliteLayer } from '../layer/SatelliteLayer';
import { useRoute } from '../useRoute';
import { addFixtureToRoute } from './addFixtureToRoute';
import { Aerodromes } from './Aerodromes';
import { Airspaces } from './Airspaces';
import { DangerZones } from './DangerZones';
import type { FocusableFixture } from './FixtureFocusContext';
import { useFixtureFocus } from './FixtureFocusContext';
import { FlightPlanningLayer } from './FlightPlanningLayer';
import { PrintAreaPreview } from './FlightPlanningLayer/PrintAreaPreview';
import { LayerSwitchButton } from './LayerSwitchButton';
import { useMainMap } from './MainMapContext';
import { VfrPoints } from './VfrPoints';
import { Vors } from './Vors';

export const InnerMapContainer = () => {
    const routeContext = useRoute();
    const { route, addLatLngWaypoint } = routeContext;
    const leafletMap = useMap();
    const { currentBackgroundLayer, bounds: mapBounds } = useMainMap();

    const shouldRenderAerodromes = leafletMap.getZoom() > 7;
    const shouldRenderVors = leafletMap.getZoom() > 7;
    const shouldRenderVfrPoints = leafletMap.getZoom() > 9;

    const { setFixture } = useFixtureFocus();

    const { clear } = useFixtureFocus();
    useMapEvent('click', (e) => {
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            addLatLngWaypoint({ latLng: e.latlng });
        } else {
            clear();
        }
    });

    const onFixtureClick = (event: MouseEvent, fixture: FocusableFixture) => {
        if (event.ctrlKey || event.metaKey) {
            addFixtureToRoute({ fixture, routeContext });
            return;
        }
        setFixture(fixture);
    };

    return (
        <>
            <DisplayedLayer layer={currentBackgroundLayer} />
            {route && <FlightPlanningLayer routeContext={routeContext} />}
            <PrintAreaPreview />
            {mapBounds && (
                <>
                    <Airspaces mapBounds={mapBounds} />
                    <DangerZones mapBounds={mapBounds} />
                    {shouldRenderAerodromes && (
                        <LayerGroup>
                            <Aerodromes mapBounds={mapBounds} onClick={onFixtureClick} />
                        </LayerGroup>
                    )}
                    {shouldRenderVors && (
                        <LayerGroup>
                            <Vors mapBounds={mapBounds} onClick={onFixtureClick} />
                        </LayerGroup>
                    )}
                    {shouldRenderVfrPoints && (
                        <LayerGroup>
                            <VfrPoints mapBounds={mapBounds} onClick={onFixtureClick} />
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
