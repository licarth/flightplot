import { User } from "@firebase/auth";
import { NmScale } from "@marfle/react-leaflet-nmscale";
import { LatLngTuple } from "leaflet";
import { useRef } from "react";
import { MapContainer } from "react-leaflet";
import styled from "styled-components";
import { AiracData } from "ts-aerodata-france";
import { DisplayedLayers } from "../../App";
import { toLeafletLatLng } from "../../domain";
import { useFirebaseAuth } from "../../firebase/auth/FirebaseAuthContext";
import Modal from "../../Modal";
import { OaciLayer, OpenStreetMapLayer } from "../layer";
import { useRoute } from "../useRoute";
import { VerticalProfileChart } from "../VerticalProfileChart";
import { Aerodromes } from "./Aerodromes";
import { Airspaces } from "./Airspaces";
import { DangerZones } from "./DangerZones";
import { FlightPlanningLayer } from "./FlightPlanningLayer";
import { LeftMenu } from "./LeftMenu";
import { VfrPoints } from "./VfrPoints";

const defaultLatLng: LatLngTuple = [43.5, 3.95];
const zoom: number = 11;

type LeafletMapProps = {
  displayedLayers: DisplayedLayers;
  airacData: AiracData;
};

export const LeafletMap = ({ displayedLayers, airacData }: LeafletMapProps) => {
  const { route, addAerodromeWaypoint, addLatLngWaypoint } = useRoute();
  const { user, signIn, signOut } = useFirebaseAuth();
  const params =
    route.waypoints.length > 1 && route.leafletBoundingBox
      ? { bounds: route.leafletBoundingBox }
      : { center: defaultLatLng, zoom };

  const vpModal = useRef(null);

  return (
    <>
      <BackgroundContainer onContextMenu={(e) => e.preventDefault()}>
        <TopBar>
          <AppLogo>
            <LogoLeft>FLIGHT</LogoLeft>
            <LogoRight>PLOT</LogoRight>
          </AppLogo>
          <RightButtons>
            {!user && <LoginButton onClick={signIn}>Login</LoginButton>}
            {user && (
              <>
                <UserBadge user={user} />
                <LoginButton onClick={signOut}>Logout</LoginButton>
              </>
            )}
          </RightButtons>
        </TopBar>
        <AppBody>
          <LeftMenu airacData={airacData} />
          <RightSide>
            <MapContainer id="mapId" {...params}>
              <Layers displayedLayers={displayedLayers} />
              <FlightPlanningLayer />
              <Airspaces airacData={airacData} />
              <DangerZones airacData={airacData} />
              <Aerodromes
                airacData={airacData}
                onClick={(aerodrome) => addAerodromeWaypoint({ aerodrome })}
              />
              <VfrPoints
                airacData={airacData}
                onClick={({ latLng, name }) =>
                  addLatLngWaypoint({ latLng: toLeafletLatLng(latLng), name })
                }
              />
              <NmScale />
            </MapContainer>
            {/* @ts-ignore */}
            <VerticalProfileDiv onClick={() => vpModal.current?.open()}>
              <VerticalProfileChart airacData={airacData} />
            </VerticalProfileDiv>
            <Modal fade={false} defaultOpened={false} ref={vpModal}>
              <VerticalProfileModalDiv>
                <VerticalProfileChart airacData={airacData} />
              </VerticalProfileModalDiv>
            </Modal>
          </RightSide>
        </AppBody>
      </BackgroundContainer>
    </>
  );
};

const UserBadge = ({ user }: { user: User }) => (
  <UserBadgeContainer>
    {user.isAnonymous ? "Anonymous User" : user.displayName}
  </UserBadgeContainer>
);

const RightSide = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
`;

const Layers = ({ displayedLayers }: { displayedLayers: DisplayedLayers }) => {
  return (
    <>
      {displayedLayers.open_street_map && <OpenStreetMapLayer />}
      {displayedLayers.icao && <OaciLayer />}
    </>
  );
};

const BackgroundContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const VerticalProfileDiv = styled.div`
  height: 300px;
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

const TopBar = styled.div`
  display: flex;
  height: 50px;
  justify-content: space-between;
`;

const RightButtons = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const AppBody = styled.div`
  display: flex;
  flex: auto;
  height: 100%;
`;

const AppLogo = styled.div`
  height: 100%;
  width: 100px;
  display: flex;
  width: 400px;
  text-align: center;
  justify-content: center;
  align-content: center;
  vertical-align: middle;
  flex-direction: row;
  font-family: "Russo One", sans-serif;
  font-size: 2em;
  margin-top: 10px;
`;

const LogoText = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
`;

const LogoLeft = styled(LogoText)`
  border: solid #002e94;
  border-width: 5px;
  color: #002e94;
`;
const LogoRight = styled(LogoText)`
  color: white;
  background: #002e94;
`;

const RightBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100%;
  font-family: "Russo One", sans-serif;
  padding-left: 10px;
  padding-right: 10px;
`;

const UserBadgeContainer = styled(RightBox)``;

const LoginButton = styled(RightBox)`
  cursor: pointer;

  :hover {
    background: #002e94;
    color: white;
  }
`;
