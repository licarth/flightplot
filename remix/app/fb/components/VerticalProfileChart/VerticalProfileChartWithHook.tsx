import { useRoute } from '../useRoute';
import { VerticalProfileChart } from './VerticalProfileChart';

export const VerticalProfileChartWithHook = () => {
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
        />
    );
};
