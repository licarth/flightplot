import { isVor } from '../FixtureDetails/FixtureDetails';
import { useAiracData } from '../useAiracData';
import type { MapBounds } from './DisplayedContent';
import { useFixtureFocus } from './FixtureFocusContext';
import { VorMarker } from './VorMarker';

export const Vors = ({ mapBounds }: { mapBounds: MapBounds }) => {
    const data = useAiracData();
    const { airacData, loading } = data;
    const { highlightedFixture } = useFixtureFocus();

    return (
        <>
            {mapBounds &&
                !loading &&
                airacData.getVorsInBbox(...mapBounds).map((vor) => {
                    return (
                        <VorMarker
                            key={`vor-${vor.name}`}
                            vor={vor}
                            highlit={
                                isVor(highlightedFixture) && highlightedFixture.ident === vor.ident
                            }
                        />
                    );
                })}
        </>
    );
};
