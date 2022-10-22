import { useAiracData } from '../useAiracData';
import type { MapBounds } from './DisplayedContent';
import { VorMarker } from './VorMarker';

export const Vors = ({ mapBounds }: { mapBounds: MapBounds }) => {
    const data = useAiracData();
    const { airacData, loading } = data;
    return (
        <>
            {mapBounds &&
                !loading &&
                airacData.getVorsInBbox(...mapBounds).map((vor) => {
                    return <VorMarker vor={vor} />;
                })}
        </>
    );
};
