// Se ejecuta una sola vez cuando arranca el servidor Next.js, antes de
// atender cualquier request. Aplica ENV_FALLBACK solo para las variables
// que process.env no tenga ya seteadas — en local nunca hace nada (ya
// están en .env.local); en Amplify rellena lo que el runtime no inyectó.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { ENV_FALLBACK } = await import("./generated-env-fallback");

  for (const [key, value] of Object.entries(ENV_FALLBACK)) {
    if (!process.env[key] && value) {
      process.env[key] = value;
    }
  }
}
