import { createCookieSessionStorage } from '@remix-run/node';
import { json } from '@remix-run/server-runtime';
import { auth } from './firebaseConfig.server';

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error('SESSION_SECRET must be set');
}

const DAY = 60 * 60 * 24 * 1000; // 1 day in ms
const expiresIn = 5 * DAY; // 5 days

let { getSession, commitSession, destroySession } = createCookieSessionStorage({
    cookie: {
        name: '__session',
        secure: true,
        secrets: [sessionSecret],
        sameSite: 'lax', // to help with CSRF
        path: '/',
        maxAge: expiresIn,
        httpOnly: true,
    },
});

export { getSession, commitSession };

export async function destroyUserSession(request: Request) {
    const session = await getSession(request.headers.get('Cookie'));
    return json(
        {},
        {
            headers: {
                'Set-Cookie': await destroySession(session),
            },
        },
    );
}

export async function requireUserId(request: Request) {
    const session = await getUserSession(request);
    const sessionCookie = session.get('session_cookie') as string;
    try {
        return auth.verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
            return decodedClaims;
        });
    } catch (e) {
        console.error(`Cannot verify session cookie ${sessionCookie}`, e);
        return null;
    }
}

export const getUserSession = (request: Request) => {
    return getSession(request.headers.get('Cookie'));
};
