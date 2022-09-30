import { UserOutlined } from '@ant-design/icons';
import { type User } from '@firebase/auth';
import { Avatar, Dropdown, Menu } from 'antd';
import { useRef } from 'react';
import styled from 'styled-components';
import { useFirebaseAuth } from '~/fb/firebase/auth/FirebaseAuthContext';
import { Login } from '~/fb/Login';
import Modal, { type ModalHandle } from '~/fb/Modal';
import { useRoute } from '../useRoute';

export const TopBar = () => {
    const { user, googleSignIn, anonymousSignIn, signOut } = useFirebaseAuth();
    const loginModal = useRef<ModalHandle>(null);
    return (
        <TopBarContainer>
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
                        <UserBadge user={user} signOut={signOut} />
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
        </TopBarContainer>
    );
};

const TopBarContainer = styled.div`
    display: flex;
    height: 50px;
    justify-content: space-between;
`;

const RightButtons = styled.div`
    display: flex;
    justify-content: flex-end;
`;
const AppLogo = styled.div`
    height: 30px;
    display: flex;
    width: 400px;
    text-align: center;
    justify-content: center;
    align-content: center;
    vertical-align: middle;
    flex-direction: row;
    font-family: 'Russo One', sans-serif;
    margin-top: 10px;
`;

const UserBadge = ({ user, signOut }: { user: User; signOut: () => void }) => {
    const { setRoute } = useRoute();
    const menu = (
        <Menu
            items={[
                {
                    label: (
                        <span
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                setRoute(undefined);
                                signOut();
                            }}
                        >
                            Se déconnecter
                        </span>
                    ),
                    key: '0',
                },
            ]}
        />
    );
    return (
        <Dropdown overlay={menu} trigger={['click']}>
            <a onClick={(e) => e.preventDefault()}>
                <UserBadgeContainer>
                    <>
                        <img
                            src={user.photoURL || undefined}
                            alt=""
                            referrerPolicy="no-referrer"
                            style={{ display: 'none' }}
                        />
                        <Avatar src={user.photoURL} icon={<UserOutlined />} />
                        {user.isAnonymous ? 'Anonymous User' : user.displayName}
                    </>
                </UserBadgeContainer>
            </a>
        </Dropdown>
    );
};
const LogoText = styled.div`
    display: flex;
    align-items: center;
    padding: 10px;
    font-size: 1em;
`;

const RightBox = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 100%;
    font-family: 'Univers';
    padding-left: 10px;
    padding-right: 10px;
`;

const UserBadgeContainer = styled(RightBox)`
    display: flex;
    gap: 10px;
`;

const LogoLeft = styled(LogoText)`
    border: solid #002e94;
    border-width: 5px;
    color: #002e94;
`;
const LogoRight = styled(LogoText)`
    border: solid #002e94;
    color: white;
    border-width: 5px;
    background: #002e94;
`;
const LoginButton = styled(RightBox)`
    cursor: pointer;

    :hover {
        background: #002e94;
        color: white;
    }
`;
