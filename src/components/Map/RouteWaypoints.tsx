import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback } from "react";
import styled from "styled-components";
import { useRoute } from "../useRoute";
import { RouteElement } from "./RouteElement";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

export const RouteWaypoints = () => {
  const { route, removeWaypoint, moveWaypoint } = useRoute();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const items = route.waypoints.map((w, i) => ({ ...w, id: `${i}` }));

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

  return (
    <RouteWaypointsContainer>
      {route.waypoints.length === 0 && (
        <div style={{ textAlign: "center" }}>
          ⚠️ La route est vide
          <br />
          🖱️ Cliquez sur la carte pour ajouter un point de report ou un terrain
          de départ.
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
              key={`route-element-${i}`}
              waypointPosition={i}
              removeWaypoint={removeWaypoint}
              waypoint={w}
            />
          ))}{" "}
        </SortableContext>
      </DndContext>
    </RouteWaypointsContainer>
  );
};

const RouteWaypointsContainer = styled.div`
  max-height: 500px;
  overflow-y: auto;
`;
