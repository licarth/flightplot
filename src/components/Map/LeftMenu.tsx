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
import { pipe } from "fp-ts/lib/function";
import { useCallback, useRef } from "react";
import styled from "styled-components";
import { AiracData } from "ts-aerodata-france";
import { Route } from "../../domain";
import Modal from "../../Modal";
import { useRoute } from "../useRoute";
import { VerticalProfileChart } from "../VerticalProfileChart";
import { RouteElement } from "./RouteElement";

const ContainerDiv = styled.div`
  width: 400px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const LeftMenu = ({ airacData }: { airacData: AiracData }) => {
  const vpModal = useRef(null);
  return (
    <ContainerDiv>
      <RouteDisplay airacData={airacData} />
      {/* @ts-ignore */}
      <VerticalProfileDiv onClick={() => vpModal.current?.open()}>
        <VerticalProfileChart airacData={airacData} />
      </VerticalProfileDiv>
      <Modal fade={false} defaultOpened={false} ref={vpModal}>
        <VerticalProfileModalDiv>
          <VerticalProfileChart airacData={airacData} />
        </VerticalProfileModalDiv>
      </Modal>
    </ContainerDiv>
  );
};

const RouteDisplay = ({ airacData }: { airacData: AiracData }) => {
  const { route, moveWaypoint, removeWaypoint } = useRoute();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const saveRoute = useCallback(() => {
    window.localStorage.setItem(
      "route",
      pipe(Route.codec(airacData).encode(route), JSON.stringify),
    );
  }, [route, airacData]);

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
    <RouteContainer>
      <H2>ROUTE</H2>
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
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {route.waypoints.map((w, i) => (
            <RouteElement
              waypointPosition={i}
              removeWaypoint={removeWaypoint}
              waypoint={w}
            />
          ))}{" "}
        </SortableContext>
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
        <label htmlFor="print-vertical-profile">Profile Vertical</label>
        <input type="checkbox" disabled checked id="print-vertical-profile" />
      </div>
      <div>
        <label htmlFor="print-map">Carte 1 / 500 000 ème (soon)</label>
        <input type="checkbox" disabled id="print-map" />
      </div>{" "}
      <button onClick={() => window.print()}>Imprimer</button>
      <button onClick={saveRoute}>Sauver la route</button>
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
      <li>❌ Faites un click droit sur un waypoint pour éditer son nom</li>
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

const VerticalProfileDiv = styled.div`
  width: 100%;
  height: 250px;
  background-color: white;
  overflow: hidden;
`;

const VerticalProfileModalDiv = styled.div`
  width: 80vw;
  height: 80vh;
  z-index: 10000;

  @media print {
    width: 100%;
    height: 100%;
  }
`;
