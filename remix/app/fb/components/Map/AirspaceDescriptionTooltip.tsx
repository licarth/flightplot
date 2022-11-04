import { pipe } from 'fp-ts/lib/function';
import { fold } from 'fp-ts/lib/Option';
import styled from 'styled-components';
import type { Airspace, DangerZone } from 'ts-aerodata-france';
import { Colors } from './Colors';
import { borderColor } from './CtrSVGPolygon';
import { IgnAirspaceNameFont } from './IgnAirspaceNameFont';
import { AirspaceContainer, Centered } from './InnerMapContainer';

export const AirspaceDescriptionTooltip = ({ airspace }: { airspace: Airspace | DangerZone }) => {
    const { name, lowerLimit, higherLimit } = airspace;
    const airspaceClass = ['CTR', 'TMA', 'CTA'].includes(airspace.type)
        ? airspace.airspaceClass
        : null;

    const color = ['P', 'D', 'R'].includes(airspace.type)
        ? Colors.pThickBorder
        : borderColor(airspace).thin;

    return (
        <AirspaceContainer>
            <Centered>
                <IgnAirspaceNameFont $color={color}>
                    <AirspaceNameContainer>
                        <AirspaceNameSeparator $color={color} />
                        <AirspaceName>{name}</AirspaceName>
                        <AirspaceNameSeparator $color={color} />
                    </AirspaceNameContainer>
                    <AltitudeFrame $color={color}>
                        <i>
                            <AltitudeValue>{higherLimit.toString()}</AltitudeValue>
                            <SeparationLine>
                                {airspaceClass && (
                                    <AirspaceClass $color={color}>
                                        {`${pipe(
                                            airspaceClass,
                                            fold(
                                                () => '',
                                                (c) => c,
                                            ),
                                        )}`}
                                    </AirspaceClass>
                                )}
                                <Separator $color={color} />
                            </SeparationLine>
                            <AltitudeValue>{lowerLimit.toString()}</AltitudeValue>
                        </i>
                    </AltitudeFrame>
                </IgnAirspaceNameFont>{' '}
            </Centered>
        </AirspaceContainer>
    );
};

const AirspaceClass = styled.span<{ $color: string }>`
    /* font-size: 0.8em; */
    position: absolute;
    padding: 0 2px 0 2px;
    color: white;
    background-color: ${(props) => props.$color};
    transform: translateX(-50%);
    font-style: normal;
`;

const SeparationLine = styled.div`
    display: flex;
    align-items: center;
    justify-content: stretch;
`;

const Separator = styled.div<{ $color: string }>`
    height: 1px;
    background-color: ${(props) => props.$color};
    flex-grow: 1;
`;
const AirspaceNameSeparator = styled.div<{ $color: string }>`
    height: 2px;
    background-color: ${(props) => props.$color};
    flex-grow: 1;
    min-width: 5px;
`;

const AirspaceName = styled.div`
    padding: 0 2px 0 2px;
`;

const AltitudeFrame = styled.div<{ $color: string }>`
    padding-top: 0.5rem;
    border-left: 2px solid ${(props) => props.$color};
    border-right: 2px solid ${(props) => props.$color};
    border-bottom: 2px solid ${(props) => props.$color};
`;

const AirspaceNameContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: stretch;
    transform: translateY(50%);
    margin-top: -1rem;
`;

const AltitudeValue = styled.span`
    padding: 0 0.5rem 0 0.5rem;
`;
