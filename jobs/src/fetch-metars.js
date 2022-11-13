import * as dotenv from "dotenv";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fetch from "node-fetch";
import { AiracData } from "ts-aerodata-france";
import dataJson from "ts-aerodata-france/build/jsonData/2022-11-03.json" assert { type: "json" };

dotenv.config();
const metarApiUrl = "https://api.checkwx.com/metar";
const checkwxApiToken = process.env.CHECKWX_API_TOKEN || "";

(async function () {
  const icaoCodes = (await AiracData.loadCycle(dataJson)).aerodromes
    .filter(({ icaoCode }) => isNaN(Number(icaoCode)))
    .map(({ icaoCode }) => `${icaoCode}`)
    .join(",");

  const response = await fetch(`${metarApiUrl}/${icaoCodes}`, {
    headers: {
      "X-API-Key": checkwxApiToken,
    },
  });

  console.log(response.status);

  //@ts-ignore
  const metars = (await response.json()).data;
  console.log(metars);

  let initializationOptions = {};

  initializationOptions = {
    ...initializationOptions,
    credential: cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "")
    ),
  };

  const app = initializeApp(initializationOptions);
  const db = getFirestore();
  const res = await db.collection("metars").add({ metars });
})();
