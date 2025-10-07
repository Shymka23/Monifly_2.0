const fs = require("fs");
const path = require("path");

const controllersDir = path.join(__dirname, "src/controllers");
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith(".ts"));

files.forEach(file => {
  const filePath = path.join(controllersDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // Fix common implicit any patterns
  content = content.replace(/\.map\((\w+) =>/g, ".map(($1: any) =>");
  content = content.replace(/\.filter\((\w+) =>/g, ".filter(($1: any) =>");
  content = content.replace(
    /\.reduce\(\((\w+), (\w+)\) =>/g,
    ".reduce(($ 1: any, $2: any) =>"
  );
  content = content.replace(/\.forEach\((\w+) =>/g, ".forEach(($1: any) =>");
  content = content.replace(
    /\$transaction\(async \((\w+)\) =>/g,
    "$$transaction(async ($1: any) =>"
  );

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Fixed: ${file}`);
});

console.log("Done!");
