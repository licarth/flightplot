import { useMemo } from 'react';
import { LayerGroup } from 'react-leaflet';
import { AirspaceType } from 'ts-aerodata-france';
import { useAiracData } from '../useAiracData';
import { CtrSVGPolygon } from './CtrSVGPolygon';
import type { MapBounds } from './DisplayedContent';
import { useFixtureFocus } from './FixtureFocusContext';

export const Airspaces = ({ mapBounds }: { mapBounds: MapBounds }) => {
    const { airacData, loading } = useAiracData();

    const airspacesInView = useMemo(() => {
        return loading ? [] : airacData.getAirspacesInBbox(...mapBounds);
    }, [mapBounds]);

    const {
        underMouse: { airspaces },
    } = useFixtureFocus();

    const highlightedAirspaces = airspaces.map((a) => a.name);

    return (
        <LayerGroup>
            {mapBounds &&
                !loading &&
                airspacesInView
                    .filter(({ type }) => type === AirspaceType.CTR)
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
