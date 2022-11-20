import { fetchMetars } from "./fetchMetarsNoaa.js";
import { fetchTafs } from "./fetchTafs";

await fetchMetars();
await fetchTafs();
