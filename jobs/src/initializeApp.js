import {
  cert,
  initializeApp as firebaseInit,
  getApps,
  getApp,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let initializationOptions = {};

export function initializeApp() {
  let app;
  if (getApps().length === 0) {
    if (process.env.PUBLIC_USE_EMULATORS === "true") {
      console.log("🔸 Using Emulators in the Jobs");
      process.env["FIRESTORE_EMULATOR_HOST"] = "localhost:8080";
      initializationOptions = {
        ...initializationOptions,
        projectId: "flightplot-web",
      };
    } else {
      initializationOptions = {
        ...initializationOptions,
        credential: cert(
          JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "")
        ),
      };
    }
    app = firebaseInit(initializationOptions);
  } else {
    app = getApp();
  }
  const firestore = getFirestore(app);
  return { app, firestore };
}
