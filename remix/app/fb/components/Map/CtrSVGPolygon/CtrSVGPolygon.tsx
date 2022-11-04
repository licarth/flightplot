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
    const { geometry, name, type } = ctr;

    return (
        <AirspaceSVGPolygon
            highlighted={highlighted || false}
            key={`ctr-${name}`}
            i={i}
            geometry={geometry}
            name={name}
            thinBorderColor={type === 'CTR' ? Colors.ctrBorderBlue : Colors.tmaBorderViolet}
            thickBorderColor={
                type === 'CTR' ? Colors.ctrBorderLightBlue : Colors.tmaBorderLightViolet
            }
            thickBorderWidth={type === 'CTR' ? 4 : 6}
            thinDashArray={type === 'CTR' ? '5, 5' : 'none'}
            thinBorderWidth={type === 'CTR' ? 0.6 : 0.3}
            prefix="ctr-tma"
        />
    );
});
