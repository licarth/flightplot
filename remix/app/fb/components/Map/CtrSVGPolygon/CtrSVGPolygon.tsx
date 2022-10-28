import { memo } from 'react';
import type { Airspace } from 'ts-aerodata-france';
import { Colors } from '../Colors';
import { AirspaceSVGPolygon } from './AirspaceSVGPolygon';

type CtrSVGPolygonProps = {
    ctr: Airspace;
    i: number;
    highlighted?: boolean;
};

export const CtrSVGPolygon = memo(function CtrSVGPolygon({
    ctr,
    i,
    highlighted,
}: CtrSVGPolygonProps) {
    const { geometry, name } = ctr;

    return (
        <AirspaceSVGPolygon
            highlighted={highlighted || false}
            key={`ctr-${name}`}
            i={i}
            geometry={geometry}
            name={name}
            thinBorderColor={Colors.ctrBorderBlue}
            thickBorderColor={Colors.ctrBorderLightBlue}
            thinDashArray="5, 5"
            prefix="ctr"
        />
    );
});
