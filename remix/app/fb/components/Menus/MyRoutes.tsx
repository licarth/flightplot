import { Button, Input } from 'antd';
import _ from 'lodash';
import { useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import styled from 'styled-components';
import { AerodromeWaypoint, AerodromeWaypointType, Route } from '../../../domain';
import { useFirebaseAuth } from '../../firebase/auth/FirebaseAuthContext';
import Modal from '../../Modal';
import { CollapsibleDiv } from '../Map/CollapsibleDiv';
import { NewNavButton } from '../Map/LeftMenu';
import { useMainMap } from '../Map/MainMapContext';
import { useRoute } from '../useRoute';
import { useUserRoutes } from '../useUserRoutes';

type OnRouteSelect = (route: Route) => void;

export const MyRoutes = ({
    onRouteSelect = () => {},
    collapsed = false,
}: {
    onRouteSelect?: OnRouteSelect;
    collapsed?: boolean;
}) => {
    const { user, loading: authLoading } = useFirebaseAuth();
    const { routes, saveRoute, loading: routesLoading } = useUserRoutes();
    const { setRoute } = useRoute();

    const loading = authLoading || routesLoading;

    if (loading) {
        return <>Loading...</>;
    } else if (!user) {
        return <></>;
    } else {
        return (
            <CollapsibleDiv collapsed={collapsed}>
                <NewNavButton
                    onClick={() => {
                        const newRoute = Route.empty();
                        saveRoute(newRoute);
                        setRoute(() => newRoute);
                        onRouteSelect(newRoute);
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
                            onRouteSelect={onRouteSelect}
                        />
                    ))}
                </NavigationItemsList>
            </CollapsibleDiv>
        );
    }
};

const RouteLine = ({
    route,
    routeName,
    onRouteSelect = () => {},
}: {
    route: Route;
    routeName: string | null;
    onRouteSelect?: OnRouteSelect;
}) => {
    const { route: currentlyEditedRoute, switchRoute, setRoute } = useRoute();
    const { deleteRoute, setRouteTitle } = useUserRoutes();
    const [editingTitle, setEditingTitle] = useState(false);
    const isCurrentRoute = currentlyEditedRoute?.id.toString() === route.id.toString();
    const deleteConfirmModal = useRef(null);
    const deleteRouteAndUnfocus = () => {
        setRoute(() => undefined);
        deleteRoute(route.id);
    };

    const { map } = useMainMap();
    return (
        <RouteLineDiv isCurrentRoute={isCurrentRoute}>
            <RouteLineLeft
                onClick={() => {
                    onRouteSelect(route);
                    switchRoute(route.id);
                    route.waypoints.length > 0 &&
                        map &&
                        map.flyToBounds(route.leafletBoundingBox, {
                            maxZoom: 11,
                            animate: false,
                            padding: isMobile ? undefined : [100, 100], // Problematic on mobile
                        });
                }}
            >
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
                    <TitleContainer
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingTitle(true);
                        }}
                    >
                        {routeName || '<no title>'}
                    </TitleContainer>
                )}
                <RouteSummaryContainer>
                    {route.waypoints
                        .filter(AerodromeWaypoint.isAerodromeWaypoint)
                        .filter(({ waypointType }) => waypointType === AerodromeWaypointType.RUNWAY)
                        .map(({ name }) => name)
                        .join(' → ')}
                </RouteSummaryContainer>
            </RouteLineLeft>
            <RouteLineButtons>
                <DeleteDiv
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        return route.waypoints.length > 0
                            ? // @ts-ignore
                              deleteConfirmModal.current?.open()
                            : deleteRouteAndUnfocus();
                    }}
                >
                    🗑️
                </DeleteDiv>
            </RouteLineButtons>
            <Modal fade={false} defaultOpened={false} ref={deleteConfirmModal}>
                <ConfirmDeleteRouteDiv>
                    Êtes-vous sûr(e) de vouloir supprimer cette navigation ?<br />
                    <ConfirmDeleteRouteButton
                        autoFocus
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

const DeleteDiv = styled(Button)`
    background: none;
    border: none;
    display: inline-block;
    padding-left: 10px;
    cursor: pointer;
`;

const StyledNameInput = styled(Input)`
    flex-grow: 1;
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
    flex-grow: 1;
`;

const TitleContainer = styled.div`
    width: 100px;

    min-height: 1em;
    font-weight: bold;
    border-bottom: 1px solid #000;
    text-decoration: none;
`;

const RouteLineButtons = styled.div``;
