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

export const { handlers, signIn, signOut, auth } = NextAuth({
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
