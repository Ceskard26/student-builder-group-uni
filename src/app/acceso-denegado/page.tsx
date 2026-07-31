import Link from "next/link";
import { ALLOWED_EMAIL_DOMAIN } from "@/auth";

export default function AccesoDenegadoPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="font-mono text-2xl font-semibold text-accent">
        Acceso no permitido
      </h1>
      <p className="mt-4 text-neutral-300">
        El registro a AWS Academy es exclusivo para cuentas de Google
        institucionales que terminan en{" "}
        <span className="text-white">@{ALLOWED_EMAIL_DOMAIN}</span>. La cuenta
        con la que iniciaste sesión no cumple este requisito.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block border border-accent px-5 py-2 font-mono text-sm text-accent transition hover:bg-accent hover:text-bg"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
