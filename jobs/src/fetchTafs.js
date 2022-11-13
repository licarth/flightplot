import * as dotenv from "dotenv";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fetch from "node-fetch";
import { getAllFrenchAirports } from "./getAllFrenchAirports.js";

dotenv.config();
const TAF_API_URL = "https://api.checkwx.com/taf";

const checkwxApiToken = process.env.CHECKWX_API_TOKEN || "";

export const fetchTafs = async () => {
  const icaoCodes = await getAllFrenchAirports();

  const response = await fetch(`${TAF_API_URL}/${icaoCodes}`, {
    headers: {
      "X-API-Key": checkwxApiToken,
    },
  });

  console.log(response.status);

  //@ts-ignore
  const tafs = (await response.json()).data;
  console.log(`found ${tafs.length} tafs`);

  let initializationOptions = {};

  initializationOptions = {
    ...initializationOptions,
    credential: cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "")
    ),
  };

  initializeApp(initializationOptions);
  const db = getFirestore();
  await db.collection("tafs").add({ queriedAt: new Date(), tafs });
  console.log(`wrote ${tafs.length} tafs to firestore`);
};

await fetchTafs();
