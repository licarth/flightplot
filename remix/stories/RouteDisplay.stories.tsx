import type { ComponentMeta, ComponentStory } from '@storybook/react';
import 'antd/dist/antd.css';
import { AiracData } from 'ts-aerodata-france';
import { RouteDisplay } from '~/fb/components/Map/LeftMenu';
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
import { useRoute } from '~/fb/components/useRoute';
import { UserRoutesProvider } from '~/fb/components/UserRoutesContext';
import routeJSON from './route.json';

const email = 'user@domain.com';
const password = 'notasecret';

signInWithEmailAndPassword(auth, email, password).then((user) => user);

export default {
    title: 'Example/RouteDisplay',
    component: RouteDisplay,
    argTypes: {},
} as ComponentMeta<typeof RouteDisplay>;

const airacData = AiracData.loadCycle();
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args

const SetRoute = () => {
    const { setRoute } = useRoute();

    useEffect(() => {
        setRoute(
            pipe(
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
        );
    }, []);
    return null;
};

const Template: ComponentStory<typeof RouteDisplay> = (args) => {
    return (
        <FirebaseAuthProvider>
            <UserRoutesProvider>
                <RouteProvider>
                    <SetRoute />
                    <RouteDisplay {...args} />;
                </RouteProvider>
            </UserRoutesProvider>
        </FirebaseAuthProvider>
    );
};

export const Default = Template.bind({});
