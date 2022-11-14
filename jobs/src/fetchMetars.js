import * as dotenv from "dotenv";
import { getFirestore } from "firebase-admin/firestore";
import fetch from "node-fetch";
import { getAllFrenchAirports } from "./getAllFrenchAirports.js";

dotenv.config();
const METAR_API_URL = "https://api.checkwx.com/metar";
const checkwxApiToken = process.env.CHECKWX_API_TOKEN || "";

export const fetchMetars = async () => {
  const icaoCodes = await getAllFrenchAirports();

  const response = await fetch(`${METAR_API_URL}/${icaoCodes}`, {
    headers: {
      "X-API-Key": checkwxApiToken,
    },
  });

  //@ts-ignore
  const metars = (await response.json()).data;
  console.log(`found ${metars.length} metars`);

  const db = getFirestore();
  await db.collection("metars").add({ queriedAt: new Date(), metars });
  console.log("wrote metars to firestore");
};
