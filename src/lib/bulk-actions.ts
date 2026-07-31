import { setEnrollmentStatus } from "@/lib/db/enrollments";
import { sendEnrolledEmail } from "@/lib/email/send";
import { sendInBatches, BatchItemResult } from "@/lib/email/batch";
import { getEntryCourse } from "@/config/courses";

/**
 * Marca en bloque un conjunto de inscripciones como `enrolled` y envía el
 * correo de matrícula. El número de lote de Canvas es obligatorio: sin él
 * no se puede completar la acción, para garantizar que el correo nunca
 * salga antes de que la carga en Canvas haya ocurrido.
 *
 * Segura de reintentar: `sendEnrolledEmail` es idempotente (revisa el
 * registro de correos antes de enviar), así que repetir esta acción sobre
 * el mismo conjunto de correos no reenvía a quienes ya lo recibieron.
 */
export async function bulkMarkEnrolled(params: {
  emails: string[];
  cohortId: string;
  canvasBatch: number;
  reviewedBy: string;
}): Promise<BatchItemResult<string>[]> {
  return sendInBatches(params.emails, async (email) => {
    const enrollment = await setEnrollmentStatus(email, params.cohortId, {
      status: "enrolled",
      canvasBatch: params.canvasBatch,
      reviewedBy: params.reviewedBy,
    });
    return sendEnrolledEmail(enrollment);
  });
}

/**
 * Al cerrar la ventana de inscripción, reasigna a Cloud Foundations todas
 * las inscripciones que quedaron en `needs_correction` (regla de negocio:
 * quien no corrigió su URL de Credly a tiempo se matricula en el curso de
 * entrada). No dispara ningún correo adicional: el correo de corrección ya
 * advirtió esta consecuencia.
 */
export async function reassignUncorrectedToEntryCourse(params: {
  emails: string[];
  cohortId: string;
  reviewedBy: string;
}): Promise<BatchItemResult<string>[]> {
  const entryCourseId = getEntryCourse().id;
  return sendInBatches(params.emails, async (email) => {
    await setEnrollmentStatus(email, params.cohortId, {
      status: "approved",
      courseId: entryCourseId,
      reviewedBy: params.reviewedBy,
      reviewNote:
        "Reasignado automáticamente a AWS Academy Cloud Foundations: la ventana de inscripción cerró sin una URL de Credly válida.",
    });
    return "skipped";
  });
}
