import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { useCallback } from "react";
import styled from "styled-components";
import { AiracData } from "ts-aerodata-france";
import { Route } from "../../domain";
import { VerticalProfileChart } from "../VerticalProfileChart";
import {
  MoveWaypoint,
  RemoveWaypoint,
  SetWaypointAltitude
} from "./LeafletMap";
import { RouteElement } from "./RouteElement";

const ContainerDiv = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const LeftMenu = ({
  route,
  airacData,
  setWaypointAltitude,
  removeWaypoint,
  moveWaypoint,
}: {
  route: Route;
  airacData: AiracData;
  setWaypointAltitude: SetWaypointAltitude;
  removeWaypoint: RemoveWaypoint;
  moveWaypoint: MoveWaypoint;
}) => (
  <ContainerDiv>
    <RouteDisplay
      route={route}
      removeWaypoint={removeWaypoint}
      moveWaypoint={moveWaypoint}
    />
    <VerticalProfileChart
      route={route}
      airacData={airacData}
      setWaypointAltitude={setWaypointAltitude}
    />
  </ContainerDiv>
);

const RouteDisplay = ({
  route,
  removeWaypoint,
  moveWaypoint,
}: {
  route: Route;
  removeWaypoint: RemoveWaypoint;
  moveWaypoint: MoveWaypoint;
}) => {
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
    <div>
      <H2>ROUTE</H2>
      <hr />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {" "}
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {route.waypoints.map((w, i) => (
            <RouteElement
              waypointPosition={i}
              removeWaypoint={removeWaypoint}
              waypoint={w}
            />
          ))}{" "}
        </SortableContext>{" "}
      </DndContext>
      {/* <hr /> */}
      {/* <H2>PRINT</H2> */}
      {/* <input type="checkbox">Navigation Log</input> */}
      <hr />
    </div>
  );
};

const H2 = styled.h2`
  text-align: center;
`;
