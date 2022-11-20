import { fetchMetars } from "./fetchMetarsNoaa";
import { fetchTafs } from "./fetchTafs";

await fetchMetars();
await fetchTafs();
