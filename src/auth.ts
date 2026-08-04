import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Dominio institucional permitido para el registro de AWS Academy.
 * Todo lo demás en el sitio es público y no requiere sesión.
 */
export const ALLOWED_EMAIL_DOMAIN = (
  process.env.ALLOWED_EMAIL_DOMAIN ?? "uni.pe"
).toLowerCase();

export function isAllowedInstitutionalEmail(email: string | null | undefined) {
  if (!email) return false;
  return email.toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}

// DEBUG temporal: confirmar qué ve este módulo al evaluarse en el runtime de Amplify.
console.log(
  "[auth.ts debug] AUTH_SECRET present:",
  typeof process.env.AUTH_SECRET === "string" && process.env.AUTH_SECRET.length > 0,
  "length:",
  process.env.AUTH_SECRET?.length ?? 0,
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Auth.js solo confía en el host de la request automáticamente en Vercel.
  // En Amplify (y cualquier otra plataforma detrás de un proxy/CDN) hay que
  // confirmarlo explícitamente, o rechaza la sesión con "UntrustedHost".
  // AUTH_URL ya fija el dominio esperado; esto solo autoriza al servidor a
  // usar el host real de la request entrante.
  trustHost: true,
  // Se pasa explícito en vez de confiar en la autodetección de
  // `process.env.AUTH_SECRET`: en el runtime serverless de Amplify esa
  // autodetección fallaba de forma intermitente ("MissingSecret") aunque
  // la variable de entorno sí estaba configurada.
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      authorization: {
        params: {
          // `hd` es solo una sugerencia de UX para que Google preseleccione
          // cuentas del dominio institucional. NO reemplaza la validación
          // server-side que ocurre abajo en el callback `signIn`.
          hd: ALLOWED_EMAIL_DOMAIN,
          prompt: "select_account",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    error: "/acceso-denegado",
  },
  callbacks: {
    // Esta es la validación real. Se ejecuta en el servidor al recibir el
    // token de Google, antes de crear la sesión. Un correo fuera del
    // dominio institucional nunca llega a tener sesión, sin importar qué
    // parámetros haya tenido la URL de autorización.
    async signIn({ user }) {
      return isAllowedInstitutionalEmail(user.email);
    },
  },
});
