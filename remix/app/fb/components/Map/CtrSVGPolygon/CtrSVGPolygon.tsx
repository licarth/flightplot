import { pipe } from 'fp-ts/lib/function';
import { fold } from 'fp-ts/lib/Option';
import { memo } from 'react';
import type { Airspace, AirspaceType } from 'ts-aerodata-france';
import { Colors } from '../Colors';
import { AirspaceSVGPolygon } from './AirspaceSVGPolygon';

type CtrSVGPolygonProps = {
    ctr: Airspace;
    i: number;
    highlighted?: boolean;
    displayLabels: boolean;
};

export const CtrSVGPolygon = memo(function CtrSVGPolygon({
    ctr: airspace,
    i,
    highlighted,
    displayLabels,
}: CtrSVGPolygonProps) {
    const { geometry, name, type } = airspace;

    return (
        <AirspaceSVGPolygon
            highlighted={highlighted || false}
            key={`ctr-${name}`}
            geometry={geometry}
            name={name}
            thinBorderColor={borderColor(airspace).thin}
            thickBorderColor={borderColor(airspace).thick}
            thickBorderWidth={thickBorderWidth(airspace)}
            thinDashArray={dashArray(type)}
            thinBorderWidth={thinBorderWidth(airspace)}
            highlightedThinBorderWidth={highlightedThinBorderWidth(type)}
            prefix="ctr-tma-siv"
            displayLabels={displayLabels}
        />
    );
});

function thickBorderWidth(airspace: Airspace): number | undefined {
    if (getAirspaceClass(airspace) === 'E') {
        return 6;
    } else {
        return 3;
    }
}

function thinBorderWidth(airspace: Airspace): number | undefined {
    if (airspace.type === 'CTR') {
        return 0.6;
    } else if (airspace.type === 'SIV') {
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

export function borderColor(airspace: Airspace): { thin: string; thick: string } {
    const { type } = airspace;
    const airspaceClass = getAirspaceClass(airspace);
    if (['B', 'C', 'D'].includes(airspaceClass)) {
        return { thin: Colors.ctrBorderBlue, thick: Colors.ctrBorderLightBlue };
    } else if (['B', 'C', 'D', 'E'].includes(airspaceClass)) {
        return { thin: Colors.ctrBorderBlue, thick: Colors.ctrBorderVeryLightBlue };
    } else if (type === 'SIV') {
        return { thin: Colors.sivThinBorder, thick: Colors.sivThickBorder };
    } else if (['A'].includes(airspaceClass)) {
        return { thin: Colors.pThinBorder, thick: Colors.pThickBorder };
    } else {
        return { thin: Colors.ctrBorderBlue, thick: Colors.ctrBorderLightBlue };
    }
}

function getAirspaceClass(airspace: Airspace) {
    return pipe(
        airspace.airspaceClass,
        fold(
            () => '',
            (c) => `${c}`,
        ),
    );
}

function highlightedThinBorderWidth(type: AirspaceType): number | undefined {
    if (type === 'SIV') {
        return 1.5;
    }
    return undefined;
}
