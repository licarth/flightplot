import dotenv from 'dotenv';
import type { App, AppOptions } from 'firebase-admin/app';
import { cert, initializeApp as firebaseInit } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import { getAuth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config();

let initializationOptions: AppOptions = {
    databaseURL: 'https://flightplot-web-default-rtdb.europe-west1.firebasedatabase.app',
};
let firestore: Firestore;
let app: App;
let auth: Auth;

export function initializeApp({
    appName,
    serviceAccount,
    useEmulators,
}: Partial<{
    appName: string;
    serviceAccount: string;
    useEmulators?: boolean;
}> = {}) {
    if ((useEmulators || process.env.PUBLIC_USE_EMULATORS === 'true') && !serviceAccount) {
        console.log('🔸 Using Emulators in the Jobs');
        process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080';
        initializationOptions = {
            ...initializationOptions,
            projectId: 'flightplot-web',
        };
    } else {
        delete process.env['FIRESTORE_EMULATOR_HOST'];
        initializationOptions = {
            ...initializationOptions,
            credential: cert(
                JSON.parse(serviceAccount || process.env.FIREBASE_SERVICE_ACCOUNT_KEY || ''),
            ),
        };
    }
    app = firebaseInit(initializationOptions, appName || randomString());

    firestore = getFirestore(app);
    firestore.settings({
        ignoreUndefinedProperties: true,
    });

    auth = getAuth(app);
    return { app, firestore, auth: auth };
}

const randomString = () => {
    return Math.random().toString(36).substring(7);
};

export { auth };
