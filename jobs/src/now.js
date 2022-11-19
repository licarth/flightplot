import { fetchMetars } from "./fetchMetarsNoaa.js";
import { initializeApp } from "./initializeApp";

initializeApp();

await fetchMetars();
await fetchTafs();
