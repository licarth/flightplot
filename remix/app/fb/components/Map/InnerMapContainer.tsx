import { NmScale } from '@marfle/react-leaflet-nmscale';
import { primaryInput } from 'detect-it';
import _ from 'lodash';
import { useEffect, useMemo } from 'react';
import { LayerGroup, Pane, Polygon, SVGOverlay, Tooltip, useMap } from 'react-leaflet';
import styled from 'styled-components';
import type { Airspace, DangerZone } from 'ts-aerodata-france';
import { toCheapRulerPoint, toLatLng } from '~/domain';
import { sha1 } from '~/services/elevation/sha1';
import { isAerodrome, isVfrPoint, isVor } from '../FixtureDetails/FixtureDetails';
import { OaciLayer, OpenStreetMapLayer } from '../layer';
import { SatelliteLayer } from '../layer/SatelliteLayer';
import { useMouseMode } from '../MouseModeContext';
import { useRoute } from '../useRoute';
import { AdPolygon, Aerodromes } from './Aerodromes';
import { AirspaceDescriptionTooltip } from './AirspaceDescriptionTooltip';
import { Airspaces } from './Airspaces';
import { boxAround } from './boxAround';
import { Colors } from './Colors';
import { AirspaceSVGPolygon } from './CtrSVGPolygon/AirspaceSVGPolygon';
import { DangerZones } from './DangerZones';
import { useFixtureFocus } from './FixtureFocusContext';
import { FlightPlanningLayer } from './FlightPlanningLayer';
import { PrintAreaPreview } from './FlightPlanningLayer/PrintAreaPreview';
import { useMainMap } from './MainMapContext';
import { MouseEvents } from './MouseEvents';
import { RtbaActivationTooltip } from './RtbaActivationTooltip';
import { useTemporaryMapBounds } from './TemporaryMapCenterContext';
import { VfrPointC, VfrPoints } from './VfrPoints';
import { VorMarker } from './VorMarker';
import { Vors } from './Vors';
import {
    Z_INDEX_AD_LOGO,
    Z_INDEX_HIGHLIGHTED_SEARCH_ITEM,
    Z_INDEX_MOUSE_AIRSPACE_TOOLTIP,
    Z_INDEX_ROUTE,
} from './zIndex';
export const InnerMapContainer = () => {
    const routeContext = useRoute();
    const leafletMap = useMap();
    const { currentBackgroundLayer, bounds: mapBounds } = useMainMap();
    const { mouseMode } = useMouseMode();
    const mapZoom = leafletMap.getZoom();

    const shouldRenderVors = mapZoom > 7;
    const shouldRenderVfrPoints = mapZoom > 9;

    useEffect(() => {
        leafletMap && leafletMap.boxZoom.disable();
    }, [leafletMap]);

    return (
        <>
            <MouseEvents />
            <DisplayedLayer layer={currentBackgroundLayer} />
            <Pane name={`flight-planning-layer-pane`} style={{ zIndex: Z_INDEX_ROUTE }}>
                <FlightPlanningLayer routeContext={routeContext} />
            </Pane>
            <PrintAreaPreview />
            {mapBounds && (
                <>
                    {primaryInput === 'mouse' && <MouseTooltip hidden={mouseMode !== 'none'} />}
                    <LayerGroup>
                        <Pane
                            name={`highlighted-item`}
                            style={{ zIndex: Z_INDEX_HIGHLIGHTED_SEARCH_ITEM }}
                        >
                            <HighlightedSearchItem />
                        </Pane>
                    </LayerGroup>
                    <Airspaces mapBounds={mapBounds} />
                    <DangerZones mapBounds={mapBounds} />
                    <LayerGroup>
                        <Pane name={`aerodromes`} style={{ zIndex: Z_INDEX_AD_LOGO }}>
                            <Aerodromes mapBounds={mapBounds} mapZoom={mapZoom} />
                        </Pane>
                    </LayerGroup>
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
            {/* <LayerSwitchButton /> */}
        </>
    );
};

export type DisplayedLayerProps = { layer: 'oaci' | 'sat' | 'osm' };

const DisplayedLayer = ({ layer }: DisplayedLayerProps) => {
    return (
        <>
            {layer === 'osm' && <OpenStreetMapLayer />}
            {layer === 'sat' && <SatelliteLayer />}
            {layer === 'oaci' && <OaciLayer />}
        </>
    );
};

const MouseTooltip = ({ hidden }: { hidden: boolean }) => {
    const {
        underMouse: { airspaces, activeRestrictedAreasNext24hUnderMouse },
        mouseLocation,
    } = useFixtureFocus();

    const {
        filters: { showAirspacesStartingBelowFL },
        airspaceTypesToDisplay,
    } = useMainMap();

    const [filteredAirspaces, airspacesSha] = useMemo(() => {
        const filteredAirspaces = airspaces
            .filter((a) => airspaceTypesToDisplay.includes(a.type))
            .filter(({ lowerLimit }) => lowerLimit.feetValue <= showAirspacesStartingBelowFL * 100);
        const airspacesSha = sha1(
            filteredAirspaces.map((a) => a.name).join(',') +
                activeRestrictedAreasNext24hUnderMouse.map((a) => a.activeZone.zone.name).join(','),
        );
        return [filteredAirspaces, airspacesSha];
    }, [airspaces, activeRestrictedAreasNext24hUnderMouse]);

    const bounds = mouseLocation && boxAround(toCheapRulerPoint(toLatLng(mouseLocation)), 1);

    return mouseLocation && bounds && filteredAirspaces ? (
        <SVGOverlay bounds={bounds} opacity={0}>
            <Polygon
                key={'overlay-po'}
                positions={[
                    [-180, -90],
                    [-180, 90],
                    [180, 90],
                    [180, -90],
                ]}
                pathOptions={{ weight: 0, fillOpacity: 0 }}
            >
                <Pane name="tooltip-pane" style={{ zIndex: Z_INDEX_MOUSE_AIRSPACE_TOOLTIP }}>
                    <StyledTooltip
                        permanent
                        sticky
                        opacity={
                            !hidden &&
                            (filteredAirspaces.length > 0 ||
                                activeRestrictedAreasNext24hUnderMouse.length > 0)
                                ? 1
                                : 0
                        }
                        key={`tooltip-airspace-${airspacesSha}-${hidden}`}
                        offset={[10, 0]}
                    >
                        <RtbaTooltips>
                            {_.sortBy(
                                activeRestrictedAreasNext24hUnderMouse,
                                ({ activeZone: zone }) => zone.zone.lowerLimit.feetValue,
                            ).map((activation, i) => {
                                return (
                                    <RtbaActivationTooltip
                                        key={`tooltip-rtba-description-${i}`}
                                        activation={activation}
                                    />
                                );
                            })}
                        </RtbaTooltips>
                        {_.sortBy(filteredAirspaces, ({ lowerLimit }) => lowerLimit.feetValue).map(
                            (airspace, i) => {
                                return (
                                    <AirspaceDescriptionTooltip
                                        key={`tooltip-airspace-description-${i}`}
                                        airspace={airspace}
                                    />
                                );
                            },
                        )}
                    </StyledTooltip>
                </Pane>
            </Polygon>
        </SVGOverlay>
    ) : null;
};

export const Centered = styled.div`
    display: flex;
    flex-direction: column;
`;

const StyledTooltip = styled(Tooltip)`
    display: flex;
    gap: 0.5rem;
    background-color: rgba(255, 255, 255, 0.6);
    border: none;
    box-shadow: none;
    backdrop-filter: blur(4px);
    ::before {
        display: none;
    }
`;

const HighlightedSearchItem = () => {
    const { highlightedItem } = useTemporaryMapBounds();
    if (isAerodrome(highlightedItem)) {
        return (
            <AdPolygon
                aerodrome={highlightedItem}
                shouldBeHighlighted
                displayAerodromesLabels={false}
            />
        );
    } else if (isVfrPoint(highlightedItem)) {
        return <VfrPointC vfrPoint={highlightedItem} highlightedFixture={highlightedItem} />;
    } else if (isVor(highlightedItem)) {
        return <VorMarker vor={highlightedItem} highlit />;
    } else if (isAirspace(highlightedItem)) {
        return (
            <AirspaceSVGPolygon
                highlighted
                geometry={highlightedItem.geometry}
                name={highlightedItem.name}
                thinBorderColor={Colors.highlitFixtureBorder}
                thickBorderColor={Colors.highlitFixture}
                thinDashArray="5, 5"
                prefix="highlighted-search-airspace-"
            />
        );
    } else return <></>;
};

const isAirspace = (item: any): item is Airspace | DangerZone => {
    return _.has(item, 'type');
};

const RtbaTooltips = styled.div`
    display: flex;
`;
