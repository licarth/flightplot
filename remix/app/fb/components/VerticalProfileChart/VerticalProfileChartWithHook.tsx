import { useRoute } from '../useRoute';
import { VerticalProfileChart } from './VerticalProfileChart';

export const VerticalProfileChartWithHook = ({ fitToSpace }: { fitToSpace?: boolean }) => {
    const { route, airspaceOverlaps, elevation, setWaypointAltitude } = useRoute();
    if (!route) {
        return <></>;
    }
    return (
        <VerticalProfileChart
            route={route}
            airspaceOverlaps={airspaceOverlaps}
            elevation={elevation}
            setWaypointAltitude={setWaypointAltitude}
            fitToSpace={fitToSpace}
        />
    );
};
