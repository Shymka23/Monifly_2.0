#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const LANGUAGES = ["en", "uk", "ru", "de", "es", "fr"];
const NAMESPACES = [
  "common",
  "dashboard",
  "budgeting",
  "financial-goals",
  "debts",
  "crypto",
  "investment",
  "auth",
  "settings",
];

// Функція для отримання всіх ключів з об'єкта
function getAllKeys(obj, prefix = "") {
  let keys = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        keys = keys.concat(getAllKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }

  return keys;
}

// Функція для валідації структури перекладів
function validateTranslationStructure() {
  const errors = [];
  const warnings = [];
  const localesDir = path.join(process.cwd(), "public", "locales");

  console.log("🔍 Validating translation structure...\n");

  // Перевіряємо що всі файли існують
  for (const lang of LANGUAGES) {
    for (const ns of NAMESPACES) {
      const filePath = path.join(localesDir, lang, `${ns}.json`);

      if (!fs.existsSync(filePath)) {
        errors.push(`❌ Missing file: ${lang}/${ns}.json`);
        continue;
      }

      try {
        const content = JSON.parse(fs.readFileSync(filePath, "utf8"));

        // Перевіряємо що файл не порожній
        if (Object.keys(content).length === 0) {
          warnings.push(`⚠️  Empty file: ${lang}/${ns}.json`);
        }

        console.log(
          `✅ ${lang}/${ns}.json - ${
            Object.keys(content).length
          } top-level keys`
        );
      } catch (e) {
        errors.push(`❌ Invalid JSON: ${lang}/${ns}.json - ${e.message}`);
      }
    }
  }

  return { errors, warnings };
}

// Функція для перевірки консистентності ключів між мовами
function validateKeyConsistency() {
  const errors = [];
  const warnings = [];
  const localesDir = path.join(process.cwd(), "public", "locales");

  console.log("\n🔍 Validating key consistency...\n");

  for (const ns of NAMESPACES) {
    const languageKeys = {};

    // Збираємо ключі з усіх мов для цього namespace
    for (const lang of LANGUAGES) {
      const filePath = path.join(localesDir, lang, `${ns}.json`);

      if (fs.existsSync(filePath)) {
        try {
          const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
          languageKeys[lang] = new Set(getAllKeys(content));
        } catch (e) {
          // Вже обробили цю помилку вище
          languageKeys[lang] = new Set();
        }
      } else {
        languageKeys[lang] = new Set();
      }
    }

    // Знаходимо базову мову (англійську) для порівняння
    const baseKeys = languageKeys["en"] || new Set();

    if (baseKeys.size === 0) {
      warnings.push(`⚠️  No base keys found for namespace: ${ns}`);
      continue;
    }

    // Перевіряємо кожну мову
    for (const lang of LANGUAGES) {
      if (lang === "en") continue; // Пропускаємо базову мову

      const currentKeys = languageKeys[lang];

      // Знаходимо відсутні ключі
      const missingKeys = [...baseKeys].filter(key => !currentKeys.has(key));
      if (missingKeys.length > 0) {
        errors.push(
          `❌ Missing keys in ${lang}/${ns}.json: ${missingKeys
            .slice(0, 5)
            .join(", ")}${
            missingKeys.length > 5
              ? `... (+${missingKeys.length - 5} more)`
              : ""
          }`
        );
      }

      // Знаходимо зайві ключі
      const extraKeys = [...currentKeys].filter(key => !baseKeys.has(key));
      if (extraKeys.length > 0) {
        warnings.push(
          `⚠️  Extra keys in ${lang}/${ns}.json: ${extraKeys
            .slice(0, 3)
            .join(", ")}${
            extraKeys.length > 3 ? `... (+${extraKeys.length - 3} more)` : ""
          }`
        );
      }

      if (missingKeys.length === 0 && extraKeys.length === 0) {
        console.log(`✅ ${lang}/${ns}.json - All ${baseKeys.size} keys match`);
      }
    }
  }

  return { errors, warnings };
}

