import { useState } from 'react';
import styled from 'styled-components';
import { MyRoutes, PrintOptions, RouteWaypoints } from '~/fb/components/Menus';
import { useRoute } from '../useRoute';
import { H2 } from './H2';

const ContainerDiv = styled.div`
    display: none;
    width: 400px;
    height: 100%;
    flex-direction: column;
    justify-content: space-between;

    @media (min-width: 1024px) {
        & {
            display: flex;
        }
    }
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
    const [routesCollapsed, setRoutesCollapsed] = useState(false);
    const [waypointsCollapsed, setWaypointsCollapsed] = useState(false);
    const { route } = useRoute();

    return (
        <LeftColumn>
            <H2 marginTop={5} onClick={() => setRoutesCollapsed((v) => !v)}>
                MES NAVIGATIONS
            </H2>
            <MyRoutes collapsed={routesCollapsed} />
            {route && (
                <>
                    <H2 marginTop={5} onClick={() => setWaypointsCollapsed((v) => !v)}>
                        POINTS TOURNANTS
                    </H2>
                    <RouteWaypoints collapsed={waypointsCollapsed} />
                </>
            )}
            <H2 marginTop={5}>IMPRIMER</H2>
            <PrintOptions />
        </LeftColumn>
    );
};

const LeftColumn = styled.div`
    display: flex;
    flex-direction: column;
    margin: 10px;
    border: 1px black;
    height: 100%;
`;

export const NavigationsList = styled.div`
    display: flex;
    flex-direction: column;
`;

export const NewNavButton = styled.button`
    margin-bottom: 10px;
    text-align: center;
    height: 30px;
`;
