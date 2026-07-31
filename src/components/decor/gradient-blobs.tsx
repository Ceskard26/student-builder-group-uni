export function GradientBlobs() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -left-32 -top-32 h-96 w-96 animate-drift rounded-full bg-brand-purple/25 blur-3xl" />
      <div className="absolute -right-24 top-10 h-80 w-80 animate-drift-slow rounded-full bg-brand-blue/20 blur-3xl" />
      <div className="absolute bottom-[-6rem] left-1/3 h-96 w-96 animate-drift rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-64 w-64 animate-drift-slow rounded-full bg-brand-magenta/15 blur-3xl" />
    </div>
  );
}
