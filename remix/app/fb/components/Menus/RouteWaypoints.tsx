import type { DragEndEvent } from '@dnd-kit/core';
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from 'antd';
import { useCallback } from 'react';
import styled from 'styled-components';
import { useHelpPage } from '../HelpPageContext';
import type { Collapsible } from '../Map/CollapsibleDiv';
import { CollapsibleDiv } from '../Map/CollapsibleDiv';
import { RouteElement } from '../Map/RouteElement';
import { useRoute } from '../useRoute';

export const RouteWaypoints = ({ collapsed }: Collapsible) => {
    const routeContext = useRoute();
    const { route, removeWaypoint, moveWaypoint } = routeContext;

    const { goToPage } = useHelpPage();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (over == null) {
                return;
            }
            moveWaypoint(Number(active.id), Number(over.id));
        },
        [moveWaypoint],
    );

    if (!route) {
        return <></>;
    } else {
        const routeContextWithRoute = { ...routeContext, route: route! };
        const items = route.waypoints.map((w, i) => ({ ...w, id: `${i}` }));
        return (
            <CollapsibleDiv collapsed={collapsed}>
                <RouteWaypointsContainer>
                    <RouteWaipointElements>
                        {route.waypoints.length === 0 && (
                            <div style={{ textAlign: 'center' }}>
                                ⚠️ La route est vide
                                <br />
                                🖱️ Cliquez sur la carte pour ajouter un point de report ou un
                                terrain de départ.
                                <br />
                                <Button
                                    onClick={() => {
                                        goToPage('1beae6f637464a0182175343863ba252');
                                    }}
                                >
                                    Aide
                                </Button>
                            </div>
                        )}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                            modifiers={[restrictToVerticalAxis]}
                        >
                            <SortableContext items={items} strategy={verticalListSortingStrategy}>
                                {route.waypoints.map((w, i) => (
                                    <RouteElement
                                        routeContextWithRoute={routeContextWithRoute}
                                        key={`route-element-${i}`}
                                        waypointPosition={i}
                                        removeWaypoint={removeWaypoint}
                                        waypoint={w}
                                    />
                                ))}{' '}
                            </SortableContext>
                        </DndContext>
                    </RouteWaipointElements>
                </RouteWaypointsContainer>
            </CollapsibleDiv>
        );
    }
};

const RouteWaypointsContainer = styled.div`
    overflow-y: auto;
`;

const RouteWaipointElements = styled.div`
    overflow-y: scroll;
`;
