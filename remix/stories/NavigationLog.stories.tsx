import type { ComponentMeta } from '@storybook/react';
import styled from 'styled-components';
import { AiracData } from 'ts-aerodata-france';
import currentCycle from 'ts-aerodata-france/build/jsonData/2022-10-06.json';
import { AiracDataProvider } from '~/fb/components/AiracDataContext';
import { FixtureFocusProvider } from '~/fb/components/Map/FixtureFocusContext';
import { NavigationLog } from '~/fb/components/Map/NavigationLog';
import { RouteProvider } from '~/fb/components/RouteContext';
import { WeatherProvider } from '~/fb/components/WeatherContext';
import '../app/styles/global.css';
import { importRoute } from './importRoute';
import routeJSON from './route.json';

export default {
    title: 'Example/NavigationLog',
    component: NavigationLog,
    argTypes: {},
    decorators: [
        (Story) => (
            <Container>
                <RouteProvider>
                    <AiracDataProvider>
                        <WeatherProvider>
                            <FixtureFocusProvider>
                                <Story />
                            </FixtureFocusProvider>
                        </WeatherProvider>
                    </AiracDataProvider>
                </RouteProvider>
            </Container>
        ),
    ],
} as ComponentMeta<typeof NavigationLog>;

//@ts-ignore
export const WithRoute = (args, { loaded: { airacData } }) => {
    return (
        <A4Container>
            <NavigationLog route={importRoute(airacData, routeJSON)} paperVersion />
        </A4Container>
    );
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

const A4Container = styled.div`
    width: 210mm;
    height: 297mm;
    padding: 2mm;
    background-color: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
`;