// Функція для перевірки якості перекладів
function validateTranslationQuality() {
  const warnings = [];
  const localesDir = path.join(process.cwd(), "public", "locales");

  console.log("\n🔍 Validating translation quality...\n");

  for (const lang of LANGUAGES) {
    if (lang === "en") continue; // Пропускаємо базову мову

    for (const ns of NAMESPACES) {
      const filePath = path.join(localesDir, lang, `${ns}.json`);

      if (fs.existsSync(filePath)) {
        try {
          const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
          const allValues = getAllValues(content);

          // Перевіряємо на непереклаені тексти (англійські слова в інших мовах)
          const suspiciousValues = allValues.filter(value => {
            if (typeof value !== "string") return false;

            // Прості евристики для виявлення непереклаених текстів
            const englishWords = [
              "the",
              "and",
              "or",
              "but",
              "in",
              "on",
              "at",
              "to",
              "for",
              "of",
              "with",
              "by",
            ];
            const hasEnglishWords = englishWords.some(
              word =>
                value.toLowerCase().includes(` ${word} `) ||
                value.toLowerCase().startsWith(`${word} `) ||
                value.toLowerCase().endsWith(` ${word}`)
            );

            return hasEnglishWords;
          });

          if (suspiciousValues.length > 0) {
            warnings.push(
              `⚠️  Potentially untranslated text in ${lang}/${ns}.json: "${
                suspiciousValues[0]
              }"${
                suspiciousValues.length > 1
                  ? ` (+${suspiciousValues.length - 1} more)`
                  : ""
              }`
            );
          } else {
            console.log(
              `✅ ${lang}/${ns}.json - Translation quality looks good`
            );
          }
        } catch (e) {
          // Вже обробили цю помилку вище
        }
      }
    }
  }

  return { warnings };
}

// Допоміжна функція для отримання всіх значень
function getAllValues(obj) {
  let values = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        values = values.concat(getAllValues(obj[key]));
      } else {
        values.push(obj[key]);
      }
    }
  }

  return values;
}

// Функція для генерації звіту
function generateReport(structureResult, consistencyResult, qualityResult) {
  const allErrors = [...structureResult.errors, ...consistencyResult.errors];
  const allWarnings = [
    ...structureResult.warnings,
    ...consistencyResult.warnings,
    ...qualityResult.warnings,
  ];

  console.log("\n📊 VALIDATION REPORT\n");
  console.log("=".repeat(50));

  if (allErrors.length === 0 && allWarnings.length === 0) {
    console.log("🎉 All translations are valid and complete!");
    console.log(
      `✅ Validated ${LANGUAGES.length} languages × ${
        NAMESPACES.length
      } namespaces = ${LANGUAGES.length * NAMESPACES.length} files`
    );
    return true;
  }

  if (allErrors.length > 0) {
    console.log(`\n❌ ERRORS (${allErrors.length}):`);
    allErrors.forEach(error => console.log(`  ${error}`));
  }

  if (allWarnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${allWarnings.length}):`);
    allWarnings.forEach(warning => console.log(`  ${warning}`));
  }

  console.log(`\n📈 SUMMARY:`);
  console.log(`  Languages: ${LANGUAGES.join(", ")}`);
  console.log(`  Namespaces: ${NAMESPACES.join(", ")}`);
  console.log(`  Total files: ${LANGUAGES.length * NAMESPACES.length}`);
  console.log(`  Errors: ${allErrors.length}`);
  console.log(`  Warnings: ${allWarnings.length}`);

  return allErrors.length === 0;
}

// Основна функція
function main() {
  console.log("🌍 TRANSLATION VALIDATION");
  console.log("=".repeat(50));

  const structureResult = validateTranslationStructure();
  const consistencyResult = validateKeyConsistency();
  const qualityResult = validateTranslationQuality();

  const isValid = generateReport(
    structureResult,
    consistencyResult,
    qualityResult
  );

  process.exit(isValid ? 0 : 1);
}

// Запускаємо якщо це основний модуль
if (require.main === module) {
  main();
}

module.exports = {
  validateTranslationStructure,
  validateKeyConsistency,
  validateTranslationQuality,
};
