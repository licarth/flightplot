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
import { AiracData } from "ts-aerodata-france";
import { Route } from "../../domain";
import { VerticalProfileChart } from "../VerticalProfileChart";
import {
  MoveWaypoint,
  RemoveWaypoint,
  SetWaypointAltitude,
} from "./LeafletMap";
import { RouteElement } from "./RouteElement";

const ContainerDiv = styled.div`
  width: 400px;
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
  const print = () => {
    window.print();
  };

  return (
    <RouteContainer>
      <H2>ROUTE</H2>
      {route.waypoints.length === 0 && (
        <div style={{ textAlign: "center" }}>
          ⚠️ Your route is empty !<br />
          🖱️ Click on the map to add a waypoint
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
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
      <hr />
      <Tips />
      <hr />
      <H2>IMPRIMER</H2>
      <div>
        <label htmlFor="print-navlog">Log de Navigation</label>
        <input type="checkbox" disabled checked id="print-navlog" />
      </div>
      <div>
        <label htmlFor="print-map">Carte 1 / 500 000 ème (soon)</label>
        <input type="checkbox" disabled id="print-map" />
      </div>
      <div>
        <label htmlFor="print-vertical-profile">Profile Vertical (soon)</label>
        <input type="checkbox" disabled id="print-vertical-profile" />
      </div>
      <button onClick={print}>IMPRIMER</button>
      <hr />
    </RouteContainer>
  );
};

const RouteContainer = styled.div`
  margin: 10px;
  border: 1px black;
`;

const H2 = styled.h2`
  text-align: center;
`;

const Tips = () => (
  <TipsContainer>
    <H2>TIPS</H2>
    <ul>
      <li>❌ Faites un click droit sur un waypoint pour le supprimer</li>
      <li>🖨️ Imprimez votre log de navigation avec le menu ci-dessous 👇️</li>
    </ul>
  </TipsContainer>
);

const TipsContainer = styled.div`
  ul {
    list-style: none;
    margin-left: 0;
    padding-left: 0;
  }

  li {
    padding-left: 1em;
    text-indent: -1em;
  }

  li:before {
    content: "->";
    padding-right: 5px;
  }
`;