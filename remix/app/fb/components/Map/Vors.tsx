import type { Aerodrome } from 'ts-aerodata-france';
import { useAiracData } from '../useAiracData';
import type { MapBounds } from './DisplayedContent';
import { VorMarker } from './VorMarker';

export const Vors = ({
    onClick,
    mapBounds,
}: {
    onClick: (event: MouseEvent, aerodrome: Aerodrome) => void;
    mapBounds: MapBounds;
}) => {
    const { airacData } = useAiracData();
    return (
        <>
            {mapBounds &&
                airacData.getVorsInBbox(...mapBounds).map((vor) => {
                    return <VorMarker vor={vor} />;
                })}
        </>
    );
};
