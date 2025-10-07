const fs = require("fs");
const path = require("path");

const controllersDir = path.join(__dirname, "src/controllers");
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith(".ts"));

files.forEach(file => {
  const filePath = path.join(controllersDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // Add Promise<Response | void> to methods without return type
  content = content.replace(
    /(static async \w+\([^)]+\))\s*\{/g,
    "$1: Promise<Response | void> {"
  );

  // Fix duplicates
  content = content.replace(
    /: Promise<Response \| void>: Promise<Response \| void>/g,
    ": Promise<Response | void>"
  );

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Fixed: ${file}`);
});

console.log("Done!");
