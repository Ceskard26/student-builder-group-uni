import { getCourseById } from "@/config/courses";
import { STATUS_LABELS } from "@/config/status-labels";
import { Enrollment, EnrollmentStatus } from "@/types/enrollment";
import { Icon } from "@/components/icons/icon";

const STATUS_STYLE: Record<
  EnrollmentStatus,
  { border: string; text: string; icon: "clock" | "key" | "wrench" | "trophy" }
> = {
  submitted: { border: "border-l-brand-blue", text: "text-brand-blue", icon: "clock" },
  under_review: { border: "border-l-brand-blue", text: "text-brand-blue", icon: "clock" },
  needs_correction: { border: "border-l-brand-magenta", text: "text-brand-magenta", icon: "wrench" },
  approved: { border: "border-l-brand-mint", text: "text-brand-mint", icon: "key" },
  enrolled: { border: "border-l-brand-amber", text: "text-brand-amber", icon: "trophy" },
};

export function EnrollmentStatusCard({ enrollment }: { enrollment: Enrollment }) {
  const course = getCourseById(enrollment.courseId);
  const style = STATUS_STYLE[enrollment.status];

  return (
    <div
      className={`space-y-4 border border-white/10 border-l-4 bg-white/5 p-6 transition-colors ${style.border}`}
    >
      <div className="flex items-center gap-3">
        <Icon name={style.icon} className={`h-6 w-6 ${style.text}`} />
        <div>
          <p className="font-mono text-xs uppercase text-neutral-400">Estado</p>
          <p className={`text-lg ${style.text}`}>{STATUS_LABELS[enrollment.status]}</p>
        </div>
      </div>

      <div>
        <p className="font-mono text-xs uppercase text-neutral-400">Curso</p>
        <p className="text-white">{course?.name ?? enrollment.courseId}</p>
      </div>

      {enrollment.status === "needs_correction" && enrollment.reviewNote && (
        <div className="border-l-2 border-brand-magenta pl-4">
          <p className="font-mono text-xs uppercase text-neutral-400">Motivo</p>
          <p className="text-neutral-200">{enrollment.reviewNote}</p>
        </div>
      )}

      {enrollment.status === "enrolled" && (
        <p className="text-sm text-neutral-300">
          Tu matrícula está confirmada. Revisa tu correo (incluida la carpeta
          de spam) para el acceso a Canvas.
        </p>
      )}

      <div className="border-t border-white/10 pt-4 text-xs text-neutral-500">
        <p>Nombre: {enrollment.fullName}</p>
        <p>Código de alumno: {enrollment.studentCode}</p>
        <p>Correo: {enrollment.email}</p>
      </div>
    </div>
  );
}
