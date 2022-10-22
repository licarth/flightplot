import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { foldW } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { draw } from 'io-ts/lib/Decoder';
import { useEffect } from 'react';
import styled from 'styled-components';
import { AiracCycles, AiracData } from 'ts-aerodata-france';
import { Route } from '~/domain';
import { AiracDataProvider } from '~/fb/components/AiracDataContext';
import { FixtureFocusProvider } from '~/fb/components/Map/FixtureFocusContext';
import { LeafletMapContainer } from '~/fb/components/Map/LeafletMapContainer.client';
import { MainMapProvider } from '~/fb/components/Map/MainMapContext';
import { RouteProvider } from '~/fb/components/RouteContext';
import { useRoute } from '~/fb/components/useRoute';
import { FirebaseAuthProvider } from '~/fb/firebase/auth/FirebaseAuthContext';
import '../app/styles/global.css';
import routeJSON from './route1.json';

const airacData = AiracData.loadCycle(AiracCycles.SEP_08_2022);

const RouteInit = ({ route }: { route: Route }) => {
    const { setRoute } = useRoute();
    useEffect(() => {
        route && setRoute(route);
    }, []);
    return <></>;
};

const Map = ({ route }: { route: Route }) => {
    return (
        <Container>
            <MainMapProvider>
                <FirebaseAuthProvider>
                    <RouteProvider>
                        <AiracDataProvider>
                            <RouteInit route={route} />
                            <FixtureFocusProvider>
                                <LeafletMapContainer />
                            </FixtureFocusProvider>
                        </AiracDataProvider>
                    </RouteProvider>
                </FirebaseAuthProvider>
            </MainMapProvider>
        </Container>
    );
};

export default {
    title: 'Example/Map',
    component: Map,
    argTypes: {},
} as ComponentMeta<typeof Map>;

const Template: ComponentStory<typeof Map> = (args) => {
    return <Map {...args} />;
};

export const Default = Template.bind({});
export const WithRoute = Template.bind({});
export const Montpellier = Template.bind({});

WithRoute.args = {
    route: pipe(
        Route.codec(airacData).decode(routeJSON),
        foldW(
            (e) => {
                console.log(draw(e));
                return Route.empty();
            },
            (r) => {
                return r;
            },
        ),
    ),
};

const Container = styled.div`
    height: 100%;
    display: flex;
`;
