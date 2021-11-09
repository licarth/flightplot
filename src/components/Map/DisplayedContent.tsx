import { User } from "@firebase/auth";
import { useRef } from "react";
import styled from "styled-components";
import { DisplayedLayers } from "../../App";
import { useFirebaseAuth } from "../../firebase/auth/FirebaseAuthContext";
import { Login } from "../../Login";
import Modal from "../../Modal";
import { VerticalProfileChart } from "../VerticalProfileChart";
import { LeafletMapContainer } from "./LeafletMapContainer";
import { LeftMenu } from "./LeftMenu";

type LeafletMapProps = {
  displayedLayers: DisplayedLayers;
};

export type MapBounds = [number, number, number, number];

export const DisplayedContent = ({ displayedLayers }: LeafletMapProps) => {
  const { user, googleSignIn, signOut } = useFirebaseAuth();

  const vpModal = useRef(null);
  const loginModal = useRef(null);

  return (
    <>
      <BackgroundContainer onContextMenu={(e) => e.preventDefault()}>
        <TopBar>
          <AppLogo>
            <LogoLeft>FLIGHT</LogoLeft>
            <LogoRight>PLOT</LogoRight>
          </AppLogo>
          <RightButtons>
            {!user && (
              //@ts-ignore
              <LoginButton onClick={() => loginModal.current?.open()}>
                Login
              </LoginButton>
            )}
            {user && (
              <>
                <UserBadge user={user} />
                <LoginButton onClick={signOut}>Logout</LoginButton>
              </>
            )}
            {!user && (
              <Modal defaultOpened={false} fade={false} ref={loginModal}>
                <Login signInWithGoogle={googleSignIn} loading={false} />
              </Modal>
            )}
          </RightButtons>
        </TopBar>
        <AppBody>
          <LeftMenu />
          <RightSide>
            <LeafletMapContainer />
            {/* @ts-ignore */}
            <VerticalProfileDiv onClick={() => vpModal.current?.open()}>
              <VerticalProfileChart />
            </VerticalProfileDiv>
            <Modal fade={false} defaultOpened={false} ref={vpModal}>
              <VerticalProfileModalDiv>
                <VerticalProfileChart />
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
