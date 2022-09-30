import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectDatabaseEmulator, getDatabase } from 'firebase/database';
import { connectFirestoreEmulator, initializeFirestore } from 'firebase/firestore';
import { environmentVariable } from './environmentVariable';

const firebaseConfig = {
    apiKey: 'AIzaSyDZkE-GNWNimNRft6FDah1DGz0DmsRnqeg',
    authDomain: 'flightplot-web.firebaseapp.com',
    projectId: 'flightplot-web',
    storageBucket: 'flightplot-web.appspot.com',
    messagingSenderId: '216969148978',
    appId: '1:216969148978:web:d852ad70fe2f0e3048da2b',
    measurementId: 'G-B9VRCW8QML',
    databaseURL: 'https://flightplot-web-default-rtdb.europe-west1.firebasedatabase.app',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const db = getDatabase();
const firestoreDb = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
});
//@ts-ignore
const isStorybook = () => typeof window !== 'undefined' && window.IS_STORYBOOK;

if (environmentVariable('USE_EMULATORS') === 'true' || isStorybook()) {
    console.log('Using Emulators');
    connectDatabaseEmulator(db, 'localhost', 9000);
    connectFirestoreEmulator(firestoreDb, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:8082');
}

export { db, app, firestoreDb, auth };
