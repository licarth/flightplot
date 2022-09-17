import { Tooltip } from 'react-leaflet';
import type { Airspace } from 'ts-aerodata-france';
import { Colors } from '../Colors';
import { IgnAirspaceNameFont } from '../IgnAirspaceNameFont';
import { AirspaceSVGPolygon } from './AirspaceSVGPolygon';

type CtrSVGPolygonProps = {
    ctr: Airspace;
    i: number;
};

export const CtrSVGPolygon = ({ ctr, i }: CtrSVGPolygonProps) => {
    const { geometry, name, lowerLimit, higherLimit, airspaceClass } = ctr;

    return (
        <AirspaceSVGPolygon
            key={`ctr-${name}`}
            i={i}
            geometry={geometry}
            name={name}
            thinBorderColor={Colors.ctrBorderBlue}
            thickBorderColor={Colors.ctrBorderLightBlue}
            thinDashArray="5, 5"
            prefix="ctr"
        >
            <Tooltip sticky opacity={1} offset={[10, 0]} key={`tooltip-airspace-${name}`}>
                <IgnAirspaceNameFont>
                    <b>
                        {name} [{airspaceClass}]
                    </b>
                    <br />
                    <div>
                        <i>
                            {higherLimit.toString()}
                            <hr />
                            {lowerLimit.toString()}
                        </i>
                    </div>
                </IgnAirspaceNameFont>
            </Tooltip>
        </AirspaceSVGPolygon>
    );
};
