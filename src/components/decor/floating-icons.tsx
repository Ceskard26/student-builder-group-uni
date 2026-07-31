import { Icon } from "@/components/icons/icon";
import { IconName } from "@/components/icons/paths";

export interface FloatingIconSpec {
  name: IconName;
  className: string;
  colorClassName: string;
  animationClassName?: string;
}

/**
 * Iconos del brand kit dispersos como decoración de fondo, con animación de
 * flotación. Se usa dentro de un contenedor `relative` con `overflow-hidden`.
 */
export function FloatingIcons({ icons }: { icons: FloatingIconSpec[] }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {icons.map((icon, i) => (
        <Icon
          key={i}
          name={icon.name}
          className={`absolute opacity-20 ${icon.colorClassName} ${icon.animationClassName ?? "animate-float"} ${icon.className}`}
        />
      ))}
    </div>
  );
}
