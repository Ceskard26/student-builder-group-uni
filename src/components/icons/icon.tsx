import { ICON_PATHS, IconName } from "./paths";

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const icon = ICON_PATHS[name];
  return (
    <svg
      viewBox={icon.viewBox}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d={icon.d} fill="currentColor" />
    </svg>
  );
}
