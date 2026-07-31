"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { currentCohortId } from "@/lib/db/keys";
import { setEnrollmentStatus, listEnrollments } from "@/lib/db/enrollments";
import { sendNeedsCorrectionEmail } from "@/lib/email/send";
import {
  bulkMarkEnrolled,
  reassignUncorrectedToEntryCourse,
} from "@/lib/bulk-actions";

async function requireAdminEmail(): Promise<string> {
  const session = await auth();
  const email = session?.user?.email;
  if (!isAdminEmail(email)) {
    throw new Error("No autorizado.");
  }
  return email as string;
}

export async function approveAction(formData: FormData) {
  const adminEmail = await requireAdminEmail();
  const email = String(formData.get("email"));
  await setEnrollmentStatus(email, currentCohortId(), {
    status: "approved",
    reviewedBy: adminEmail,
  });
  revalidatePath("/admin");
}

/** Marca `needs_correction` y dispara el correo correspondiente (idempotente). */
export async function needsCorrectionAction(formData: FormData) {
  const adminEmail = await requireAdminEmail();
  const email = String(formData.get("email"));
  const reviewNote = String(formData.get("reviewNote") ?? "").trim();
  if (!reviewNote) {
    throw new Error("Escribe un motivo para la corrección.");
  }

  const updated = await setEnrollmentStatus(email, currentCohortId(), {
    status: "needs_correction",
    reviewNote,
    reviewedBy: adminEmail,
  });

  await sendNeedsCorrectionEmail(updated).catch(() => {});
  revalidatePath("/admin");
}

/**
 * El número de lote de Canvas es obligatorio: sin él no se completa la
 * acción, para que el correo de matrícula nunca salga antes de la carga
 * real en Canvas.
 */
export async function bulkEnrollAction(formData: FormData) {
  const adminEmail = await requireAdminEmail();
  const emails = formData.getAll("selectedEmails").map(String);
  const canvasBatchRaw = formData.get("canvasBatch");
  const canvasBatch = Number(canvasBatchRaw);

  if (emails.length === 0) {
    throw new Error("Selecciona al menos una inscripción.");
  }
  if (!canvasBatchRaw || Number.isNaN(canvasBatch)) {
    throw new Error("El número de lote de Canvas es obligatorio.");
  }

  await bulkMarkEnrolled({
    emails,
    cohortId: currentCohortId(),
    canvasBatch,
    reviewedBy: adminEmail,
  });
  revalidatePath("/admin");
}

export async function closeWindowReassignAction() {
  const adminEmail = await requireAdminEmail();
  const cohortId = currentCohortId();
  const stuck = await listEnrollments({ cohortId, status: "needs_correction" });

  await reassignUncorrectedToEntryCourse({
    emails: stuck.map((e) => e.email),
    cohortId,
    reviewedBy: adminEmail,
  });
  revalidatePath("/admin");
}
