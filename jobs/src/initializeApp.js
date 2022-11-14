import { cert, initializeApp as firebaseInit } from "firebase-admin/app";

let initializationOptions = {};

initializationOptions = {
  ...initializationOptions,
  credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "")),
};

export const initializaApp = () => firebaseInit(initializationOptions);
