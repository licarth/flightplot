import { useContext } from 'react';
import type { UUID } from '../../domain/Uuid/Uuid';
import { UserRoutesContext } from './UserRoutesContext';

export type SetRouteTitle = ({ title, routeId }: { title: string; routeId: UUID }) => void;

export const useUserRoutes = () => {
    const { routes, saveRoute, deleteRoute, lastLocalChangeAt, listenToRouteChanges, loading } =
        useContext(UserRoutesContext);

    const setRouteTitle: SetRouteTitle = ({ title, routeId }) => {
        const route = routes[routeId.toString()];
        if (route) {
            saveRoute(route.setTitle(title));
        } else {
            console.error(`no matching route with id ${routeId}`);
        }
    };

    return {
        routes,
        setRouteTitle,
        saveRoute,
        deleteRoute,
        lastLocalChangeAt,
        listenToRouteChanges,
        loading,
    };
};
