import type { ComponentMeta } from '@storybook/react';

import { AiracData } from 'ts-aerodata-france';
import { RouteDisplay } from '~/fb/components/Map/RouteDisplay';
import { FirebaseAuthProvider } from '~/fb/firebase/auth/FirebaseAuthContext';
import '../app/styles/global.css';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { Route } from '~/domain';
import { RouteProvider } from '~/fb/components/RouteContext';
import { auth } from '~/fb/firebaseConfig';

import { foldW } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { draw } from 'io-ts/lib/Decoder';
import { useEffect } from 'react';
import styled from 'styled-components';
import currentCycle from 'ts-aerodata-france/build/jsonData/2023-03-23.json';
import { UserRoutesProvider } from '~/fb/components/UserRoutesContext';
import { useRoute } from '~/fb/components/useRoute';
import { useUserRoutes } from '~/fb/components/useUserRoutes';
import routeJSON from './route.json';

const email = 'user@domain.com';
const password = 'notasecret';

signInWithEmailAndPassword(auth, email, password).then((user) => user);

export default {
    title: 'Example/RouteDisplay',
    component: RouteDisplay,
    argTypes: {},
} as ComponentMeta<typeof RouteDisplay>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args

const SetRoute = ({ airacData }: { airacData: AiracData }) => {
    const { setRoute } = useRoute();
    const { saveRoute } = useUserRoutes();
    const route = pipe(
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
    );

    useEffect(() => {
        setRoute(route);
    }, []);
    useEffect(() => {
        saveRoute(route);
    }, []);
    return null;
};

//@ts-ignore
export const Default = (args, { loaded: { airacData } }) => {
    return (
        <FirebaseAuthProvider>
            <UserRoutesProvider>
                <RouteProvider>
                    <SetRoute airacData={airacData} />
                    <Container>
                        <RouteDisplay {...args} />
                    </Container>
                </RouteProvider>
            </UserRoutesProvider>
        </FirebaseAuthProvider>
    );
};

Default.loaders = [
    async () => ({
        airacData: await AiracData.loadCycle(currentCycle),
    }),
];

const Container = styled.div`
    max-width: 400px;
`;
