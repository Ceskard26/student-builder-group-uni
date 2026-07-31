export interface SiteEvent {
  id: string;
  title: string;
  /** Fecha y hora en formato ISO, con offset de America/Lima (-05:00). */
  date: string;
  description: string;
  meetupUrl: string;
}

/**
 * Próximos eventos del grupo. Esta página enlaza a Meetup, no lo reemplaza:
 * el detalle real (cupos, RSVP, ubicación) vive en Meetup. Actualiza esta
 * lista manualmente cuando se programe un evento nuevo.
 */
export const EVENTS: SiteEvent[] = [
  {
    id: "kickoff-cohorte-2026-2",
    title: "Kickoff de la cohorte 2026-2 de AWS Academy",
    date: "2026-08-25T18:00:00-05:00",
    description:
      "Presentación del programa AWS Academy, el catálogo de cursos disponibles y cómo funciona el proceso de inscripción de esta cohorte.",
    meetupUrl: "https://www.meetup.com/aws-student-builder-group-uni/",
  },
];
