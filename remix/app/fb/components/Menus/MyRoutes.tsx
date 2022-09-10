import _ from 'lodash';
import { useRef, useState } from 'react';
import styled from 'styled-components';
import { AerodromeWaypoint, AerodromeWaypointType, Route } from '../../domain';
import { useFirebaseAuth } from '../../firebase/auth/FirebaseAuthContext';
import Modal from '../../Modal';
import { CollapsibleDiv } from '../Map/CollapsibleDiv';
import { NavigationsList, NewNavButton } from '../Map/LeftMenu';
import { useRoute } from '../useRoute';
import { useUserRoutes } from '../useUserRoutes';

export const MyRoutes = ({ collapsed = false }: { collapsed?: boolean }) => {
    const { user } = useFirebaseAuth();
    const { routes, saveRoute } = useUserRoutes();
    const { setRoute } = useRoute();

    if (!user) {
        return <></>;
    } else {
        return (
            <NavigationsList>
                <CollapsibleDiv collapsed={collapsed}>
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
                </CollapsibleDiv>
            </NavigationsList>
        );
    }
};

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
                <RouteSummaryContainer>
                    {route.waypoints
                        .filter(AerodromeWaypoint.isAerodromeWaypoint)
                        .filter(({ waypointType }) => waypointType === AerodromeWaypointType.RUNWAY)
                        .map(({ name }) => name)
                        .join(' => ')}
                </RouteSummaryContainer>
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

const NavigationItemsList = styled.div`
    max-height: 20vh;
    overflow-y: scroll;
`;

const RouteSummaryContainer = styled.div`
    word-wrap: break-word;
    min-height: 40px;
`;

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
    width: 100px;

    min-height: 1em;
    font-weight: bold;
    border-bottom: 1px solid #000;
    text-decoration: none;
`;
