import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
