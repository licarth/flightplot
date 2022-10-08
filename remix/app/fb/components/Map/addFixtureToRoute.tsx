import { toLatLng } from '~/domain';
import type { UseRouteProps } from '../useRoute';
import { isAerodrome, isVfrPoint } from './FixtureDetails';
import type { FocusableFixture } from './FixtureFocusContext';

export const addFixtureToRoute = ({
    fixture: f,
    routeContext: { addAerodromeWaypoint, addLatLngWaypoint },
}: {
    fixture: FocusableFixture;
    routeContext: UseRouteProps;
}) => {
    if (isVfrPoint(f)) {
        addLatLngWaypoint({ latLng: toLatLng(f.latLng), name: f.name });
    } else if (isAerodrome(f)) {
        addAerodromeWaypoint({ aerodrome: f });
    }
};
