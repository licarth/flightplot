import type { ActionFunction } from '@remix-run/server-runtime';
import { json } from '@remix-run/server-runtime';
import '~/utils/firebaseConfig.server';
import { auth } from '~/utils/firebaseConfig.server';
import { commitSession, getSession } from '~/utils/session.server';

export const action: ActionFunction = async ({ request }) => {
    if (request.method === 'POST') {
        const payload = await request.json();
        const { idToken } = payload;
        const session = await getSession();
        session.set('idToken', idToken);
        const { email } = await auth.verifyIdToken(idToken);
        const sessionCookie = await auth.createSessionCookie(idToken, {
            expiresIn: 60 * 60 * 24 * 5,
        });

        session.set('session_cookie', sessionCookie);
        session.set('email', email);

        console.log('session_email', session.get('email'));

        return json(
            { idToken },
            {
                headers: {
                    'Set-Cookie': await commitSession(session),
                },
            },
        );
    }
    return json({ message: 'Method not allowed' }, 405);
};
