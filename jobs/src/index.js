import { fetchMetars } from "./fetchMetars";
import { fetchTafs } from "./fetchTafs";
import { initializaApp } from "./initializeApp";
import cron from "node-cron";

initializaApp();

cron.schedule("15,29,45,59 * * * *", async () => {
  await fetchMetars();
  await fetchTafs();
});
