import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styled from "styled-components";
import { AerodromeWaypoint, Waypoint } from "../../domain";
import { RemoveWaypoint } from "./LeafletMap";

type RouteElementProps = {
  waypoint: Waypoint;
  waypointPosition: number;
  removeWaypoint: RemoveWaypoint;
};

export const RouteElement = ({
  waypoint: w,
  waypointPosition: i,
  removeWaypoint,
}: RouteElementProps) => {
  const { attributes, listeners, setNodeRef, transform } =
    useSortable({ id: `${i}` });
  const style = { transform: CSS.Transform.toString(transform) };
  return (
    <RouteElementContainer style={style} ref={setNodeRef}>
      <span>
        {w.name}{" "}
        {i === 0 &&
          AerodromeWaypoint.isAerodromeWaypoint(w) &&
          `(T/O) - ${w.altitude} ft.`}
      </span>
      <span>
        <button onClick={() => removeWaypoint(i)}>❌</button>
        <button {...listeners} {...attributes}>
          ≡
        </button>
      </span>
    </RouteElementContainer>
  );
};

export const RouteElementContainer = styled.span`
  display: flex;
  justify-content: space-between;
`;
