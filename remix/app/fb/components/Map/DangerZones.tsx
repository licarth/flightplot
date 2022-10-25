import { Tooltip } from 'react-leaflet';
import styled from 'styled-components';
import { useAiracData } from '../useAiracData';
import { Colors } from './Colors';
import { AirspaceSVGPolygon } from './CtrSVGPolygon/AirspaceSVGPolygon';
import type { MapBounds } from './DisplayedContent';
import { IgnAirspaceNameFont } from './IgnAirspaceNameFont';

export const DangerZones = ({ mapBounds }: { mapBounds: MapBounds }) => {
    const { airacData, loading } = useAiracData();

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
                            >
                                <Tooltip
                                    sticky
                                    opacity={1}
                                    offset={[10, 0]}
                                    key={`tooltip-airspace-${name}`}
                                >
                                    <Centered>
                                        <IgnAirspaceNameFont $color={Colors.pThickBorder}>
                                            <b>{name}</b>
                                            <br />
                                            <div>
                                                <i>
                                                    {higherLimit.toString()}
                                                    <hr />
                                                    {lowerLimit.toString()}
                                                </i>
                                            </div>
                                        </IgnAirspaceNameFont>
                                    </Centered>
                                </Tooltip>
                            </AirspaceSVGPolygon>
                        );
                    })}
        </>
    );
};

const Centered = styled.div`
    display: flex;
    flex-direction: column;
`;
