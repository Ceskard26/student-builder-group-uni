export type EnrollmentStatus =
  | "submitted"
  | "under_review"
  | "needs_correction"
  | "approved"
  | "enrolled";

export const ENROLLMENT_STATUSES: EnrollmentStatus[] = [
  "submitted",
  "under_review",
  "needs_correction",
  "approved",
  "enrolled",
];

export interface Enrollment {
  email: string;
  cohortId: string;
  fullName: string;
  studentCode: string;
  courseId: string;
  /** Autodeclarado por el usuario en el paso 1 del formulario. */
  hasPrerequisite: boolean;
  credlyUrl?: string;
  status: EnrollmentStatus;
  reviewNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  canvasBatch?: number;
  /**
   * Cuántas veces un administrador ha marcado esta inscripción como
   * `needs_correction`. Se usa como número de revisión en la clave de
   * idempotencia de correos (`EMAIL#<cohorte>#<tipo>#<revision>`), para que
   * un segundo rechazo con un motivo distinto sí dispare un nuevo correo.
   */
  correctionCount?: number;
}

export interface CompletedCourse {
  email: string;
  courseId: string;
  completedAt: string;
  source: string;
}

export type EmailType = "confirmation" | "needs_correction" | "enrolled";

export interface EmailLogEntry {
  email: string;
  cohortId: string;
  type: EmailType;
  revision: number;
  sentAt: string;
  result: "sent" | "failed";
}
