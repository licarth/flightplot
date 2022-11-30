import { format } from 'date-fns';
import { pipe } from 'fp-ts/lib/function';
import _ from 'lodash';
import { Tooltip } from 'react-leaflet';
import styled from 'styled-components';
import { Notam } from '~/domain/Notam/Notam';
import { foldRichNotam, RichNotam } from '~/domain/Notam/RichNotam/RichNotam';
import { useAiracData } from '../useAiracData';
import { Colors } from './Colors';
import { AirspaceSVGPolygon } from './CtrSVGPolygon/AirspaceSVGPolygon';
import type { MapBounds } from './DisplayedContent';
import { useFixtureFocus } from './FixtureFocusContext';
import { IgnAirspaceNameFont } from './IgnAirspaceNameFont';
import { useMainMap } from './MainMapContext';
import icao_notams from '~domain/Notam/notams-icao-fra-en';
import * as E from 'fp-ts/lib/Either';
import { useMemo } from 'react';

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

    const rtbaZones = useMemo(
        () =>
            (airacData &&
                _.compact(
                    _.flatten(
                        icao_notams.map((s) =>
                            pipe(
                                s.all,
                                Notam.decoder.decode,
                                E.chain(RichNotam.decoder(airacData).decode),
                                E.map(
                                    foldRichNotam({
                                        pje: ({ zones }) => {
                                            return [];
                                        },
                                        rtba: ({ n, zones }) => {
                                            const day = format(n.b.date!, 'yyyy-MM-dd');
                                            console.log(day);
                                            // if (day === format(new Date(), 'yyyy-MM-dd')) {
                                            //     return null;
                                            // }
                                            return zones;
                                        },
                                    }),
                                ),
                                E.fold(
                                    () => [],
                                    (e) => e,
                                ),
                            ),
                        ),
                    ),
                )) ||
            [],
        [airacData],
    );

    return (
        <>
            {mapBounds &&
                _.uniqBy(rtbaZones, 'zone.name').map(({ zone, times }, i) => {
                    const { geometry, name, lowerLimit, higherLimit } = zone;
                    return (
                        <AirspaceSVGPolygon
                            key={`rtba-${name}`}
                            i={i}
                            geometry={geometry}
                            name={name}
                            thinBorderColor={Colors.pThinBorder}
                            thickBorderColor={Colors.pThickBorder}
                            thinDashArray=""
                            thinWeight={0.7}
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
                })}
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
