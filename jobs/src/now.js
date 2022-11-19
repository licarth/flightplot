import { fetchMetars } from "./fetchMetarsNoaa.js";
import { fetchTafs } from "./fetchTafs";
import { initializeApp } from "./initializeApp";

initializeApp();

await fetchMetars();
await fetchTafs();
