import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import _ from "lodash";
import { useState } from "react";
import styled from "styled-components";
import {
  AerodromeWaypoint,
  AerodromeWaypointType,
  Route,
  Waypoint,
} from "../../domain";
import {
  RemoveWaypoint,
  ReplaceWaypoint,
  SetWaypointAltitude,
  useRoute,
} from "../useRoute";

type RouteElementProps = {
  waypoint: Waypoint;
  waypointPosition: number;
  removeWaypoint: RemoveWaypoint;
  routeContextWithRoute: ReturnType<typeof useRoute> & { route: Route };
};

export const RouteElement = ({
  waypoint: w,
  waypointPosition: i,
  removeWaypoint,
  routeContextWithRoute,
}: RouteElementProps) => {
  const {
    route,
    setWaypointAltitude,
    setAerodromeWaypointType,
    replaceWaypoint,
  } = routeContextWithRoute;
  const [editingAltitude, setEditingAltitude] = useState<boolean>(false);
  const [editingName, setEditingName] = useState<boolean>(false);
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: `${i}`,
  });
  const style = { transform: CSS.Transform.toString(transform) };
  return (
    <RouteElementContainer key={`${w.id}`} style={style} ref={setNodeRef}>
      <span>
        <NameDisplay
          editingName={editingName}
          setEditingName={(b) => setEditingName(b)}
          i={i}
          route={route}
          replaceWaypoint={_.debounce(replaceWaypoint, 300)}
          w={w}
        />
        <AltitudeDisplay
          editingAltitude={editingAltitude}
          i={i}
          route={route}
          setEditingAltitude={(b) => setEditingAltitude(b)}
          setWaypointAltitude={_.debounce(setWaypointAltitude, 300)}
          w={w}
        />
        {" ft."}
      </span>
      <span>
        {AerodromeWaypoint.isAerodromeWaypoint(w) && (
          <StyledSelect
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
            <option value="touch_go">land</option>
            <option value="overfly">fly</option>
          </StyledSelect>
        )}
        <DeleteDiv onClick={() => removeWaypoint(i)}>❌</DeleteDiv>
        <HandleDiv {...listeners} {...attributes}>
          ≡
        </HandleDiv>
      </span>
    </RouteElementContainer>
  );
};

export const RouteElementContainer = styled.span`
  display: flex;
  justify-content: space-between;
`;

const NameContainer = styled.div`
  display: inline-block;
  width: 100px;

  min-height: 1em;
`;

const NoNameReplacement = styled(NameContainer)`
  color: grey;
`;

// const EmptyNameContainer = styled(NameContainer)`
/* content="hello"
  
  :hover {
    background-color: "#363636";
  }
`; */

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

const HandleDiv = styled.div`
  display: inline-block;
  padding-left: 10px;
  cursor: pointer;
`;

const DeleteDiv = styled.button`
  background: none;
  border: none;
  display: inline-block;
  padding-left: 10px;
  cursor: pointer;
`;

const StyledSelect = styled.select``;

const StyledNameInput = styled.input`
  width: 100px;
`;
const StyledAltitudeInput = styled.input`
  width: 70px;
`;

const NameDisplay = ({
  route,
  editingName,
  setEditingName,
  replaceWaypoint,
  w,
  i,
}: {
  route: Route;
  editingName: boolean;
  setEditingName: (b: boolean) => void;
  replaceWaypoint: ReplaceWaypoint;
  w: Waypoint;
  i: number;
}) => {
  if (editingName) {
    return (
      <StyledNameInput
        id={`input-waypoint-name-${w.id}`}
        defaultValue={w.name || ""}
        size={1}
        step={500}
        onBlur={() => setEditingName(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setEditingName(false);
          } else if (e.key === "Enter") {
            setEditingName(false);
          }
        }}
        autoFocus
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          replaceWaypoint({
            waypointPosition: i,
            newWaypoint: w.clone({ name: e.currentTarget.value }),
          })
        }
      />
    );
  } else
    return w.name ? (
      <NameContainer onClick={() => setEditingName(true)}>
        {w.name}
      </NameContainer>
    ) : (
      <NoNameReplacement onClick={() => setEditingName(true)}>
        {"<sans nom>"}
      </NoNameReplacement>
    );
};

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
      <StyledAltitudeInput
        id={`input-waypoint-altitude-${w.id}`}
        defaultValue={route.inferredAltitudes[i]}
        size={1}
        type="number"
        step={500}
        onBlur={() => setEditingAltitude(false)}
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
