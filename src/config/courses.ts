export type CourseLevel = "entry" | "foundational" | "associate";

export interface Course {
  id: string;
  name: string;
  level: CourseLevel;
  /** Si es true, requiere haber completado Cloud Foundations o tener la
   * certificación AWS Certified Cloud Practitioner. */
  requiresPrerequisite: boolean;
}

export const ENTRY_COURSE_ID = "cloud-foundations";

/**
 * Catálogo de cursos de AWS Academy. Editar esta lista es la única forma
 * soportada de agregar, quitar o renombrar cursos — no está incrustado en
 * los componentes del formulario ni del panel de administración.
 */
export const COURSES: Course[] = [
  {
    id: "cloud-foundations",
    name: "AWS Academy Cloud Foundations",
    level: "entry",
    requiresPrerequisite: false,
  },
  {
    id: "genai-foundations",
    name: "AWS Academy Generative AI Foundations",
    level: "foundational",
    requiresPrerequisite: true,
  },
  {
    id: "ml-foundations",
    name: "AWS Academy Machine Learning Foundations",
    level: "foundational",
    requiresPrerequisite: true,
  },
  {
    id: "dct",
    name: "AWS Academy Data Center Technician (DCT)",
    level: "foundational",
    requiresPrerequisite: true,
  },
  {
    id: "eot",
    name: "AWS Academy Engineering Operations Technicians (EOT)",
    level: "foundational",
    requiresPrerequisite: true,
  },
  {
    id: "cloud-security-foundations",
    name: "AWS Academy Cloud Security Foundations",
    level: "foundational",
    requiresPrerequisite: true,
  },
  {
    id: "cloud-architecting",
    name: "AWS Academy Cloud Architecting",
    level: "associate",
    requiresPrerequisite: true,
  },
  {
    id: "cloud-developing",
    name: "AWS Academy Cloud Developing",
    level: "associate",
    requiresPrerequisite: true,
  },
  {
    id: "cloud-operations",
    name: "AWS Academy Cloud Operations",
    level: "associate",
    requiresPrerequisite: true,
  },
  {
    id: "data-engineering",
    name: "AWS Academy Data Engineering",
    level: "associate",
    requiresPrerequisite: true,
  },
  {
    id: "ml-nlp",
    name: "AWS Academy Machine Learning for Natural Language Processing",
    level: "associate",
    requiresPrerequisite: true,
  },
];

export function getCourseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

export function getEntryCourse(): Course {
  const entry = getCourseById(ENTRY_COURSE_ID);
  if (!entry) throw new Error("Curso de entrada no encontrado en el catálogo");
  return entry;
}

/** Cursos que se muestran en el catálogo de selección (requieren prerequisito). */
export function getSelectableCourses(): Course[] {
  return COURSES.filter((c) => c.requiresPrerequisite);
}
