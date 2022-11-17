import { AiracData } from "ts-aerodata-france";
import dataJson from "ts-aerodata-france/build/jsonData/2022-11-03.json" assert { type: "json" };

export async function getAllFrenchAirports() {
  return (await AiracData.loadCycle(dataJson)).aerodromes
    .filter(({ icaoCode }) => isNaN(Number(icaoCode)))
    .map(({ icaoCode }) => `${icaoCode}`)
    .join(",");
}
