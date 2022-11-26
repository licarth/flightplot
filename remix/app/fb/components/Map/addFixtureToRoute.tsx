import { isAerodrome, isVfrPoint, isVor } from '../FixtureDetails/FixtureDetails';
import type { UseRouteProps } from '../useRoute';
import type { FocusableFixture } from './FixtureFocusContext';
import { isLatLngWaypoint } from './FlightPlanningLayer';

export const addFixtureToRoute = ({
    fixture: f,
    routeContext: {
        addAerodromeWaypoint,
        addLatLngWaypoint,
        addVfrPointWaypoint,
        addVorDmeWaypoint,
    },
}: {
    fixture: FocusableFixture;
    routeContext: UseRouteProps;
}) => {
    if (isVfrPoint(f)) {
        addVfrPointWaypoint({ vfrPoint: f });
    } else if (isLatLngWaypoint(f)) {
        addLatLngWaypoint({ latLng: f.latLng, name: f.name });
    } else if (isAerodrome(f)) {
        addAerodromeWaypoint({ aerodrome: f });
    } else if (isVor(f)) {
        addVorDmeWaypoint({ vorDme: f, distanceInNm: 0, qdr: 0 });
    }
};
