import { EVENTS } from "@/config/events";
import { Icon } from "@/components/icons/icon";
import { Reveal } from "@/components/reveal";

const eventDateFormatter = new Intl.DateTimeFormat("es-PE", {
  timeZone: "America/Lima",
  dateStyle: "long",
  timeStyle: "short",
});

const ACCENTS = [
  { border: "hover:border-brand-amber/60", text: "text-brand-amber" },
  { border: "hover:border-brand-blue/60", text: "text-brand-blue" },
  { border: "hover:border-brand-mint/60", text: "text-brand-mint" },
  { border: "hover:border-brand-magenta/60", text: "text-brand-magenta" },
  { border: "hover:border-brand-purple/60", text: "text-brand-purple" },
];

export default function EventosPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Reveal>
        <div className="mb-2 flex items-center gap-3">
          <Icon name="clock" className="h-8 w-8 text-brand-blue" />
          <h1 className="font-mono text-3xl font-semibold text-accent">
            Próximos eventos
          </h1>
        </div>
      </Reveal>
      <Reveal delay={80}>
        <p className="mb-8 text-sm text-neutral-400">
          Organizamos y confirmamos nuestros eventos en Meetup. Esta página no
          reemplaza Meetup, solo enlaza a los eventos.
        </p>
      </Reveal>

      <div className="space-y-4">
        {EVENTS.map((event, i) => {
          const accent = ACCENTS[i % ACCENTS.length];
          return (
            <Reveal key={event.id} delay={150 + i * 100}>
              <a
                href={event.meetupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`group block border border-white/10 p-5 transition duration-300 hover:-translate-y-1 ${accent.border}`}
              >
                <p className="font-mono text-xs uppercase text-neutral-400">
                  {eventDateFormatter.format(new Date(event.date))} (hora de Perú)
                </p>
                <h2 className="mt-1 text-lg text-white">{event.title}</h2>
                <p className="mt-2 text-sm text-neutral-300">{event.description}</p>
                <p className={`mt-3 font-mono text-xs ${accent.text} transition-transform duration-300 group-hover:translate-x-1`}>
                  Ver en Meetup →
                </p>
              </a>
            </Reveal>
          );
        })}

        {EVENTS.length === 0 && (
          <p className="text-neutral-400">
            No hay eventos programados por ahora. Revisa nuestro Meetup para
            futuras convocatorias.
          </p>
        )}
      </div>
    </div>
  );
}
