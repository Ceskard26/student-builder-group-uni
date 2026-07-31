import { formatLimaDate, getEnrollmentWindow } from "@/lib/enrollment-window";
import { getCourseById } from "@/config/courses";
import { Enrollment } from "@/types/enrollment";

function courseName(courseId: string): string {
  return getCourseById(courseId)?.name ?? courseId;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wrapHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es">
  <body style="font-family: Arial, Helvetica, sans-serif; background:#161D26; color:#f5f6f7; padding:24px; margin:0;">
    <div style="max-width:560px;margin:0 auto;">
      <h2 style="color:#FF9900;margin-top:0;">${escapeHtml(title)}</h2>
      ${bodyHtml}
      <p style="margin-top:32px;font-size:12px;color:#9aa0a6;">AWS Student Builder Group — Universidad Nacional de Ingeniería (UNI)</p>
    </div>
  </body>
</html>`;
}

export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

export function confirmationEmailContent(enrollment: Enrollment): EmailContent {
  const { closeAt } = getEnrollmentWindow();
  const closeDate = formatLimaDate(closeAt);
  const course = courseName(enrollment.courseId);
  const subject = "Recibimos tu inscripción a AWS Academy";

  const text = `Hola ${enrollment.fullName},

Registramos tu solicitud de inscripción al curso "${course}" de AWS Academy.

Tu solicitud está siendo validada. Te avisaremos por este medio el resultado.

Puedes modificar tu inscripción hasta el ${closeDate} desde la sección "AWS Academy" del sitio, iniciando sesión con tu cuenta institucional.

— AWS Student Builder Group UNI`;

  const html = wrapHtml("Recibimos tu inscripción a AWS Academy", `
    <p>Hola ${escapeHtml(enrollment.fullName)},</p>
    <p>Registramos tu solicitud de inscripción al curso <strong>${escapeHtml(course)}</strong> de AWS Academy.</p>
    <p>Tu solicitud está siendo validada. Te avisaremos por este medio el resultado.</p>
    <p>Puedes modificar tu inscripción hasta el <strong>${escapeHtml(closeDate)}</strong> desde la sección "AWS Academy" del sitio, iniciando sesión con tu cuenta institucional.</p>
  `);

  return { subject, text, html };
}

export function needsCorrectionEmailContent(enrollment: Enrollment): EmailContent {
  const { closeAt } = getEnrollmentWindow();
  const closeDate = formatLimaDate(closeAt);
  const reason = enrollment.reviewNote?.trim() || "No se pudo validar la información enviada.";
  const subject = "Necesitamos corregir tu inscripción a AWS Academy";

  const text = `Hola ${enrollment.fullName},

No pudimos validar tu URL de Credly para la inscripción a AWS Academy. Motivo indicado por el equipo organizador:

"${reason}"

IMPORTANTE: si no envías una URL de Credly válida antes del ${closeDate}, serás inscrito automáticamente en AWS Academy Cloud Foundations.

Si nunca llevaste AWS Academy Cloud Foundations ni tienes la certificación AWS Certified Cloud Practitioner, no necesitas hacer nada: de todas formas serás matriculado en Cloud Foundations.

Para corregir tu inscripción, inicia sesión en la sección "AWS Academy" del sitio con tu cuenta institucional.

— AWS Student Builder Group UNI`;

  const html = wrapHtml("Necesitamos corregir tu inscripción a AWS Academy", `
    <p>Hola ${escapeHtml(enrollment.fullName)},</p>
    <p>No pudimos validar tu URL de Credly para la inscripción a AWS Academy. Motivo indicado por el equipo organizador:</p>
    <blockquote style="border-left:3px solid #FF9900;padding-left:12px;margin-left:0;color:#f5f6f7;">${escapeHtml(reason)}</blockquote>
    <p style="color:#FF9900;"><strong>Importante:</strong> si no envías una URL de Credly válida antes del <strong>${escapeHtml(closeDate)}</strong>, serás inscrito automáticamente en AWS Academy Cloud Foundations.</p>
    <p>Si nunca llevaste AWS Academy Cloud Foundations ni tienes la certificación AWS Certified Cloud Practitioner, no necesitas hacer nada: de todas formas serás matriculado en Cloud Foundations.</p>
    <p>Para corregir tu inscripción, inicia sesión en la sección "AWS Academy" del sitio con tu cuenta institucional.</p>
  `);

  return { subject, text, html };
}

export function enrolledEmailContent(enrollment: Enrollment): EmailContent {
  const course = courseName(enrollment.courseId);
  const contact = process.env.MAIL_CONTACT ?? "";
  const subject = `Ya estás matriculado en ${course}`;

  const text = `Hola ${enrollment.fullName},

Tu matrícula en "${course}" de AWS Academy ya está hecha.

En los próximos días llegará un correo separado de AWS Academy o Instructure con el acceso a la plataforma Canvas.

IMPORTANTE: revisa tu carpeta de spam/promociones. Si no te llega en 48 horas, escribe a ${contact}.

— AWS Student Builder Group UNI`;

  const html = wrapHtml(`Ya estás matriculado en ${course}`, `
    <p>Hola ${escapeHtml(enrollment.fullName)},</p>
    <p>Tu matrícula en <strong>${escapeHtml(course)}</strong> de AWS Academy ya está hecha.</p>
    <p>En los próximos días llegará un correo separado de AWS Academy o Instructure con el acceso a la plataforma Canvas.</p>
    <p style="color:#FF9900;"><strong>Importante:</strong> revisa tu carpeta de spam/promociones. Si no te llega en 48 horas, escribe a ${escapeHtml(contact)}.</p>
  `);

  return { subject, text, html };
}
