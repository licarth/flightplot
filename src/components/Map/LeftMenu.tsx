import _ from "lodash";
import { useRef, useState } from "react";
import styled from "styled-components";
import { AerodromeWaypoint, AerodromeWaypointType, Route } from "../../domain";
import { useFirebaseAuth } from "../../firebase/auth/FirebaseAuthContext";
import Modal from "../../Modal";
import { useRoute } from "../useRoute";
import { useUserRoutes } from "../useUserRoutes";
import { RouteWaypoints } from "./RouteWaypoints";

const ContainerDiv = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const LeftMenu = () => {
  return (
    <ContainerDiv>
      <RouteDisplay />
      {/* @ts-ignore */}
    </ContainerDiv>
  );
};

const RouteDisplay = () => {
  return (
    <RouteContainer>
      <MyRoutes />
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

const MyRoutes = () => {
  const { user } = useFirebaseAuth();
  const { routes, saveRoute } = useUserRoutes();

  if (!user) {
    return <></>;
  } else {
    return (
      <NavigationsList>
        {" "}
        <H2>MES NAVIGATIONS</H2>
        <NewNavButton
          onClick={() => {
            saveRoute(Route.empty());
          }}
        >
          ➕ Nouvelle navigation
        </NewNavButton>
        {_.map(_.sortBy(routes, "title"), (route, key) => (
          <RouteLine
            key={`routeline-${key}`}
            route={route}
            routeName={route.title}
          />
        ))}
      </NavigationsList>
    );
  }
};

const NavigationsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const NewNavButton = styled.button`
  margin-bottom: 10px;
  text-align: center;
  height: 30px;
`;

const RouteLine = ({
  route,
  routeName,
}: {
  route: Route;
  routeName: string | null;
}) => {
  const { route: currentlyEditedRoute, switchRoute, setRoute } = useRoute();
  const { deleteRoute } = useUserRoutes();
  const { setRouteTitle } = useUserRoutes();
  const [editingTitle, setEditingTitle] = useState(false);
  const isCurrentRoute =
    currentlyEditedRoute.id.toString() === route.id.toString();
  const deleteConfirmModal = useRef(null);

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
      {/* <DeleteDiv onClick={() => deleteRoute(route.id)}>❌</DeleteDiv> */}
      <Modal fade={false} defaultOpened={false} ref={deleteConfirmModal}>
        <ConfirmDeleteRouteDiv>
          Êtes-vous sûr(e) de vouloir supprimer cette navigation ?<br />
          <ConfirmDeleteRouteButton
            onClick={() => {
              //@ts-ignore
              deleteConfirmModal.current?.close();
              if (`${currentlyEditedRoute.id}` === `${route.id}`) {
                setRoute(Route.empty());
              }
              deleteRoute(route.id);
            }}
          >
            ❌ Confirmer la suppression de la route
          </ConfirmDeleteRouteButton>
        </ConfirmDeleteRouteDiv>
      </Modal>
      {/* @ts-ignore */}
      <DeleteDiv onClick={() => deleteConfirmModal.current?.open()}>
      🗑️
      </DeleteDiv>
    </RouteLineDiv>
  );
};

const ConfirmDeleteRouteDiv = styled.div`
  display: flex;
  height: 80px;
  justify-content: space-between;
  flex-direction: column;
`;

const ConfirmDeleteRouteButton = styled.button`
  height: 30px;
`;

const DeleteDiv = styled.button`
  background: none;
  border: none;
  display: inline-block;
  padding-left: 10px;
  cursor: pointer;
`;

const StyledNameInput = styled.input`
  width: 100px;
`;

const RouteLineDiv = styled.div<{ isCurrentRoute: boolean }>`
  :hover {
    background: #f597006d;
    color: white;
    cursor: pointer;
  }
  ${({ isCurrentRoute }) =>
    isCurrentRoute ? "background: #f59700; color: white;" : ""}
`;

const TitleContainer = styled.div`
  display: inline-block;
  width: 100px;

  min-height: 1em;
  font-weight: bold;
  border-bottom: 1px solid #000;
  text-decoration: none;
`;
