const TIMEZONE = "America/Lima";

export type WindowState = "before" | "open" | "after";

function readEnvDate(name: string): Date {
  const raw = process.env[name];
  if (!raw) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`La variable de entorno ${name} no es una fecha válida: ${raw}`);
  }
  return date;
}

export function getEnrollmentWindow() {
  return {
    openAt: readEnvDate("ENROLLMENT_OPEN_AT"),
    closeAt: readEnvDate("ENROLLMENT_CLOSE_AT"),
  };
}

export function getWindowState(now: Date = new Date()): WindowState {
  const { openAt, closeAt } = getEnrollmentWindow();
  if (now.getTime() < openAt.getTime()) return "before";
  if (now.getTime() > closeAt.getTime()) return "after";
  return "open";
}

export function isEnrollmentWindowOpen(now: Date = new Date()): boolean {
  return getWindowState(now) === "open";
}

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  timeZone: TIMEZONE,
  dateStyle: "long",
  timeStyle: "short",
});

/** Formatea una fecha en la zona horaria America/Lima para mostrarla al usuario. */
export function formatLimaDate(date: Date): string {
  return `${dateFormatter.format(date)} (hora de Perú)`;
}
