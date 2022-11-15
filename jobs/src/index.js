import { fetchMetars } from "./fetchMetars";
import { fetchTafs } from "./fetchTafs";
import { initializeApp } from "./initializeApp";
import cron from "node-cron";

initializeApp();

cron.schedule("*/5 * * * *", async () => {
  await fetchMetars();
  await fetchTafs();
});
