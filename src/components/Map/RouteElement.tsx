import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import styled from "styled-components";
import {
  AerodromeWaypoint,
  AerodromeWaypointType,
  Route,
  Waypoint,
} from "../../domain";
import { RemoveWaypoint, SetWaypointAltitude, useRoute } from "../useRoute";

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
  const { route, setWaypointAltitude, setAerodromeWaypointType } = useRoute();
  const [editingAltitude, setEditingAltitude] = useState<boolean>(false);
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: `${i}`,
  });
  const style = { transform: CSS.Transform.toString(transform) };
  return (
    <RouteElementContainer key={`${w.id}`} style={style} ref={setNodeRef}>
      <span>
        <NameContainer>{w.name}</NameContainer>
        <AltitudeDisplay
          editingAltitude={editingAltitude}
          i={i}
          route={route}
          setEditingAltitude={(b) => setEditingAltitude(b)}
          setWaypointAltitude={setWaypointAltitude}
          w={w}
        />
        ft.
      </span>
      <span>
        {AerodromeWaypoint.isAerodromeWaypoint(w) && (
          <select
            name={`select-waypoint-type-${w.id}`}
            id={`select-waypoint-type-${w.id}`}
            defaultValue={
              w.waypointType === AerodromeWaypointType.OVERFLY
                ? "overfly"
                : "touch_go"
            }
            onChange={(e) =>
              setAerodromeWaypointType({
                waypointPosition: i,
                waypointType:
                  e.currentTarget.value === "overfly"
                    ? AerodromeWaypointType.OVERFLY
                    : AerodromeWaypointType.RUNWAY,
              })
            }
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
  width: 100px;
  display: inline-block;
  text-overflow: ellipsis;
`;

const CalculatedAltitude = styled.span`
  border-bottom: 1px dotted #000;
  text-decoration: none;
`;
const AltitudeConstraint = styled.span`
  font-weight: bold;
  border-bottom: 1px solid #000;
  text-decoration: none;
`;

const ImmutableAltitude = styled.span`
  font-weight: bold;
  color: #5c2500;
  text-decoration: none;
`;

const AltitudeDisplay = ({
  route,
  editingAltitude,
  setEditingAltitude,
  setWaypointAltitude,
  w,
  i,
}: {
  route: Route;
  editingAltitude: boolean;
  setEditingAltitude: (b: boolean) => void;
  setWaypointAltitude: SetWaypointAltitude;
  w: Waypoint;
  i: number;
}) => {
  if (editingAltitude) {
    return (
      <input
        id={`input-waypoint-type-${w.id}`}
        defaultValue={route.inferredAltitudes[i]}
        size={1}
        // type="number"
        step={500}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setEditingAltitude(false);
          } else if (e.key === "Enter") {
            setEditingAltitude(false);
          }
        }}
        autoFocus
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setWaypointAltitude({
            waypointPosition: i,
            altitude: e.currentTarget.value
              ? Number(e.currentTarget.value)
              : null,
          })
        }
      />
    );
  } else {
    if (
      AerodromeWaypoint.isAerodromeWaypoint(w) &&
      w.waypointType === AerodromeWaypointType.RUNWAY
    ) {
      return <ImmutableAltitude>{w.altitude}</ImmutableAltitude>;
    } else {
      if (([undefined, null] as any).includes(w.altitude)) {
        return (
          <CalculatedAltitude onClick={() => setEditingAltitude(true)}>
            {route.inferredAltitudes[i]}
          </CalculatedAltitude>
        );
      } else {
        return (
          <AltitudeConstraint onClick={() => setEditingAltitude(true)}>
            {w.altitude}
          </AltitudeConstraint>
        );
      }
    }
  }
};
