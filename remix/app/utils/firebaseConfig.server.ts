import { initializeApp } from 'firebase-admin/app';

// app/firebase.server.ts

import type { App, AppOptions } from 'firebase-admin/app';
import { cert, getApp, getApps } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import { getAuth } from 'firebase-admin/auth';
import { environmentVariable } from '~/fb/environmentVariable';

let app: App;
let auth: Auth;
let initializationOptions: AppOptions = {};
if (getApps().length === 0) {
    if (environmentVariable('PUBLIC_USE_EMULATORS') === 'true') {
        console.log('🔸 Using Emulators in the Backend');
        process.env['FIREBASE_AUTH_EMULATOR_HOST'] = 'localhost:8082';
        initializationOptions = {
            ...initializationOptions,
            projectId: 'flightplot-web',
        };
    } else {
        const serviceAccount = environmentVariable('FIREBASE_SERVICE_ACCOUNT_KEY');
        if (!serviceAccount) {
            throw new Error(
                'FIREBASE_SERVICE_ACCOUNT_KEY must be set if PUBLIC_USE_EMULATORS is not set to true',
            );
        }
        initializationOptions = {
            ...initializationOptions,
            credential: cert(JSON.parse(serviceAccount)),
        };
    }
    app = initializeApp(initializationOptions);
} else {
    app = getApp();
}
auth = getAuth(app);

export { auth };
