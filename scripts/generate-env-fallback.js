// Genera src/generated-env-fallback.ts a partir de process.env en el
// momento del build. Corre en local (valores vacíos, sin uso real, ya que
// .env.local resuelve todo directo) y en Amplify (valores reales, usados
// como respaldo porque el runtime SSR de Amplify no inyecta de forma
// confiable las variables de entorno configuradas en la consola).
//
// El archivo generado NUNCA se commitea (ver .gitignore).
const fs = require("fs");
const path = require("path");

const KEYS = [
  "AUTH_SECRET",
  "AUTH_URL",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "ALLOWED_EMAIL_DOMAIN",
  "AWS_REGION",
  "DYNAMODB_TABLE_NAME",
  "COHORT_ID",
  "ENROLLMENT_OPEN_AT",
  "ENROLLMENT_CLOSE_AT",
  "GMAIL_USER",
  "GMAIL_APP_PASSWORD",
  "MAIL_FROM",
  "MAIL_CONTACT",
  "ADMIN_EMAILS",
];

const values = {};
for (const key of KEYS) {
  if (process.env[key]) {
    values[key] = process.env[key];
  }
}

const out = `// AUTO-GENERADO por scripts/generate-env-fallback.js en build time.
// No editar a mano, no se commitea (ver .gitignore).
export const ENV_FALLBACK: Record<string, string> = ${JSON.stringify(values, null, 2)};
`;

const dest = path.join(__dirname, "..", "src", "generated-env-fallback.ts");
fs.writeFileSync(dest, out, "utf-8");
console.log(
  `[generate-env-fallback] wrote ${Object.keys(values).length}/${KEYS.length} keys to ${dest}`,
);
