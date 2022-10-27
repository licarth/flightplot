import type { ActionFunction } from 'remix';
import { destroyUserSession } from '~/utils/session.server';

export const loader: ActionFunction = async ({ request }) => {
    return destroyUserSession(request);
};
