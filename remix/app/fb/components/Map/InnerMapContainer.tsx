import { NmScale } from '@marfle/react-leaflet-nmscale';
import { useState } from 'react';
import { LayerGroup, useMap, useMapEvents } from 'react-leaflet';
import { toLeafletLatLng } from '../../domain';
import { OaciLayer } from '../layer';
import { useRoute } from '../useRoute';
import { Aerodromes } from './Aerodromes';
import { Airspaces } from './Airspaces';
import { DangerZones } from './DangerZones';
import { FlightPlanningLayer } from './FlightPlanningLayer';
import { PrintAreaPreview } from './FlightPlanningLayer/PrintAreaPreview';
import { getMapBounds } from './getMapBounds';
import { VfrPoints } from './VfrPoints';

export const InnerMapContainer = () => {
    const routeContext = useRoute();
    const { addAerodromeWaypoint, addLatLngWaypoint, route } = routeContext;
    const leafletMap = useMap();
    const [mapBounds, setMapBounds] = useState<[number, number, number, number]>(
        leafletMap && getMapBounds(leafletMap),
    );

    const refreshMapBounds = () => setMapBounds(getMapBounds(leafletMap));
    useMapEvents({
        zoomend: refreshMapBounds,
        moveend: refreshMapBounds,
    });
    const shouldRenderAerodromes = leafletMap.getZoom() > 7;
    const shouldRenderVfrPoints = leafletMap.getZoom() > 9;

    return (
        <>
            <Layers />
            <LayerGroup>
                {route && <FlightPlanningLayer routeContext={routeContext} />}
                <PrintAreaPreview />
                <Airspaces mapBounds={mapBounds} />
                <DangerZones mapBounds={mapBounds} />
                {shouldRenderAerodromes && (
                    <Aerodromes
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
            </LayerGroup>
            <NmScale />
        </>
    );
};

const Layers = () => {
    return (
        <>
            {/* <OpenStreetMapLayer /> */}
            <OaciLayer />
        </>
    );
};
