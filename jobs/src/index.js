import cron from "node-cron";
import { fetchMetars } from "./fetchMetarsNoaa.js";

fetchMetars();

cron.schedule("0,30 * * * *", () => {
  fetchMetars();
  fetch("https://hc-ping.com/616d2f87-d19e-4fe6-bc39-9227d6e7c245");
});
