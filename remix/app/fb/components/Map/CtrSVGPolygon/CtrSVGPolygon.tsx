import { memo } from 'react';
import type { Airspace, AirspaceType } from 'ts-aerodata-france';
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
            thinBorderColor={borderColor(type).thin}
            thickBorderColor={borderColor(type).thick}
            thickBorderWidth={3}
            thinDashArray={dashArray(type)}
            thinBorderWidth={thinBorderWidth(type)}
            highlightedThinBorderWidth={highlightedThinBorderWidth(type)}
            prefix="ctr-tma-siv"
        />
    );
});

function thinBorderWidth(type: AirspaceType): number | undefined {
    if (type === 'CTR') {
        return 0.6;
    } else if (type === 'SIV') {
        return 1.5;
    } else {
        return 0.3;
    }
}

function dashArray(type: AirspaceType): string {
    if (['CTR'].includes(type)) {
        return '5, 5';
    } else if (type === 'SIV') {
        return '1,1';
    } else {
        // CTA, TMA
        return 'none';
    }
}

function borderColor(type: AirspaceType): { thin: string; thick: string } {
    if (['CTR', 'CTA', 'TMA'].includes(type)) {
        return { thin: Colors.ctrBorderBlue, thick: Colors.ctrBorderLightBlue };
    } else if (type === 'SIV') {
        return { thin: Colors.sivThinBorder, thick: Colors.sivThickBorder };
    } else {
        return { thin: 'red', thick: 'red' };
    }
}

function highlightedThinBorderWidth(type: AirspaceType): number | undefined {
    if (type === 'SIV') {
        return 1.5;
    }
    return undefined;
}
