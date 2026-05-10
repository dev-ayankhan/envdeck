import { env } from "../src/runtime";

console.log("Port:", env.PORT);
console.log("Node Env:", env.NODE_ENV);

if (env.PORT === 3000) {
  console.log("Running on default port!");
}
