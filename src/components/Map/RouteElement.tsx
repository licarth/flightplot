import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styled from "styled-components";
import { AerodromeWaypoint, Waypoint } from "../../domain";
import { RemoveWaypoint } from "../useRoute";

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
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: `${i}`,
  });
  const style = { transform: CSS.Transform.toString(transform) };
  return (
    <RouteElementContainer key={`${w.id}`} style={style} ref={setNodeRef}>
      <NameContainer>{w.name} </NameContainer>
      <span>
        <input
          value={w.altitude}
          size={1}
          disabled={i === 0 && AerodromeWaypoint.isAerodromeWaypoint(w)}
        />
        ft.
      </span>
      <span>
        {AerodromeWaypoint.isAerodromeWaypoint(w) && (
          <select
            name={`select-waypoint-type-${w.id}`}
            id={`select-waypoint-type-${w.id}`}
            defaultValue={"overfly"}
          >
            <option value="touch_go">touch'n'go</option>
            <option value="overfly">overfly</option>
          </select>
        )}
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

const NameContainer = styled.div`
  width: 50px;
  text-overflow: ellipsis;
`;
