import { fetchMetars } from "./fetchMetarsNoaa.js";
import cron from "node-cron";

fetchMetars();

cron.schedule("0,30 * * * *", () => {
  fetchMetars();
});
