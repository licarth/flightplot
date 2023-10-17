import * as dotenv from "dotenv";
import { getFirestore } from "firebase-admin/firestore";
import fetch from "node-fetch";
import { AiracData } from "ts-aerodata-france";
import dataJson from "ts-aerodata-france/build/jsonData/2023-02-23.json" assert { type: "json" };

dotenv.config();
const METAR_API_URL = "https://api.checkwx.com/metar";
const checkwxApiToken = process.env.CHECKWX_API_TOKEN || "";

async function getAllFrenchAirports() {
  return (await AiracData.loadCycle(dataJson)).aerodromes
    .filter(({ icaoCode }) => isNaN(Number(icaoCode)))
    .map(({ icaoCode }) => `${icaoCode}`)
    .join(",");
}

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
