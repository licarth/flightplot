import { fetchMetars } from "./fetchMetars.js";
import { fetchTafs } from "./fetchTafs.js";
import { initializeApp } from "./initializeApp";

initializeApp();

await fetchMetars();
await fetchTafs();
