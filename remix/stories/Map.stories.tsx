import type { ComponentMeta } from '@storybook/react';
import { useEffect } from 'react';
import styled from 'styled-components';
import { AiracData } from 'ts-aerodata-france';
import currentCycle from 'ts-aerodata-france/build/jsonData/2023-03-23.json';
import type { Route } from '~/domain';
import { AiracDataProvider } from '~/fb/components/AiracDataContext';
import { FixtureFocusProvider } from '~/fb/components/Map/FixtureFocusContext';
import { LeafletMapContainer } from '~/fb/components/Map/LeafletMapContainer.client';
import { MainMapProvider, useMainMap } from '~/fb/components/Map/MainMapContext';
import { RouteProvider } from '~/fb/components/RouteContext';
import { useRoute } from '~/fb/components/useRoute';
import { FirebaseAuthProvider } from '~/fb/firebase/auth/FirebaseAuthContext';
import '../app/styles/global.css';
import { importRoute } from './importRoute';
import routeJSON from './route1.json';

const RouteInit = ({ route }: { route: Route }) => {
    const { setRoute } = useRoute();
    useEffect(() => {
        route && setRoute(route);
    }, []);
    return <></>;
};

export default {
    title: 'Example/Map',
    component: LeafletMapContainer,
    argTypes: {},
    decorators: [
        (Story) => (
            <Container>
                <MainMapProvider>
                    <FirebaseAuthProvider>
                        <RouteProvider>
                            <AiracDataProvider>
                                <FixtureFocusProvider>
                                    <Story />
                                </FixtureFocusProvider>
                            </AiracDataProvider>
                        </RouteProvider>
                    </FirebaseAuthProvider>
                </MainMapProvider>
            </Container>
        ),
    ],
} as ComponentMeta<typeof LeafletMapContainer>;

//@ts-ignore
export const Default = (args) => {
    return <LeafletMapContainer {...args} />;
};

//@ts-ignore
export const WithRoute = (args, { loaded: { airacData } }) => {
    const { map } = useMainMap();
    useEffect(() => {
        map?.setView([43.6, 4.1], 10, { animate: false });
    }, [map]);
    return (
        <>
            <RouteInit route={importRoute(airacData, routeJSON)} />
            <LeafletMapContainer />
        </>
    );
};

//@ts-ignore
export const Montpellier = (args) => {
    return <LeafletMapContainer {...args} />;
};

WithRoute.loaders = [
    async () => ({
        airacData: await AiracData.loadCycle(currentCycle),
    }),
];

const Container = styled.div`
    height: 100%;
    display: flex;
`;
