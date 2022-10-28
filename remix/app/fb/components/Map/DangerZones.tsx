import styled from 'styled-components';
import { useAiracData } from '../useAiracData';
import { Colors } from './Colors';
import { AirspaceSVGPolygon } from './CtrSVGPolygon/AirspaceSVGPolygon';
import type { MapBounds } from './DisplayedContent';
import { useFixtureFocus } from './FixtureFocusContext';

export const DangerZones = ({ mapBounds }: { mapBounds: MapBounds }) => {
    const { airacData, loading } = useAiracData();

    const {
        underMouse: { airspaces },
    } = useFixtureFocus();

    const highlightedAirspaces = airspaces.map((a) => a.name);

    return (
        <>
            {mapBounds &&
                !loading &&
                airacData
                    .getDangerZonesInBbox(...mapBounds)
                    .filter(({ type }) => ['P'].includes(type))
                    .map(({ geometry, name, lowerLimit, higherLimit }, i) => {
                        return (
                            <AirspaceSVGPolygon
                                key={`p-${name}`}
                                i={i}
                                geometry={geometry}
                                name={name}
                                thinBorderColor={Colors.pThinBorder}
                                thickBorderColor={Colors.pThickBorder}
                                thinDashArray=""
                                prefix="p"
                                highlighted={highlightedAirspaces.includes(name)}
                            />
                        );
                    })}
        </>
    );
};

const Centered = styled.div`
    display: flex;
    flex-direction: column;
`;
