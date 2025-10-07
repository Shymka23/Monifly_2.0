#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function updatePackageJson() {
  const packagePath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  // Додаємо нові скрипти для i18n
  const newScripts = {
    "i18n:generate": "node scripts/generate-translations.cjs",
    "i18n:validate": "node scripts/validate-translations.cjs",
    "i18n:fix": "node scripts/fix-missing-translations.cjs",
    "i18n:check": "npm run i18n:validate && npm run type-check",
    "type-check": "tsc --noEmit",
    "build:check": "npm run i18n:check && npm run build",
  };

  // Оновлюємо scripts секцію
  packageJson.scripts = {
    ...packageJson.scripts,
    ...newScripts,
  };

  // Записуємо назад
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

  console.log("✅ Package.json updated with i18n scripts:");
  Object.keys(newScripts).forEach(script => {
    console.log(`  - npm run ${script}`);
  });
}

if (require.main === module) {
  updatePackageJson();
}
