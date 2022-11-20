import * as dotenv from "dotenv";
import { AiracData } from "ts-aerodata-france";
import dataJson from "ts-aerodata-france/build/jsonData/2022-11-03.json" assert { type: "json" };
import fetch from "node-fetch";
import _ from "lodash";
import { initializeApp } from "./initializeApp";
import format from "date-fns/format";

dotenv.config();
const URL_PREFIX = "https://tgftp.nws.noaa.gov/data/observations/metar/cycles";

const padTo2Digits = (number) => {
  return number.toString().padStart(2, "0");
};

function getWaitingDelayInSecondsForSecond(second) {
  const delays = [
    [60, 2], // In the first 60 seconds, wait 2 seconds between checks
    [90, 2],
    [2 * 60, 5],
    [5 * 60, 20],
    [10 * 60, 60],
    [24 * 60, 5 * 60],
  ];
  for (const [threshold, delay] of _.sortBy(
    delays,
    ([threshold]) => threshold
  )) {
    if (second <= threshold) {
      return delay;
    }
  }
  return -1;
}

export const fetchMetars = async () => {
  const searchStart = new Date();
  const searchLogPrefix = `[${format(searchStart, "HH:mm")}] `;

  const frenchAirports = await getAllFrenchAirports();

  const log = (message) => console.log(`${searchLogPrefix}${message}`);

  const url = `${URL_PREFIX}/${padTo2Digits(new Date().getUTCHours())}Z.TXT`;
  const search = async () => fetchData(url, frenchAirports, log);

  let lastModified = await getLastModifiedDate(url);

  let metars = await search();
  while (true) {
    const newLastModified = await getLastModifiedDate(url);
    if (isAfter(newLastModified, lastModified)) {
      log("newLastModified", newLastModified);
      log("lastModified", lastModified);
      log("new metars found in HEAD request, fetching them");
      lastModified = newLastModified;
      metars = compare(metars, await search(), log);
    } else {
      log("no new metars found in HEAD request, waiting...");
    }
    const secondsSinceSearchStart = differenceInSeconds(
      new Date(),
      searchStart
    );
    log("secondsSinceSearchStart", secondsSinceSearchStart);
    const waitingDelayInSeconds = getWaitingDelayInSecondsForSecond(
      secondsSinceSearchStart
    );

    if (waitingDelayInSeconds === -1) {
      log("waitingDelayInSeconds === -1, exiting");
      break;
    }

    log(
      `waiting ${waitingDelayInSeconds} seconds before next search for metars`
    );
    await waitForSeconds(waitingDelayInSeconds);
  }
};

const compare = (existingMetarSet, newMetarSet, log) => {
  const newMetars = _.difference(
    Object.keys(newMetarSet || {}),
    Object.keys(existingMetarSet || {})
  );

  log(`newMetars: ${newMetars.length > 0 ? newMetars.join(", ") : " -- "}`);

  return newMetarSet;
};

const isAfter = (date1, date2) => {
  return date1.getTime() > date2.getTime();
};

const differenceInSeconds = (date1, date2) => {
  return (date1.getTime() - date2.getTime()) / 1000;
};

const waitForSeconds = (delayInSeconds) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delayInSeconds * 1000);
  });
};

const getLastModifiedDate = async (url) => {
  const lastUpdatedHeader = await fetch(url, { method: "HEAD" });
  const lastModifiedHeader = lastUpdatedHeader.headers.get("last-modified");
  return new Date(lastModifiedHeader);
};

async function fetchData(url, frenchAirports, log) {
  const { firestore } = initializeApp();
  log(`fetching metars from ${url}`);
  const response = await fetch(url);

  const data = await response.text();

  //@ts-ignore
  const metars = data
    .split("\n\n")
    .map((metar) => metar.split("\n")[1])
    .filter((m) => m !== undefined);

  log(`found ${metars.length} metars`);

  // There are many metars for the same airport, we only want the latest one, and the shortest one
  const metarsByIcaoCode = metars.reduce((acc, metar) => {
    const airport = metar.substring(0, 4);
    if (acc[airport] === undefined) {
      acc[airport] = metar;
    } else {
      if (metar > acc[airport]) {
        acc[airport] = metar;
      } else if (
        areEquallyRecent(metar, acc[airport]) &&
        metar.length < acc[airport].length
      ) {
        acc[airport] = metar;
      }
    }
    return acc;
  }, {});

  const frenchMetarsByIcaoCode = _.pickBy(metarsByIcaoCode, (metar) => {
    return frenchAirports.includes(metar.substring(0, 4));
  });

  log(
    `found ${Object.keys(frenchMetarsByIcaoCode).length} french metars out of ${
      Object.keys(metarsByIcaoCode).length
    } metars`
  );

  // merge old and new metars per airport
  // fetch current metars
  const metarsRef = firestore
    .collection("metars")
    .orderBy("queriedAt", "desc")
    .limit(1);

  const metarsSnapshot = (await metarsRef.get()).docs[0];
  const currentMetars = metarsSnapshot?.data().metars || []; // string[]

  const currentMetarsByIcaoCode = _.keyBy(
    currentMetars,
    (metar) => `${icaoCode(metar)}`
  );

  const newMetars = { ...currentMetarsByIcaoCode, ...frenchMetarsByIcaoCode };

  if (_.isEqual(currentMetarsByIcaoCode, newMetars)) {
    log("no new metars, skipping update");
    return;
  }

  await firestore.collection("metars").add({
    queriedAt: new Date(),
    metars: Object.values(newMetars),
  });
  log("wrote metars to firestore");

  return metarsByIcaoCode;
}

async function getAllFrenchAirports() {
  return (await AiracData.loadCycle(dataJson)).aerodromes
    .filter(({ icaoCode }) => isNaN(Number(icaoCode)))
    .map(({ icaoCode }) => `${icaoCode}`);
}

const icaoCode = (metar) => metar.substring(0, 4);

const isMoreRecent = (metar1, metar2) => {
  return metar1.split(" ")[1] > metar2.split(" ")[1];
};

const areEquallyRecent = (metar1, metar2) => {
  return metar1.split(" ")[1] === metar2.split(" ")[1];
};
