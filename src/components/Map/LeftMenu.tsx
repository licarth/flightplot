import _ from "lodash";
import { useState } from "react";
import styled from "styled-components";
import { AiracData } from "ts-aerodata-france";
import { AerodromeWaypoint, AerodromeWaypointType, Route } from "../../domain";
import { useFirebaseAuth } from "../../firebase/auth/FirebaseAuthContext";
import { useRoute } from "../useRoute";
import { useUserRoutes } from "../useUserRoutes";
import { RouteWaypoints } from "./RouteWaypoints";

const ContainerDiv = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const LeftMenu = ({ airacData }: { airacData: AiracData }) => {
  return (
    <ContainerDiv>
      <RouteDisplay airacData={airacData} />
      {/* @ts-ignore */}
    </ContainerDiv>
  );
};

const RouteDisplay = ({ airacData }: { airacData: AiracData }) => {
  return (
    <RouteContainer>
      <MyRoutes airacData={airacData} />
      <H2>POINTS TOURNANTS</H2>
      <RouteWaypoints />
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
  background: #002e94;
  color: white;
`;

const Tips = () => (
  <TipsContainer>
    <H2>TIPS</H2>
    <ul>
      <li>Faites un click droit sur un waypoint pour éditer son nom</li>
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

const MyRoutes = ({ airacData }: { airacData: AiracData }) => {
  const { user } = useFirebaseAuth();
  const { routes } = useUserRoutes();

  if (!user) {
    return <></>;
  } else {
    return (
      <>
        {" "}
        <H2>MES NAVIGATIONS</H2>
        {_.map(routes, (route, key) => (
          <RouteLine
            key={`routeline-${key}`}
            route={route}
            routeName={route.title}
            airacData={airacData}
          />
        ))}
      </>
    );
  }
};

const RouteLine = ({
  route,
  routeName,
  airacData,
}: {
  route: Route;
  routeName: string | null;
  airacData: AiracData;
}) => {
  const { route: currentlyEditedRoute, switchRoute } = useRoute();
  const { setRouteTitle } = useUserRoutes();
  const [editingTitle, setEditingTitle] = useState(false);
  const isCurrentRoute =
    currentlyEditedRoute.id.toString() === route.id.toString();
  return (
    <RouteLineDiv
      isCurrentRoute={isCurrentRoute}
      onClick={() => switchRoute(route.id)}
    >
      {editingTitle ? (
        <StyledNameInput
          id={`input-route-title-name-${route.id}`}
          defaultValue={route.title || ""}
          size={1}
          step={500}
          onBlur={(e) => {
            setRouteTitle({ routeId: route.id, title: e.currentTarget.value });
            setEditingTitle(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setEditingTitle(false);
            } else if (e.key === "Enter") {
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
        <TitleContainer onClick={() => setEditingTitle(true)}>
          {routeName || "<no title>"}
        </TitleContainer>
      )}
      {route.waypoints
        .filter(AerodromeWaypoint.isAerodromeWaypoint)
        .filter(
          ({ waypointType }) => waypointType === AerodromeWaypointType.RUNWAY,
        )
        .map(({ name }) => name)
        .join(" => ")}
    </RouteLineDiv>
  );
};

const StyledNameInput = styled.input`
  width: 100px;
`;

const RouteLineDiv = styled.div<{ isCurrentRoute: boolean }>`
  :hover {
    background: #002f9478;
    color: white;
    cursor: pointer;
  }
  ${({ isCurrentRoute }) =>
    isCurrentRoute ? "background: #002e94; color: white;" : ""}
`;

const TitleContainer = styled.div`
  display: inline-block;
  width: 100px;

  min-height: 1em;
  font-weight: bold;
  border-bottom: 1px solid #000;
  text-decoration: none;
`;
