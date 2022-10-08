import { Button, Collapse, Spin } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';
import { MyRoutes, PrintOptions, RouteWaypoints } from '~/fb/components/Menus';
import { useFirebaseAuth } from '~/fb/firebase/auth/FirebaseAuthContext';
import { useRoute } from '../useRoute';
import { useUserRoutes } from '../useUserRoutes';

const Panel = styled(Collapse.Panel)`
    font-family: 'Univers';
`;

const ContainerDiv = styled.div`
    display: none;

    @media (min-width: 1024px) {
        & {
            height: 100%;
            display: flex;
            min-width: 400px;
            width: 400px;
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 100000;
            filter: drop-shadow(5px 5px 10px #3c3c3c);
        }
    }
`;

export const LeftMenu = () => {
    return (
        <ContainerDiv>
            <RouteDisplay />
            {/* @ts-ignore */}
        </ContainerDiv>
    );
};

export const RouteDisplay = () => {
    const { user, loading: authLoading } = useFirebaseAuth();
    const { loading: routesLoading } = useUserRoutes();
    const loading = authLoading || routesLoading;

    const [activeKey, setActiveKey] = useState<string | string[]>(['routes', 'details', 'print']);
    const { route } = useRoute();

    return (
        <LeftColumn>
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
                                    {route &&
                                        `${route?.title} (${route?.totalDistance.toFixed(1)} NM)`}
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
                    </>
                )}
            </StyledCollapse>
        </LeftColumn>
    );
};

const LeftColumn = styled.div`
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    overflow: hidden;
    border: 1px black;
    max-height: 90%;
`;

const StyledPanel = styled(Panel)<{ $shrinkable?: boolean }>`
    display: flex;
    flex-direction: column;
    ${({ $shrinkable }) => {
        if ($shrinkable) {
            return `
            overflow: hidden;
            .ant-collapse-header {
                flex-shrink: 0;
            }
            .ant-collapse-content {
                flex-shrink: 1;
                overflow: scroll;
            }`;
        }
    }}
`;

const Header = styled.div`
    padding: 0px;
`;

export const NewNavButton = styled(Button)`
    margin-bottom: 10px;
    text-align: center;
    height: 30px;
`;

const StyledCollapse = styled(Collapse)`
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 7px;
`;

const SpinnerContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 3rem;
    margin-bottom: 3rem;
`;
