const { readFileSync, writeFileSync } = require("fs");

const first = readFileSync("./content/first.txt", "utf-8");
const second = readFileSync("./content/second.txt", "utf-8");

writeFileSync(
  "./content/result_sync.txt",
  `Here is the result ${first} and ${second}`,
  { flag: "a" }
);
console.log(first, second);
