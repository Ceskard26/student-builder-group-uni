import { NextResponse } from "next/server";

// Ruta de diagnóstico temporal para verificar qué variables de entorno
// llegan realmente al runtime SSR de Amplify. Se borra después de usarla.
export async function GET() {
  return NextResponse.json({
    hasAuthSecret: typeof process.env.AUTH_SECRET === "string" && process.env.AUTH_SECRET.length > 0,
    authSecretLength: process.env.AUTH_SECRET?.length ?? 0,
    hasAuthUrl: typeof process.env.AUTH_URL === "string",
    authUrl: process.env.AUTH_URL ?? null,
    hasGoogleId: typeof process.env.AUTH_GOOGLE_ID === "string" && process.env.AUTH_GOOGLE_ID.length > 0,
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).sort(),
  });
}
