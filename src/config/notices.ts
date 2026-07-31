export interface SiteNotice {
  id: string;
  title: string;
  /** Fecha en formato AAAA-MM-DD. */
  date: string;
  body: string;
}

/** Avisos del grupo. Edita esta lista para publicar o quitar avisos. */
export const NOTICES: SiteNotice[] = [
  {
    id: "apertura-inscripciones-2026-2",
    title: "Inscripciones a AWS Academy — cohorte 2026-2",
    date: "2026-08-01",
    body: "Las inscripciones a AWS Academy para la cohorte 2026-2 abren el 22 de agosto y cierran el 13 de setiembre de 2026. Solo se puede acceder con una cuenta de Google institucional (@uni.pe) desde la sección \"AWS Academy\" del sitio.",
  },
];
