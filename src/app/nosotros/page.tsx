import { Icon } from "@/components/icons/icon";
import { Reveal } from "@/components/reveal";
import { GradientBlobs } from "@/components/decor/gradient-blobs";

const ACTIVITIES = [
  {
    icon: "teams" as const,
    color: "text-brand-blue",
    title: "Sesiones de estudio",
    body: "Nos juntamos a estudiar temas de la nube de AWS en grupo, a nuestro propio ritmo.",
  },
  {
    icon: "speaker" as const,
    color: "text-brand-magenta",
    title: "Charlas",
    body: "Invitamos a hablar sobre experiencias y proyectos construidos con tecnologías de AWS.",
  },
  {
    icon: "trophy" as const,
    color: "text-brand-mint",
    title: "Certificación",
    body: "Facilitamos el acceso a AWS Academy para quienes quieran certificarse en la nube.",
  },
];

export default function NosotrosPage() {
  return (
    <div className="relative min-h-[70vh] overflow-hidden px-6 py-20">
      <GradientBlobs />

      <div className="relative mx-auto max-w-3xl space-y-6">
        <Reveal>
          <div className="flex items-center gap-3">
            <Icon name="bracket-smile-double" className="h-9 w-9 text-brand-amber" />
            <h1 className="font-mono text-3xl font-semibold text-accent">Nosotros</h1>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <p className="text-neutral-200">
            El AWS Student Builder Group de la Universidad Nacional de
            Ingeniería (UNI) es una comunidad estudiantil que promueve el
            aprendizaje práctico de tecnologías en la nube de AWS entre
            estudiantes de la universidad.
          </p>
        </Reveal>

        <Reveal delay={150}>
          <p className="text-neutral-300">
            Puedes ver nuestros próximos eventos en la sección{" "}
            <a href="/eventos" className="text-accent underline underline-offset-2 hover:text-brand-amber">
              Eventos
            </a>
            .
          </p>
        </Reveal>

        <div className="grid gap-4 pt-4 sm:grid-cols-3">
          {ACTIVITIES.map((item, i) => (
            <Reveal key={item.title} delay={200 + i * 120}>
              <div className="group h-full border border-white/10 bg-white/5 p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20">
                <Icon
                  name={item.icon}
                  className={`h-7 w-7 ${item.color} transition-transform duration-300 group-hover:scale-110`}
                />
                <h2 className="mt-3 font-mono text-sm text-white">{item.title}</h2>
                <p className="mt-2 text-xs text-neutral-400">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={600}>
          <p className="border-l-2 border-accent pl-4 text-sm text-neutral-400">
            Somos un grupo estudiantil independiente. No somos empleados de
            Amazon Web Services ni representamos oficialmente a la empresa.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
