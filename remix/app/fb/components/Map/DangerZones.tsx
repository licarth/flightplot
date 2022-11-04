import styled from 'styled-components';
import { useAiracData } from '../useAiracData';
import { Colors } from './Colors';
import { AirspaceSVGPolygon } from './CtrSVGPolygon/AirspaceSVGPolygon';
import type { MapBounds } from './DisplayedContent';
import { useFixtureFocus } from './FixtureFocusContext';
import { useMainMap } from './MainMapContext';

export const DangerZones = ({ mapBounds }: { mapBounds: MapBounds }) => {
    const { airacData, loading } = useAiracData();
    const {
        filters: { showAirspacesStartingBelowFL },
        airspaceTypesToDisplay,
    } = useMainMap();

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
                    .filter(({ lowerLimit, type }) => {
                        return (
                            airspaceTypesToDisplay.includes(type) &&
                            lowerLimit.feetValue <= showAirspacesStartingBelowFL * 100
                        );
                    })

                    .map(({ geometry, name }, i) => {
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
