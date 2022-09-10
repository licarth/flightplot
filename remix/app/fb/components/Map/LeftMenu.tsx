import _ from 'lodash';
import { useRef, useState } from 'react';
import styled from 'styled-components';
import { AerodromeWaypoint, AerodromeWaypointType, Route } from '../../domain';
import { useFirebaseAuth } from '../../firebase/auth/FirebaseAuthContext';
import Modal from '../../Modal';
import { useRoute } from '../useRoute';
import { useUserRoutes } from '../useUserRoutes';
import { H2 } from './H2';
import { PrintOptions } from './PrintOptions';
import { RouteWaypoints } from './RouteWaypoints';

const ContainerDiv = styled.div`
    width: 50px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    @media (min-width: 1024px) {
        & {
            width: 400px;
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

const RouteDisplay = () => {
    return (
        <RouteContainer>
            <MyRoutes />
            <RouteWaypoints />
            <hr />
            <PrintOptions />
            <hr />
        </RouteContainer>
    );
};

const RouteContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin: 10px;
    border: 1px black;
    height: 100%;
`;

const MyRoutes = () => {
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

const NavigationsList = styled.div`
    display: flex;
    flex-direction: column;
`;

const NewNavButton = styled.button`
    margin-bottom: 10px;
    text-align: center;
    height: 30px;
`;

const RouteLine = ({ route, routeName }: { route: Route; routeName: string | null }) => {
    const { route: currentlyEditedRoute, switchRoute, setRoute } = useRoute();
    const { deleteRoute, setRouteTitle } = useUserRoutes();
    const [editingTitle, setEditingTitle] = useState(false);
    const isCurrentRoute = currentlyEditedRoute?.id.toString() === route.id.toString();
    const deleteConfirmModal = useRef(null);
    const deleteRouteAndUnfocus = () => {
        deleteRoute(route.id);
        setRoute(() => undefined);
    };
    return (
        <RouteLineDiv isCurrentRoute={isCurrentRoute} onClick={() => switchRoute(route.id)}>
            <RouteLineLeft>
                {editingTitle ? (
                    <StyledNameInput
                        id={`input-route-title-name-${route.id}`}
                        defaultValue={route.title || ''}
                        size={1}
                        step={500}
                        onBlur={(e) => {
                            setRouteTitle({
                                routeId: route.id,
                                title: e.currentTarget.value,
                            });
                            setEditingTitle(false);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                setEditingTitle(false);
                            } else if (e.key === 'Enter') {
                                setRouteTitle({
                                    routeId: route.id,
                                    title: e.currentTarget.value,
                                });
                                setEditingTitle(false);
                            }
                        }}
                        autoFocus
                    />
                ) : (
                    <TitleContainer onClick={() => setEditingTitle(true)}>
                        {routeName || '<no title>'}
                    </TitleContainer>
                )}
                {route.waypoints
                    .filter(AerodromeWaypoint.isAerodromeWaypoint)
                    .filter(({ waypointType }) => waypointType === AerodromeWaypointType.RUNWAY)
                    .map(({ name }) => name)
                    .join(' => ')}
            </RouteLineLeft>
            <DeleteDiv
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return route.waypoints.length > 0
                        ? // @ts-ignore
                          deleteConfirmModal.current?.open()
                        : deleteRouteAndUnfocus();
                }}
            >
                🗑️
            </DeleteDiv>
            <Modal fade={false} defaultOpened={false} ref={deleteConfirmModal}>
                <ConfirmDeleteRouteDiv>
                    Êtes-vous sûr(e) de vouloir supprimer cette navigation ?<br />
                    <ConfirmDeleteRouteButton
                        onClick={() => {
                            //@ts-ignore
                            deleteConfirmModal.current?.close();
                            if (`${currentlyEditedRoute?.id}` === `${route.id}`) {
                                setRoute(() => undefined);
                            }
                            deleteRouteAndUnfocus();
                        }}
                    >
                        ❌ Confirmer la suppression de la route
                    </ConfirmDeleteRouteButton>
                </ConfirmDeleteRouteDiv>
            </Modal>
        </RouteLineDiv>
    );
};

const ConfirmDeleteRouteDiv = styled.div`
    display: flex;
    height: 80px;
    justify-content: space-between;
    flex-direction: column;
`;

const ConfirmDeleteRouteButton = styled.button`
    height: 30px;
`;

const DeleteDiv = styled.button`
    background: none;
    border: none;
    display: inline-block;
    padding-left: 10px;
    cursor: pointer;
`;

const StyledNameInput = styled.input`
    width: 100px;
`;

const RouteLineDiv = styled.div<{ isCurrentRoute: boolean }>`
    display: flex;
    justify-content: space-between;
    :hover {
        background: #f597006d;
        color: white;
        cursor: pointer;
    }
    ${({ isCurrentRoute }) => (isCurrentRoute ? 'background: #f59700; color: white;' : '')}
`;

const RouteLineLeft = styled.div`
    display: flex;
    justify-content: space-between;
`;

const TitleContainer = styled.div`
    display: inline-block;
    width: 100px;

    min-height: 1em;
    font-weight: bold;
    border-bottom: 1px solid #000;
    text-decoration: none;
`;

const NavigationItemsList = styled.div`
    max-height: 20vh;
    overflow-y: scroll;
`;

const NavigationCollapsibleDiv = styled.div<{ collapsed?: boolean }>`
    ${({ collapsed }) => collapsed && 'height: 0px'};
    overflow: hidden;
`;
