import { pipe } from 'fp-ts/lib/function';
import { fold } from 'fp-ts/lib/Option';
import type { Airspace, DangerZone } from 'ts-aerodata-france';
import { Colors } from './Colors';
import { IgnAirspaceNameFont } from './IgnAirspaceNameFont';
import { AirspaceContainer, Centered } from './InnerMapContainer';

export const AirspaceDescriptionTooltip = ({ airspace }: { airspace: Airspace | DangerZone }) => {
    const { name, lowerLimit, higherLimit } = airspace;
    const airspaceClass = ['CTR', 'TMA', 'CTA'].includes(airspace.type)
        ? airspace.airspaceClass
        : null;
    return (
        <AirspaceContainer>
            <Centered>
                <IgnAirspaceNameFont
                    $color={
                        ['P', 'D', 'R'].includes(airspace.type)
                            ? Colors.pThickBorder
                            : ['CTR', 'TMA', 'CTA'].includes(airspace.type)
                            ? Colors.ctrBorderBlue
                            : Colors.sivThinBorder
                    }
                >
                    <b>
                        {name}{' '}
                        {airspaceClass &&
                            `[${pipe(
                                airspaceClass,
                                fold(
                                    () => '',
                                    (c) => c,
                                ),
                            )}]`}
                    </b>
                    <br />
                    <div>
                        <i>
                            {higherLimit.toString()}
                            <hr />
                            {lowerLimit.toString()}
                        </i>
                    </div>
                </IgnAirspaceNameFont>{' '}
            </Centered>
        </AirspaceContainer>
    );
};
