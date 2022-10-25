import { LayerGroup } from 'react-leaflet';
import { AirspaceType } from 'ts-aerodata-france';
import { useAiracData } from '../useAiracData';
import { CtrSVGPolygon } from './CtrSVGPolygon';
import type { MapBounds } from './DisplayedContent';

export const Airspaces = ({ mapBounds }: { mapBounds: MapBounds }) => {
    const { airacData, loading } = useAiracData();

    return (
        <LayerGroup>
            {mapBounds &&
                !loading &&
                airacData
                    .getAirspacesInBbox(...mapBounds)
                    .filter(({ type }) => type === AirspaceType.CTR)
                    .map((airspace, i) => (
                        <CtrSVGPolygon key={`airspace-${airspace.name}`} ctr={airspace} i={i} />
                    ))}
        </LayerGroup>
    );
};
