import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { currentCohortId } from "@/lib/db/keys";
import { listEnrollments } from "@/lib/db/enrollments";
import { COURSES, getCourseById } from "@/config/courses";
import { STATUS_LABELS } from "@/config/status-labels";
import { ENROLLMENT_STATUSES, EnrollmentStatus } from "@/types/enrollment";
import {
  approveAction,
  needsCorrectionAction,
  bulkEnrollAction,
  closeWindowReassignAction,
} from "./actions";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { status?: string; courseId?: string };
}) {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-mono text-2xl text-accent">Acceso restringido</h1>
        <p className="mt-4 text-neutral-300">
          Esta sección solo está disponible para administradores del grupo.
        </p>
      </div>
    );
  }

  const cohortId = currentCohortId();
  const statusFilter = ENROLLMENT_STATUSES.includes(
    searchParams.status as EnrollmentStatus,
  )
    ? (searchParams.status as EnrollmentStatus)
    : undefined;
  const courseFilter = searchParams.courseId || undefined;

  const enrollments = await listEnrollments({
    cohortId,
    status: statusFilter,
    courseId: courseFilter,
  });

  const exportParams = new URLSearchParams();
  if (statusFilter) exportParams.set("status", statusFilter);
  if (courseFilter) exportParams.set("courseId", courseFilter);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-6 font-mono text-2xl font-semibold text-accent">
        Panel de administración — AWS Academy
      </h1>

      {/* Formulario "fantasma": no envuelve la tabla, pero las casillas y el
          botón de matrícula en bloque se asocian a él mediante el atributo
          form="bulk-form", evitando anidar <form> dentro de la tabla. */}
      <form
        id="bulk-form"
        action={bulkEnrollAction}
        className="mb-6 flex flex-wrap items-end gap-3 border border-white/10 bg-white/5 p-4"
      >
        <div>
          <label className="block font-mono text-xs text-neutral-400">
            N.° de lote de Canvas
          </label>
          <input
            type="number"
            name="canvasBatch"
            required
            className="w-40 border border-white/20 bg-transparent px-2 py-1 text-sm text-white"
          />
        </div>
        <button
          type="submit"
          className="border border-accent px-4 py-2 font-mono text-xs text-accent hover:bg-accent hover:text-bg"
        >
          Marcar seleccionados como matriculados
        </button>
        <span className="text-xs text-neutral-500">
          Marca las casillas de las filas que quieres matricular y escribe el
          lote de Canvas antes de enviar.
        </span>
      </form>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form method="get" className="flex flex-wrap gap-3">
          <select
            name="status"
            defaultValue={statusFilter ?? ""}
            className="border border-white/20 bg-bg px-2 py-1 text-sm text-white"
          >
            <option value="">Todos los estados</option>
            {ENROLLMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            name="courseId"
            defaultValue={courseFilter ?? ""}
            className="border border-white/20 bg-bg px-2 py-1 text-sm text-white"
          >
            <option value="">Todos los cursos</option>
            {COURSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="border border-white/20 px-4 py-1 text-sm text-neutral-200 hover:border-white/40"
          >
            Filtrar
          </button>
        </form>

        <a
          href={`/api/admin/export?${exportParams.toString()}`}
          className="ml-auto border border-accent px-4 py-1 font-mono text-xs text-accent hover:bg-accent hover:text-bg"
        >
          Exportar CSV
        </a>
      </div>

      <form action={closeWindowReassignAction} className="mb-6">
        <button
          type="submit"
          className="border border-white/20 px-4 py-2 text-xs text-neutral-300 hover:border-white/40"
        >
          Cerrar ventana: reasignar &quot;needs_correction&quot; pendientes a
          Cloud Foundations
        </button>
      </form>

      <div className="overflow-x-auto border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase text-neutral-400">
            <tr>
              <th className="p-2"></th>
              <th className="p-2">Nombre</th>
              <th className="p-2">Código</th>
              <th className="p-2">Correo</th>
              <th className="p-2">Curso</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Credly</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e.email} className="border-t border-white/10 align-top">
                <td className="p-2">
                  <input
                    type="checkbox"
                    name="selectedEmails"
                    value={e.email}
                    form="bulk-form"
                  />
                </td>
                <td className="p-2">{e.fullName}</td>
                <td className="p-2">{e.studentCode}</td>
                <td className="p-2">{e.email}</td>
                <td className="p-2">{getCourseById(e.courseId)?.name ?? e.courseId}</td>
                <td className="p-2">
                  {STATUS_LABELS[e.status]}
                  {e.canvasBatch !== undefined ? ` (lote ${e.canvasBatch})` : ""}
                </td>
                <td className="p-2">
                  {e.credlyUrl ? (
                    <a
                      href={e.credlyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline"
                    >
                      Ver credencial
                    </a>
                  ) : (
                    <span className="text-neutral-500">—</span>
                  )}
                </td>
                <td className="p-2">
                  <form className="flex flex-col gap-1">
                    <input type="hidden" name="email" value={e.email} />
                    <input
                      type="text"
                      name="reviewNote"
                      defaultValue={e.reviewNote ?? ""}
                      placeholder="Motivo de corrección"
                      className="w-48 border border-white/20 bg-transparent px-2 py-1 text-xs text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        formAction={approveAction}
                        className="border border-accent px-2 py-1 text-xs text-accent hover:bg-accent hover:text-bg"
                      >
                        Aprobar
                      </button>
                      <button
                        formAction={needsCorrectionAction}
                        className="border border-white/20 px-2 py-1 text-xs text-neutral-300 hover:border-white/40"
                      >
                        Necesita corrección
                      </button>
                    </div>
                  </form>
                </td>
              </tr>
            ))}
            {enrollments.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-neutral-500">
                  No hay inscripciones con estos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
