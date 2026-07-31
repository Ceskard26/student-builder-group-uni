import { NOTICES } from "@/config/notices";
import { Icon } from "@/components/icons/icon";
import { Reveal } from "@/components/reveal";

const ACCENTS = [
  "border-brand-amber",
  "border-brand-blue",
  "border-brand-mint",
  "border-brand-magenta",
  "border-brand-purple",
];

export default function AvisosPage() {
  const sorted = [...NOTICES].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Reveal>
        <div className="mb-8 flex items-center gap-3">
          <Icon name="drop" className="h-8 w-8 text-brand-mint" />
          <h1 className="font-mono text-3xl font-semibold text-accent">
            Avisos
          </h1>
        </div>
      </Reveal>

      <div className="space-y-6">
        {sorted.map((notice, i) => (
          <Reveal key={notice.id} delay={i * 100}>
            <div
              className={`border-l-2 pl-4 transition hover:pl-5 ${ACCENTS[i % ACCENTS.length]}`}
            >
              <p className="font-mono text-xs uppercase text-neutral-400">
                {notice.date}
              </p>
              <h2 className="mt-1 text-lg text-white">{notice.title}</h2>
              <p className="mt-2 text-sm text-neutral-300">{notice.body}</p>
            </div>
          </Reveal>
        ))}

        {sorted.length === 0 && (
          <p className="text-neutral-400">No hay avisos por el momento.</p>
        )}
      </div>
    </div>
  );
}
