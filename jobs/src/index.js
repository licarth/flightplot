import { fetchMetars } from "./fetchMetarsNoaa.js";
import { fetchTafs } from "./fetchTafs";
import cron from "node-cron";

// cron.schedule("*/5 * * * *", async () => {
//   await fetchTafs();
// });

cron.schedule("* * * * *", async () => {
  await fetchMetars();
});
