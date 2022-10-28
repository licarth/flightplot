import { NmScale } from '@marfle/react-leaflet-nmscale';
import { useEffect, useMemo } from 'react';
import { LayerGroup, Pane, Polygon, SVGOverlay, Tooltip, useMap } from 'react-leaflet';
import styled from 'styled-components';
import type { Airspace, DangerZone } from 'ts-aerodata-france';
import { toCheapRulerPoint, toLatLng } from '~/domain';
import { OaciLayer, OpenStreetMapLayer } from '../layer';
import { SatelliteLayer } from '../layer/SatelliteLayer';
import { useRoute } from '../useRoute';
import { Aerodromes } from './Aerodromes';
import { Airspaces } from './Airspaces';
import { boxAround } from './boxAround';
import { Colors } from './Colors';
import { DangerZones } from './DangerZones';
import { useFixtureFocus } from './FixtureFocusContext';
import { FlightPlanningLayer } from './FlightPlanningLayer';
import { PrintAreaPreview } from './FlightPlanningLayer/PrintAreaPreview';
import { IgnAirspaceNameFont } from './IgnAirspaceNameFont';
import { LayerSwitchButton } from './LayerSwitchButton';
import { useMainMap } from './MainMapContext';
import { MouseEvents } from './MouseEvents';
import { VfrPoints } from './VfrPoints';
import { Vors } from './Vors';
import { Z_INDEX_MOUSE_TOOLTIP } from './zIndex';

export const InnerMapContainer = () => {
    const routeContext = useRoute();
    const leafletMap = useMap();
    const { currentBackgroundLayer, bounds: mapBounds } = useMainMap();

    const shouldRenderAerodromes = leafletMap.getZoom() > 7;
    const shouldRenderVors = leafletMap.getZoom() > 7;
    const shouldRenderVfrPoints = leafletMap.getZoom() > 9;

    useEffect(() => {
        leafletMap && leafletMap.boxZoom.disable();
    }, [leafletMap]);

    return (
        <>
            <MouseEvents />
            <DisplayedLayer layer={currentBackgroundLayer} />
            <FlightPlanningLayer routeContext={routeContext} />
            <PrintAreaPreview />
            {mapBounds && (
                <>
                    <MouseTooltip />
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

const MouseTooltip = () => {
    const {
        underMouse: { airspaces },
        mouseLocation,
    } = useFixtureFocus();

    const [filteredAirspaces, airspacesSha] = useMemo(() => {
        const filteredAirspaces = airspaces.filter((a) => ['CTR', 'P'].includes(a.type));
        const airspacesSha = filteredAirspaces.map((a) => a.name).join(',');
        return [filteredAirspaces, airspacesSha];
    }, [airspaces]);

    const bounds = mouseLocation && boxAround(toCheapRulerPoint(toLatLng(mouseLocation)), 1);

    return mouseLocation && bounds && filteredAirspaces ? (
        <SVGOverlay bounds={bounds} opacity={0}>
            <Polygon
                key={'overlay-po'}
                positions={[
                    [0, 0],
                    [0, 90],
                    [90, 90],
                    [90, 0],
                ]}
                pathOptions={{ weight: 0, fillOpacity: 0 }}
            >
                <Pane name="tooltip-pane" style={{ zIndex: Z_INDEX_MOUSE_TOOLTIP }}>
                    <StyledTooltip
                        permanent
                        sticky
                        opacity={filteredAirspaces.length > 0 ? 1 : 0}
                        key={`tooltip-airspace-${airspacesSha}`}
                        offset={[10, 0]}
                    >
                        {filteredAirspaces.map((airspace, i) => {
                            return (
                                <AirspaceDescription
                                    key={`tooltip-airspace-description-${i}`}
                                    airspace={airspace}
                                />
                            );
                        })}
                    </StyledTooltip>
                </Pane>
            </Polygon>
        </SVGOverlay>
    ) : null;
};

const Centered = styled.div`
    display: flex;
    flex-direction: column;
`;

const AirspaceDescription = ({ airspace }: { airspace: Airspace | DangerZone }) => {
    const { name, type, lowerLimit, higherLimit } = airspace;
    const airspaceClass = type === 'CTR' ? airspace.airspaceClass : null;
    return (
        <AirspaceContainer>
            <Centered>
                <IgnAirspaceNameFont
                    $color={airspace.type === 'P' ? Colors.pThickBorder : Colors.ctrBorderBlue}
                >
                    <b>
                        {name} {airspaceClass && `[${airspaceClass}]`}
                    </b>
                    <br />
                    <div>
                        <i>
                            {higherLimit.toString()}
                            <hr />
                            {lowerLimit.toString()}
                        </i>
                    </div>
                </IgnAirspaceNameFont>{' '}
            </Centered>
        </AirspaceContainer>
    );
};

const AirspaceContainer = styled.div``;

const StyledTooltip = styled(Tooltip)`
    display: flex;
    gap: 0.5rem;
`;
