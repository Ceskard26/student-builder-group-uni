import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Ruta de diagnóstico temporal para verificar qué variables de entorno
// llegan realmente al runtime SSR de Amplify. Se borra después de usarla.
export async function GET() {
  let authCallResult: { ok: boolean; error?: string; stack?: string } = { ok: false };
  try {
    await auth();
    authCallResult = { ok: true };
  } catch (err) {
    authCallResult = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    };
  }

  return NextResponse.json({
    hasAuthSecret: typeof process.env.AUTH_SECRET === "string" && process.env.AUTH_SECRET.length > 0,
    authSecretLength: process.env.AUTH_SECRET?.length ?? 0,
    hasAuthUrl: typeof process.env.AUTH_URL === "string",
    authUrl: process.env.AUTH_URL ?? null,
    hasGoogleId: typeof process.env.AUTH_GOOGLE_ID === "string" && process.env.AUTH_GOOGLE_ID.length > 0,
    // Variables no-AUTH_ para comparar: ¿es solo AUTH_* o todas faltan?
    cohortId: process.env.COHORT_ID ?? null,
    dynamoTable: process.env.DYNAMODB_TABLE_NAME ?? null,
    adminEmails: process.env.ADMIN_EMAILS ?? null,
    allowedDomain: process.env.ALLOWED_EMAIL_DOMAIN ?? null,
    nodeEnv: process.env.NODE_ENV,
    authCallResult,
  });
}
