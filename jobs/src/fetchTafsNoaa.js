import * as dotenv from "dotenv";
import { AiracData } from "ts-aerodata-france";
import dataJson from "ts-aerodata-france/build/jsonData/2022-11-03.json" assert { type: "json" };
import { getFirestore } from "firebase-admin/firestore";
import fetch from "node-fetch";
import _ from "lodash";

dotenv.config();
const URL_PREFIX = "https://tgftp.nws.noaa.gov/data/observations/metar/cycles";

const padTo2Digits = (number) => {
  return number.toString().padStart(2, "0");
};

export const fetchMetars = async () => {
  const frenchAirports = await getAllFrenchAirports();

  const url = `${URL_PREFIX}/${padTo2Digits(new Date().getUTCHours())}Z.TXT`;
  console.log(`fetching metars from ${url}`);
  const response = await fetch(url);

  const data = await response.text();

  //@ts-ignore
  const metars = data
    .split("\n\n")
    .map((metar) => metar.split("\n")[1])
    .filter((m) => m !== undefined);

  console.log(`found ${metars.length} metars`);

  const frenchMetars = metars.filter((metar) =>
    frenchAirports.includes(metar.substring(0, 4))
  );

  console.log(
    `found ${frenchMetars.length} french metars out of ${metars.length} metars`
  );

  // There are many metars for the same airport, we only want the latest one, and the shortest one
  const frenchMetarsByIcaoCode = frenchMetars.reduce((acc, metar) => {
    const airport = metar.substring(0, 4);
    if (acc[airport] === undefined) {
      acc[airport] = metar;
    } else {
      if (metar > acc[airport]) {
        acc[airport] = metar;
      } else if (
        metar.split(" ")[1] === acc[airport].split(" ")[1] &&
        metar.length < acc[airport].length
      ) {
        acc[airport] = metar;
      }
    }
    return acc;
  }, {});

  console.log("frenchMetarsByIcaoCode", frenchMetarsByIcaoCode);

  console.log(
    `found ${Object.keys(frenchMetarsByIcaoCode).length} unique french metars`
  );
  const db = getFirestore();
  await db
    .collection("metars")
    .add({
      queriedAt: new Date(),
      metars: Object.values(frenchMetarsByIcaoCode),
    });
  console.log("wrote metars to firestore");
};

async function getAllFrenchAirports() {
  return (await AiracData.loadCycle(dataJson)).aerodromes
    .filter(({ icaoCode }) => isNaN(Number(icaoCode)))
    .map(({ icaoCode }) => `${icaoCode}`);
}
