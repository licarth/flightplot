import _ from 'lodash';
import { Tooltip } from 'react-leaflet';
import styled from 'styled-components';
import { isCurrentlyActive, useRtbaZones } from '~/fb/contexts/RtbaZonesContext';
import { useAiracData } from '../useAiracData';
import { Colors } from './Colors';
import { AirspaceSVGPolygon } from './CtrSVGPolygon/AirspaceSVGPolygon';
import type { MapBounds } from './DisplayedContent';
import { useFixtureFocus } from './FixtureFocusContext';
import { IgnAirspaceNameFont } from './IgnAirspaceNameFont';
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

    const { activeRestrictedAreasNext24h } = useRtbaZones();

    return (
        <>
            {mapBounds &&
                _.uniqBy(activeRestrictedAreasNext24h, 'activeZone.zone.name').map(
                    (activation, i) => {
                        if (!activation.activeZone.zone) {
                            return <></>;
                        }
                        const { geometry, name, lowerLimit, higherLimit } =
                            activation.activeZone.zone;
                        return (
                            <AirspaceSVGPolygon
                                key={`rtba-${name}`}
                                i={i}
                                geometry={geometry}
                                name={name}
                                thinBorderColor={Colors.activeDangerZoneThin}
                                thickBorderColor={Colors.activeDangerZoneThick}
                                thinDashArray="5 5"
                                thinBorderWidth={5}
                                fillColor={isCurrentlyActive(activation) && '#9400007b'}
                                prefix="rtba"
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
                    },
                )}
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
