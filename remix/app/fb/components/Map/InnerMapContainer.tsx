import { NmScale } from '@marfle/react-leaflet-nmscale';
import hotkeys from 'hotkeys-js';
import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { LayerGroup, useMap, useMapEvent } from 'react-leaflet';
import { toDomainLatLng } from '~/domain';
import { OaciLayer, OpenStreetMapLayer } from '../layer';
import { SatelliteLayer } from '../layer/SatelliteLayer';
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
import { VfrPoints } from './VfrPoints';
import { Vors } from './Vors';

export const InnerMapContainer = () => {
    const routeContext = useRoute();
    const { route, addLatLngWaypoint } = routeContext;
    const leafletMap = useMap();
    const { currentBackgroundLayer, bounds: mapBounds, map } = useMainMap();

    const shouldRenderAerodromes = leafletMap.getZoom() > 7;
    const shouldRenderVors = leafletMap.getZoom() > 7;
    const shouldRenderVfrPoints = leafletMap.getZoom() > 9;

    const { setClickedLocation, setHighlightedLocation, highlightedFixture, clear } =
        useFixtureFocus();

    useEffect(() => {
        leafletMap && leafletMap.boxZoom.disable();
    }, [leafletMap]);

    useMapEvent('click', (e) => {
        if (hotkeys.command || hotkeys.ctrl) {
            e.originalEvent.preventDefault();
            if (hotkeys.shift) {
                addLatLngWaypoint({ latLng: e.latlng });
            } else {
                highlightedFixture &&
                    addFixtureToRoute({ fixture: highlightedFixture, routeContext });
            }
        } else {
            setClickedLocation(toDomainLatLng(e.latlng));
        }
    });

    useMapEvent('mousemove', (e) => {
        if (!hotkeys.shift && (hotkeys.command || hotkeys.ctrl)) {
            setHighlightedLocation(toDomainLatLng(e.latlng));
        }
    });

    useHotkeys(
        '*',
        () => {
            if (hotkeys.command) {
                setHighlightedLocation(() => undefined);
            }
        },
        { keyup: true },
    );
    useHotkeys(
        '*',
        () => {
            if (hotkeys.shift) {
                setHighlightedLocation(() => undefined);
            }
        },
        { keydown: true },
    );

    // useHotkeys(
    //     '*',
    //     () => {
    //         if (hotkeys.command) {
    //             setHighlightedLocation(toDomainLatLng(e.latlng));
    //         }
    //     },
    //     { keydown: true },
    // );

    useHotkeys(
        'esc',
        () => {
            clear();
        },
        { keydown: true },
    );

    return (
        <>
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
