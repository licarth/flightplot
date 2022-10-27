import { useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from 'remix';
import { redirect } from 'remix';
import styled from 'styled-components';
import { requireUserId } from '~/utils/session.server';

export default () => {
    const { memoizee } = useLoaderData();

    return (
        <AppContainer id="app">
            <h1>This is an admin page</h1>
            <h2>Memoizee statistics</h2>
            <LogOutput>{memoizee.logStats}</LogOutput>
        </AppContainer>
    );
};
const AppContainer = styled.div`
    height: 100%;
`;

export const loader: LoaderFunction = async ({ request }) => {
    const user = await requireUserId(request);
    if (user && user.email === 'thomascarli@gmail.com') {
        return computeAdminStats();
    } else {
        return redirect('/');
    }
};

const computeAdminStats = () => {
    const memProfile = require('memoizee/profile');
    const logStats = memProfile.log();
    return {
        memoizee: {
            logStats,
        },
    };
};

const LogOutput = styled.pre`
    white-space: pre-wrap;
`;
