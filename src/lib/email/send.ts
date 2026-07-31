import { emailSender } from "@/lib/email/sender";
import { wasEmailSent, recordEmailResult } from "@/lib/db/email-log";
import {
  confirmationEmailContent,
  needsCorrectionEmailContent,
  enrolledEmailContent,
} from "@/lib/email/templates";
import { Enrollment, EmailType } from "@/types/enrollment";

export type SendOutcome = "sent" | "skipped" | "failed";

async function sendIdempotent(
  email: string,
  cohortId: string,
  type: EmailType,
  revision: number,
  buildContent: () => { subject: string; text: string; html: string },
): Promise<SendOutcome> {
  const alreadySent = await wasEmailSent(email, cohortId, type, revision);
  if (alreadySent) {
    return "skipped";
  }

  const { subject, text, html } = buildContent();
  try {
    await emailSender.send({ to: email, subject, text, html });
    await recordEmailResult(email, cohortId, type, revision, "sent");
    return "sent";
  } catch (err) {
    await recordEmailResult(email, cohortId, type, revision, "failed");
    throw err;
  }
}

/** Se envía únicamente al crear la inscripción (revisión fija = 1). */
export function sendConfirmationEmail(enrollment: Enrollment): Promise<SendOutcome> {
  return sendIdempotent(
    enrollment.email,
    enrollment.cohortId,
    "confirmation",
    1,
    () => confirmationEmailContent(enrollment),
  );
}

/**
 * Se envía una vez por ciclo de revisión. `correctionCount` se incrementa
 * cada vez que un administrador marca `needs_correction`, así que un
 * segundo rechazo (con un motivo distinto) sí dispara un nuevo correo.
 */
export function sendNeedsCorrectionEmail(enrollment: Enrollment): Promise<SendOutcome> {
  const revision = enrollment.correctionCount ?? 1;
  return sendIdempotent(
    enrollment.email,
    enrollment.cohortId,
    "needs_correction",
    revision,
    () => needsCorrectionEmailContent(enrollment),
  );
}

/** Se envía una sola vez por usuario y cohorte (revisión fija = 1). */
export function sendEnrolledEmail(enrollment: Enrollment): Promise<SendOutcome> {
  return sendIdempotent(
    enrollment.email,
    enrollment.cohortId,
    "enrolled",
    1,
    () => enrolledEmailContent(enrollment),
  );
}
