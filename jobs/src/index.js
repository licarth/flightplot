import { fetchMetars } from "./fetchMetarsNoaa.js";
import { fetchTafs } from "./fetchTafs";
import { initializeApp } from "./initializeApp";
import cron from "node-cron";

initializeApp();

cron.schedule("*/5 * * * *", async () => {
  await fetchMetars();
  await fetchTafs();
});

cron.schedule("2-4,6-9,11-14,31-34,36-39,41-44 6-23 * * *", async () => {
  await fetchMetars();
});
