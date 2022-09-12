import { NmScale } from '@marfle/react-leaflet-nmscale';
import { LayerGroup, useMap } from 'react-leaflet';
import { toLeafletLatLng } from '../../domain';
import { OaciLayer } from '../layer';
import { useRoute } from '../useRoute';
import { Aerodromes } from './Aerodromes';
import { Airspaces } from './Airspaces';
import { DangerZones } from './DangerZones';
import { FlightPlanningLayer } from './FlightPlanningLayer';
import { PrintAreaPreview } from './FlightPlanningLayer/PrintAreaPreview';
import { useMainMap } from './MainMapContext';
import { VfrPoints } from './VfrPoints';
import { Vors } from './Vors';

export const InnerMapContainer = () => {
    const routeContext = useRoute();
    const { addAerodromeWaypoint, addLatLngWaypoint, route } = routeContext;
    const leafletMap = useMap();

    const { bounds: mapBounds } = useMainMap();

    const shouldRenderAerodromes = leafletMap.getZoom() > 7;
    const shouldRenderVors = leafletMap.getZoom() > 7;
    const shouldRenderVfrPoints = leafletMap.getZoom() > 9;

    return (
        <>
            <Layers />
            {route && <FlightPlanningLayer routeContext={routeContext} />}
            <LayerGroup>
                <PrintAreaPreview />
                {mapBounds && (
                    <>
                        <Airspaces mapBounds={mapBounds} />
                        <DangerZones mapBounds={mapBounds} />
                        {shouldRenderAerodromes && (
                            <Aerodromes
                                mapBounds={mapBounds}
                                onClick={(aerodrome) => addAerodromeWaypoint({ aerodrome })}
                            />
                        )}
                        {shouldRenderVors && (
                            <Vors
                                mapBounds={mapBounds}
                                onClick={(aerodrome) => addAerodromeWaypoint({ aerodrome })}
                            />
                        )}
                        {shouldRenderVfrPoints && (
                            <VfrPoints
                                mapBounds={mapBounds}
                                onClick={({ latLng, name }) =>
                                    addLatLngWaypoint({ latLng: toLeafletLatLng(latLng), name })
                                }
                            />
                        )}
                    </>
                )}
            </LayerGroup>
            <NmScale />
        </>
    );
};

const Layers = () => {
    return (
        <>
            {/* <OpenStreetMapLayer /> */}
            {/* <SatelliteLayer /> */}
            <OaciLayer />
        </>
    );
};
