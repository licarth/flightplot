import { NmScale } from '@marfle/react-leaflet-nmscale';
import { LayerGroup, useMap } from 'react-leaflet';
import { toLeafletLatLng } from '../../../domain';
import { OaciLayer, OpenStreetMapLayer } from '../layer';
import { SatelliteLayer } from '../layer/SatelliteLayer';
import { useRoute } from '../useRoute';
import { Aerodromes } from './Aerodromes';
import { Airspaces } from './Airspaces';
import { DangerZones } from './DangerZones';
import { FlightPlanningLayer } from './FlightPlanningLayer';
import { PrintAreaPreview } from './FlightPlanningLayer/PrintAreaPreview';
import { LayerSwitchButton } from './LayerSwitchButton';
import { useMainMap } from './MainMapContext';
import { VfrPoints } from './VfrPoints';
import { Vors } from './Vors';

export const InnerMapContainer = () => {
    const routeContext = useRoute();
    const { addAerodromeWaypoint, addLatLngWaypoint, route } = routeContext;
    const leafletMap = useMap();
    const { currentBackgroundLayer } = useMainMap();

    const { bounds: mapBounds } = useMainMap();

    const shouldRenderAerodromes = leafletMap.getZoom() > 7;
    const shouldRenderVors = leafletMap.getZoom() > 7;
    const shouldRenderVfrPoints = leafletMap.getZoom() > 9;

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
                            <Aerodromes
                                mapBounds={mapBounds}
                                onClick={(aerodrome) => addAerodromeWaypoint({ aerodrome })}
                            />
                        </LayerGroup>
                    )}
                    {shouldRenderVors && (
                        <LayerGroup>
                            <Vors
                                mapBounds={mapBounds}
                                onClick={(aerodrome) => addAerodromeWaypoint({ aerodrome })}
                            />
                        </LayerGroup>
                    )}
                    {shouldRenderVfrPoints && (
                        <LayerGroup>
                            <VfrPoints
                                mapBounds={mapBounds}
                                onClick={({ latLng, name }) =>
                                    addLatLngWaypoint({ latLng: toLeafletLatLng(latLng), name })
                                }
                            />
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
