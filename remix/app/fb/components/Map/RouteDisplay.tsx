import { Spin } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';
import { MyRoutes, PrintOptions, RouteWaypoints } from '~/fb/components/Menus';
import { useFirebaseAuth } from '~/fb/firebase/auth/FirebaseAuthContext';
import { useRoute } from '../useRoute';
import { useUserRoutes } from '../useUserRoutes';
import { Header, SpinnerContainer, StyledCollapse, StyledPanel } from './LeftMenu';
import { NavigationLog } from './NavigationLog';

export const RouteDisplay = () => {
    const { user, loading: authLoading } = useFirebaseAuth();
    const { loading: routesLoading } = useUserRoutes();
    const loading = authLoading || routesLoading;

    const [activeKey, setActiveKey] = useState<string | string[]>([
        'routes',
        'details',
        'print',
        'navlog',
    ]);
    const { route } = useRoute();

    return (
        <StyledCollapse
            expandIcon={() => <></>}
            activeKey={activeKey}
            onChange={(keys) => setActiveKey(keys)}
            destroyInactivePanel
        >
            {loading ? (
                <SpinnerContainer>
                    <Spin size="large" />
                    <div>Chargement en cours...</div>
                </SpinnerContainer>
            ) : (
                <>
                    {user && (
                        <StyledPanel header="Mes navigations" key={'routes'} $shrinkable>
                            <MyRoutes onRouteSelect={() => setActiveKey(['details'])} />
                        </StyledPanel>
                    )}
                    <StyledPanel
                        $shrinkable
                        collapsible={(!route && 'disabled') || undefined}
                        header={
                            <Header>
                                {route && `${route?.title} (${route?.totalDistance.toFixed(1)} NM)`}
                            </Header>
                        }
                        style={!route ? { display: 'none' } : {}}
                        key="details"
                    >
                        <RouteWaypoints />
                    </StyledPanel>
                    <StyledPanel header="Impression" key="print">
                        <PrintOptions />
                    </StyledPanel>
                    {route && (
                        <StyledPanel header="Log de navigation" key="navlog">
                            <C>
                                {route.splitOnTouchAndGos().map((r, i) => (
                                    <NavigationLog key={`navlog-${i}`} route={r} tinyVersion />
                                ))}
                                {/* <NavigationLog route={route} tinyVersion /> */}
                            </C>
                        </StyledPanel>
                    )}
                </>
            )}
        </StyledCollapse>
    );
};

const C = styled.div`
    overflow-y: scroll;
    max-height: 60vh;
`;
