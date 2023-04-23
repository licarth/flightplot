import { getDatabase } from 'firebase-admin/database';
import { either } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import { draw } from 'io-ts/lib/Decoder';
import { AiracData } from 'ts-aerodata-france';
import { AerodromeWpt } from '~/domain/Route/AerodromeWpt';
import { AltitudeInFeet } from '~/domain/Route/AltHeightFl';
import { LatLngWpt } from '~/domain/Route/LatLngWpt';
import { VfrWpt } from '~/domain/Route/VfrWpt';
import { VorWpt } from '~/domain/Route/VorWpt';
import type { VorPointWaypoint } from '~/domain/Waypoint/VorPointWaypoint';
import type { LatLngWaypoint } from '../app/domain';
import { AerodromeWaypoint, OldRoute, Route, UUID } from '../app/domain';
import { fetchCycle } from '../app/fb/components/AiracDataContext';
import { initializeApp } from '../app/utils/firebaseConfig.server';

const { firestore, app } = initializeApp({
    serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
});

(async () => {
    const cycle = await fetchCycle(AiracData.currentCycleDate());
    // Get documents from RTDB
    const rtdb = getDatabase(app);
    const routesSnapshot = await rtdb.ref('/routes').once('value');
    const newRoutes: [string, Route][] = [];
    routesSnapshot.forEach((userRoutesMap) => {
        const userId = userRoutesMap.key;
        userRoutesMap.forEach((route) => {
            const routeJsonString = route.val();
            const routeUuidString = route.key;
            const oldRoute = OldRoute.codec(cycle).decode(JSON.parse(routeJsonString));
            if (oldRoute._tag === 'Right') {
                const or = oldRoute.right;

                try {
                    userId &&
                        newRoutes.push([
                            userId,
                            new Route({
                                id: or.id,
                                title: or.title,
                                waypoints: or.waypoints.map(mapToWpt),
                                lastChangeAt: or.lastChangeAt,
                                printAreas: or.printAreas,
                            }),
                        ]);
                } catch (e) {
                    console.error(`Could not decode route ${userId} > ${routeUuidString}`, e);
                }
            } else {
                console.error(`Could not decode route ${routeUuidString}`, draw(oldRoute.left));
            }
        });
    });

    console.log('🔸', newRoutes.length, 'routes to migrate...');
    // console.log(JSON.stringify(_.take(newRoutes.map(Route.codec('firestore').encode), 1), null, 2));

    // list projects
    await firestore.runTransaction(async (t) => {
        newRoutes.forEach(async ([userId, route]) => {
            const routeDoc = firestore.doc(`/users/${userId}/routes/${route.id}`);
            // await firestore.recursiveDelete(firestore.collection(`/users`));
            t.set(routeDoc, Route.codec('firestore').encode(route));
        });
    });

    await firestore.terminate();
    console.log(`✅ migrated ${newRoutes.length} routes successfully to firestore`);
    process.exit(0);
})();

const isLatLngWaypoint = (w: any): w is LatLngWaypoint => {
    return w._latLng !== undefined;
};

const isVorDmePointWaypoint = (w: any): w is VorPointWaypoint => {
    return (w as VorPointWaypoint)._vorDme !== undefined;
};

const mapToWpt = (oldWpt: OldRoute['waypoints'][number]): Route['waypoints'][number] => {
    if (isLatLngWaypoint(oldWpt)) {
        return new LatLngWpt({
            name: oldWpt.name,
            id: pipe(
                UUID.parse(oldWpt.id),
                either.getOrElse(() => UUID.generatev4()),
            ),
            altHeightFl: oldWpt.altitude ? AltitudeInFeet.of(oldWpt.altitude) : null,
            latLng: oldWpt.latLng,
        });
    } else if (oldWpt instanceof AerodromeWaypoint) {
        return new AerodromeWpt({
            altHeightFl:
                oldWpt.waypointType === 'OVERFLY' ? AltitudeInFeet.of(oldWpt.altitude!) : null,
            icaoCode: `${oldWpt.aerodrome.icaoCode}`,
            waypointType: oldWpt.waypointType,
        });
    } else if (isVorDmePointWaypoint(oldWpt)) {
        return new VorWpt({
            altHeightFl: oldWpt.altitude ? AltitudeInFeet.of(oldWpt.altitude!) : null,
            ident: oldWpt.vorDmePoint.ident,
            distanceInNm: oldWpt.distanceInNm,
            qdr: oldWpt.qdr,
        });
    } else {
        if (oldWpt.vfrPoint === undefined) {
            throw `oldWpt.vfrPoint is undefined : ${JSON.stringify(oldWpt)}`;
        }
        return new VfrWpt({
            altHeightFl: oldWpt.altitude ? AltitudeInFeet.of(oldWpt.altitude!) : null,
            icaoCode: oldWpt.vfrPoint.icaoCode,
            ident: oldWpt.vfrPoint.id,
        });
    }
};
