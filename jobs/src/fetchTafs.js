import * as dotenv from "dotenv";
import { getFirestore } from "firebase-admin/firestore";
import fetch from "node-fetch";
import { AiracData } from "ts-aerodata-france";
import dataJson from "ts-aerodata-france/build/jsonData/2022-11-03.json" assert { type: "json" };

dotenv.config();
const TAF_API_URL = "https://api.checkwx.com/taf";

const checkwxApiToken = process.env.CHECKWX_API_TOKEN || "";
async function getAllFrenchAirports() {
  return (await AiracData.loadCycle(dataJson)).aerodromes
    .filter(({ icaoCode }) => isNaN(Number(icaoCode)))
    .map(({ icaoCode }) => `${icaoCode}`)
    .join(",");
}

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

  const db = getFirestore();
  await db.collection("tafs").add({ queriedAt: new Date(), tafs });
  console.log(`wrote ${tafs.length} tafs to firestore`);
};
