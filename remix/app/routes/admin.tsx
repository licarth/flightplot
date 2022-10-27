import type { LoaderFunction } from 'remix';
import { redirect } from 'remix';
import styled from 'styled-components';
import { requireUserId } from '~/utils/session.server';

export default () => (
    <AppContainer id="app">
        <h1>This is an admin page</h1>
    </AppContainer>
);
const AppContainer = styled.div`
    height: 100%;
`;

export const loader: LoaderFunction = async ({ request }) => {
    const user = await requireUserId(request);
    if (user && user.email === 'thomascarli@gmail.com') {
        return null;
    } else {
        return redirect('/');
    }
};
