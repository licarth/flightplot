import _ from 'lodash';
import { useState } from 'react';
import { Route } from '../../domain';
import { useFirebaseAuth } from '../../firebase/auth/FirebaseAuthContext';
import { useRoute } from '../useRoute';
import { useUserRoutes } from '../useUserRoutes';
import { H2 } from './H2';
import {
    NavigationCollapsibleDiv,
    NavigationItemsList,
    NavigationsList,
    NewNavButton,
    RouteLine,
} from './LeftMenu';

export const MyRoutes = () => {
    const { user } = useFirebaseAuth();
    const { routes, saveRoute } = useUserRoutes();
    const { setRoute } = useRoute();
    const [collapsed, setCollapsed] = useState(false);

    if (!user) {
        return <></>;
    } else {
        return (
            <NavigationsList>
                {' '}
                <H2 onClick={() => setCollapsed((v) => !v)}>MES NAVIGATIONS</H2>
                <NavigationCollapsibleDiv collapsed={collapsed}>
                    <NewNavButton
                        onClick={() => {
                            const newRoute = Route.empty();
                            saveRoute(newRoute);
                            setRoute(() => newRoute);
                        }}
                    >
                        ➕ Nouvelle navigation
                    </NewNavButton>
                    <NavigationItemsList>
                        {_.map(_.sortBy(routes, 'title'), (route, key) => (
                            <RouteLine
                                key={`routeline-${key}`}
                                route={route}
                                routeName={route.title}
                            />
                        ))}
                    </NavigationItemsList>
                </NavigationCollapsibleDiv>
            </NavigationsList>
        );
    }
};
