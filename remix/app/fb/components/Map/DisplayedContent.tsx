import { type User } from '@firebase/auth';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { type DisplayedLayers } from '../../App';
import { useFirebaseAuth } from '../../firebase/auth/FirebaseAuthContext';
import { Login } from '../../Login';
import Modal, { type ModalHandle } from '../../Modal';
import { useRoute } from '../useRoute';
import { VerticalProfileChart } from '../VerticalProfileChart';
import { H2 } from './H2';
import { LeafletMapContainer } from './LeafletMapContainer.client';
import { LeftMenu } from './LeftMenu';
import { useMainMap } from './MainMapContext';

type LeafletMapProps = {
    displayedLayers: DisplayedLayers;
};

export type MapBounds = [number, number, number, number];

export const DisplayedContent = ({ displayedLayers }: LeafletMapProps) => {
    const { user, googleSignIn, anonymousSignIn, signOut } = useFirebaseAuth();

    const loginModal = useRef<ModalHandle>(null);
    const { setMap } = useMainMap();
    const { setRoute } = useRoute();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

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
                                Se connecter
                            </LoginButton>
                        )}
                        {user && (
                            <>
                                <UserBadge user={user} />
                                <LoginButton
                                    onClick={() => {
                                        setRoute(undefined);
                                        signOut();
                                    }}
                                >
                                    Déconnexion
                                </LoginButton>
                            </>
                        )}
                        {!user && (
                            <Modal defaultOpened={false} fade={false} ref={loginModal}>
                                <Login
                                    signInWithGoogle={googleSignIn}
                                    anonymousSignIn={anonymousSignIn}
                                    loading={false}
                                />
                            </Modal>
                        )}
                    </RightButtons>
                </TopBar>
                <AppBody>
                    <LeftMenu />
                    <RightSide>
                        {mounted ? <LeafletMapContainer setMap={setMap} /> : <></>}
                        {/* @ts-ignore */}
                        <VerticalProfile />
                    </RightSide>
                </AppBody>
            </BackgroundContainer>
        </>
    );
};

const VerticalProfile = () => {
    const vpModal = useRef<ModalHandle>(null);
    const [collapsed, setCollapsed] = useState(true);

    return (
        <>
            <H2 onClick={() => setCollapsed((v) => !v)}>PROFIL VERTICAL</H2>
            <VerticalProfileDiv onClick={() => vpModal.current?.open()} collapsed={collapsed}>
                <VerticalProfileChart />
            </VerticalProfileDiv>
            <Modal fade={false} defaultOpened={false} ref={vpModal}>
                <VerticalProfileModalDiv>
                    <VerticalProfileChart />
                </VerticalProfileModalDiv>
            </Modal>
        </>
    );
};

const UserBadge = ({ user }: { user: User }) => (
    <UserBadgeContainer>
        {user.isAnonymous ? 'Anonymous User' : user.displayName}
    </UserBadgeContainer>
);

const RightSide = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1 0 auto;
    justify-content: flex-end;
`;

const BackgroundContainer = styled.div`
    display: flex;
    flex-grow: 1 0 auto;
    flex-direction: column;
    height: 100%;
`;

const VerticalProfileDiv = styled.div<{ collapsed?: boolean }>`
    height: ${({ collapsed }) => (collapsed ? '0px' : '300px')};
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
    font-family: 'Russo One', sans-serif;
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
    font-family: 'Russo One', sans-serif;
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
