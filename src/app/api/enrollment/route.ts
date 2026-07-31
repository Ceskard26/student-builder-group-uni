import { NextResponse } from "next/server";
import { auth, isAllowedInstitutionalEmail } from "@/auth";
import { isEnrollmentWindowOpen } from "@/lib/enrollment-window";
import { isValidCredlyUrl } from "@/lib/credly";
import { getEntryCourse, getSelectableCourses } from "@/config/courses";
import { currentCohortId } from "@/lib/db/keys";
import {
  createEnrollment,
  getEnrollment,
  updateEnrollmentCourse,
} from "@/lib/db/enrollments";
import { sendConfirmationEmail } from "@/lib/email/send";

/**
 * Crea o edita la inscripción del usuario autenticado a AWS Academy.
 *
 * Esta ruta hace su propia validación de sesión, dominio y ventana de
 * fechas — no depende de que el formulario del cliente se comporte bien,
 * porque un envío directo a esta API (sin pasar por el formulario) debe
 * fallar igual si el usuario no está autorizado o la ventana está cerrada.
 */
export async function POST(request: Request) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email || !isAllowedInstitutionalEmail(email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (!isEnrollmentWindowOpen()) {
    return NextResponse.json(
      { error: "La ventana de inscripción no está abierta." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Cuerpo de la solicitud inválido." }, { status: 400 });
  }

  const {
    fullName,
    studentCode,
    hasPrerequisite,
    credlyUrl,
    courseId: submittedCourseId,
    acceptedPrivacyNotice,
  } = body as Record<string, unknown>;

  if (typeof fullName !== "string" || fullName.trim().length < 3) {
    return NextResponse.json({ error: "Ingresa tu nombre completo." }, { status: 400 });
  }
  if (typeof studentCode !== "string" || studentCode.trim().length < 3) {
    return NextResponse.json({ error: "Ingresa tu código de alumno." }, { status: 400 });
  }
  if (typeof hasPrerequisite !== "boolean") {
    return NextResponse.json(
      { error: "Indica si ya completaste el prerequisito." },
      { status: 400 },
    );
  }
  if (acceptedPrivacyNotice !== true) {
    return NextResponse.json(
      { error: "Debes aceptar el aviso de privacidad." },
      { status: 400 },
    );
  }

  let courseId: string;
  let finalCredlyUrl: string | undefined;

  if (!hasPrerequisite) {
    // Curso de entrada obligatorio: el catálogo nunca se muestra en esta ruta.
    courseId = getEntryCourse().id;
    finalCredlyUrl = undefined;
  } else {
    if (typeof credlyUrl !== "string" || !isValidCredlyUrl(credlyUrl)) {
      return NextResponse.json(
        { error: "La URL de Credly no es válida." },
        { status: 400 },
      );
    }
    const selectable = getSelectableCourses();
    if (
      typeof submittedCourseId !== "string" ||
      !selectable.some((c) => c.id === submittedCourseId)
    ) {
      return NextResponse.json({ error: "Selecciona un curso válido." }, { status: 400 });
    }
    courseId = submittedCourseId;
    finalCredlyUrl = credlyUrl.trim();
  }

  const cohortId = currentCohortId();
  const existing = await getEnrollment(email, cohortId);

  if (!existing) {
    const enrollment = await createEnrollment({
      email,
      cohortId,
      fullName: fullName.trim(),
      studentCode: studentCode.trim(),
      courseId,
      hasPrerequisite,
      credlyUrl: finalCredlyUrl,
    });

    // Un error de correo no debe hacer fallar la inscripción; queda
    // registrado como "failed" en el log de correos para poder auditarlo.
    await sendConfirmationEmail(enrollment).catch(() => {});

    return NextResponse.json({ enrollment }, { status: 201 });
  }

  if (existing.status === "enrolled") {
    return NextResponse.json(
      { error: "Ya estás matriculado. No es posible modificar la inscripción." },
      { status: 409 },
    );
  }

  await updateEnrollmentCourse(email, cohortId, {
    courseId,
    hasPrerequisite,
    credlyUrl: finalCredlyUrl,
  });

  const updated = await getEnrollment(email, cohortId);
  return NextResponse.json({ enrollment: updated }, { status: 200 });
}
