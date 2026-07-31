import Link from "next/link";
import { GradientBlobs } from "@/components/decor/gradient-blobs";
import { FloatingIcons } from "@/components/decor/floating-icons";
import { IconMarquee } from "@/components/decor/icon-marquee";
import { Icon } from "@/components/icons/icon";
import { Reveal } from "@/components/reveal";

const HIGHLIGHTS = [
  {
    icon: "bolt" as const,
    color: "text-brand-amber",
    title: "Aprende haciendo",
    body: "Sesiones prácticas y proyectos reales con tecnologías de AWS, no solo teoría.",
  },
  {
    icon: "teams" as const,
    color: "text-brand-blue",
    title: "Comunidad",
    body: "Una comunidad de estudiantes de la UNI que construye y aprende en conjunto.",
  },
  {
    icon: "trophy" as const,
    color: "text-brand-mint",
    title: "Certifícate",
    body: "Acceso a AWS Academy para avanzar hacia certificaciones oficiales de AWS.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden px-6 py-28 text-center sm:py-36">
        <GradientBlobs />
        <FloatingIcons
          icons={[
            { name: "bolt", className: "left-[8%] top-[18%] h-10 w-10", colorClassName: "text-brand-amber" },
            { name: "key", className: "right-[10%] top-[22%] h-12 w-12", colorClassName: "text-brand-blue", animationClassName: "animate-float-delay" },
            { name: "trophy", className: "left-[14%] bottom-[15%] h-14 w-14", colorClassName: "text-brand-mint", animationClassName: "animate-float-slow" },
            { name: "wrench", className: "right-[16%] bottom-[20%] h-10 w-10", colorClassName: "text-brand-purple", animationClassName: "animate-float-delay" },
            { name: "drop", className: "left-1/2 top-[8%] h-8 w-8", colorClassName: "text-brand-magenta", animationClassName: "animate-float-slow" },
          ]}
        />

        <div className="relative mx-auto max-w-4xl">
          <Reveal>
            <img
              src="/brand/program-icon-amber.svg"
              alt=""
              className="mx-auto mb-8 h-16 w-16 animate-spin-slow"
            />
          </Reveal>

          <Reveal delay={100}>
            <h1 className="font-mono text-3xl font-semibold text-white sm:text-5xl">
              Welcome to the{" "}
              <span className="bg-gradient-to-r from-brand-amber via-brand-magenta to-brand-blue bg-clip-text text-transparent">
                Student Builder Group
              </span>{" "}
              at UNI!
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-xl text-neutral-300">
              Somos la comunidad estudiantil de la Universidad Nacional de
              Ingeniería que aprende y construye con tecnologías de AWS.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/aws-academy"
                className="group relative overflow-hidden border border-accent px-5 py-2 font-mono text-sm text-accent transition hover:text-bg"
              >
                <span className="absolute inset-0 -translate-x-full bg-accent transition-transform duration-300 ease-out group-hover:translate-x-0" />
                <span className="relative">Registro a AWS Academy</span>
              </Link>
              <Link
                href="/eventos"
                className="border border-white/20 px-5 py-2 font-mono text-sm text-neutral-200 transition hover:border-white/40 hover:-translate-y-0.5"
              >
                Próximos eventos
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <IconMarquee />

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {HIGHLIGHTS.map((item, i) => (
            <Reveal key={item.title} delay={i * 120}>
              <div className="group h-full border border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]">
                <Icon
                  name={item.icon}
                  className={`h-8 w-8 ${item.color} transition-transform duration-300 group-hover:scale-110`}
                />
                <h2 className="mt-4 font-mono text-lg text-white">{item.title}</h2>
                <p className="mt-2 text-sm text-neutral-400">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
