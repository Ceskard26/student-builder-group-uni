import { Icon } from "@/components/icons/icon";
import { IconName } from "@/components/icons/paths";

const SEQUENCE: { name: IconName; color: string }[] = [
  { name: "bolt", color: "text-brand-amber" },
  { name: "key", color: "text-brand-blue" },
  { name: "trophy", color: "text-brand-mint" },
  { name: "wrench", color: "text-brand-purple" },
  { name: "teams", color: "text-brand-magenta" },
  { name: "speaker", color: "text-brand-amber" },
  { name: "ladder", color: "text-brand-blue" },
  { name: "drop", color: "text-brand-mint" },
  { name: "clock", color: "text-brand-purple" },
  { name: "bracket-smile", color: "text-brand-magenta" },
];

function Row({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center gap-16 pr-16"
      aria-hidden={ariaHidden}
    >
      {SEQUENCE.map((item, i) => (
        <Icon
          key={i}
          name={item.name}
          className={`h-8 w-8 ${item.color} opacity-70`}
        />
      ))}
    </div>
  );
}

/** Tira horizontal de iconos del brand kit, en loop infinito. */
export function IconMarquee() {
  return (
    <div className="overflow-hidden border-y border-white/10 bg-white/5 py-6">
      <div className="flex w-max animate-marquee">
        <Row />
        <Row ariaHidden />
      </div>
    </div>
  );
}
