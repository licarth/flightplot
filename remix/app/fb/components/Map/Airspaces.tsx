import { useMemo } from 'react';
import { LayerGroup } from 'react-leaflet';
import { useAiracData } from '../useAiracData';
import { CtrSVGPolygon } from './CtrSVGPolygon';
import type { MapBounds } from './DisplayedContent';
import { useFixtureFocus } from './FixtureFocusContext';
import { useMainMap } from './MainMapContext';

export const Airspaces = ({ mapBounds }: { mapBounds: MapBounds }) => {
    const { airacData, loading } = useAiracData();

    const airspacesInView = useMemo(() => {
        return loading ? [] : airacData.getAirspacesInBbox(...mapBounds);
    }, [mapBounds]);

    const {
        underMouse: { airspaces },
    } = useFixtureFocus();

    const {
        filters: { showAirspacesStartingBelowFL },
    } = useMainMap();

    const highlightedAirspaces = airspaces.map((a) => a.name);

    return (
        <LayerGroup>
            {mapBounds &&
                !loading &&
                airspacesInView
                    .filter(
                        ({ lowerLimit }) =>
                            lowerLimit.feetValue <= showAirspacesStartingBelowFL * 100,
                    )
                    .map((airspace, i) => (
                        <CtrSVGPolygon
                            key={`airspace-${airspace.name}`}
                            ctr={airspace}
                            i={i}
                            highlighted={highlightedAirspaces.includes(airspace.name)}
                        />
                    ))}
        </LayerGroup>
    );
};
