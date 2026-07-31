import { EnrollmentStatus } from "@/types/enrollment";

export const STATUS_LABELS: Record<EnrollmentStatus, string> = {
  submitted: "Enviada — pendiente de revisión",
  under_review: "En revisión",
  needs_correction: "Necesita corrección",
  approved: "Aprobada",
  enrolled: "Matriculado",
};
