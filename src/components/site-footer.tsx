import { Icon } from "@/components/icons/icon";

const FOOTER_ICONS = [
  { name: "bolt" as const, color: "text-brand-amber" },
  { name: "teams" as const, color: "text-brand-blue" },
  { name: "trophy" as const, color: "text-brand-mint" },
  { name: "key" as const, color: "text-brand-purple" },
  { name: "speaker" as const, color: "text-brand-magenta" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-neutral-500">
          <p>
            AWS Student Builder Group · Universidad Nacional de Ingeniería (UNI), Lima, Perú.
          </p>
          <p className="mt-1">
            Este es un grupo estudiantil independiente. No representa ni emplea a Amazon Web Services.
          </p>
        </div>
        <div className="flex gap-4">
          {FOOTER_ICONS.map((icon) => (
            <Icon
              key={icon.name}
              name={icon.name}
              className={`h-4 w-4 ${icon.color} opacity-60 transition hover:opacity-100`}
            />
          ))}
        </div>
      </div>
    </footer>
  );
}
