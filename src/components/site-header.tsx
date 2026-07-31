import Link from "next/link";
import { auth } from "@/auth";
import { signInWithGoogle, signOutAction } from "@/lib/auth-actions";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/eventos", label: "Eventos" },
  { href: "/avisos", label: "Avisos" },
  { href: "/aws-academy", label: "AWS Academy" },
];

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-2">
          <img
            src="/brand/program-icon-amber.svg"
            alt=""
            className="h-7 w-7 transition-transform duration-500 ease-out group-hover:rotate-45 group-hover:scale-110"
          />
          <span className="font-mono text-sm font-semibold tracking-wide text-white">
            AWS <span className="text-accent">Student Builder Group</span> · UNI
          </span>
        </Link>

        <nav className="hidden gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative font-mono text-sm text-neutral-300 transition hover:text-accent"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div>
          {session?.user ? (
            <form action={signOutAction}>
              <button
                type="submit"
                className="font-mono text-xs text-neutral-400 underline decoration-dotted hover:text-white"
              >
                Salir ({session.user.email})
              </button>
            </form>
          ) : (
            <form action={signInWithGoogle}>
              <button
                type="submit"
                className="relative overflow-hidden border border-accent px-3 py-1.5 font-mono text-xs text-accent transition hover:bg-accent hover:text-bg hover:shadow-[0_0_20px_-4px_#FF9900]"
              >
                Iniciar sesión
              </button>
            </form>
          )}
        </div>
      </div>

      <nav className="flex gap-4 overflow-x-auto border-t border-white/5 px-6 py-2 md:hidden">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap font-mono text-xs text-neutral-300 hover:text-accent"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
