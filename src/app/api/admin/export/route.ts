import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { currentCohortId } from "@/lib/db/keys";
import { listEnrollments } from "@/lib/db/enrollments";
import { getCourseById } from "@/config/courses";
import { EnrollmentStatus, ENROLLMENT_STATUSES } from "@/types/enrollment";

const BATCH_SIZE = 100;

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * CSV agrupado por curso: una fila por lote de hasta 100 correos, con los
 * correos separados por comas en un solo campo, lista para pegar en Canvas.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const status = ENROLLMENT_STATUSES.includes(statusParam as EnrollmentStatus)
    ? (statusParam as EnrollmentStatus)
    : undefined;
  const courseId = searchParams.get("courseId") ?? undefined;

  const cohortId = currentCohortId();
  const enrollments = await listEnrollments({ cohortId, status, courseId });

  const emailsByCourse = new Map<string, string[]>();
  for (const e of enrollments) {
    const list = emailsByCourse.get(e.courseId) ?? [];
    list.push(e.email);
    emailsByCourse.set(e.courseId, list);
  }

  const rows: string[] = ["courseId,courseName,batch,emails"];
  for (const [cId, emails] of emailsByCourse) {
    const courseName = getCourseById(cId)?.name ?? cId;
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = Math.floor(i / BATCH_SIZE) + 1;
      const batchEmails = emails.slice(i, i + BATCH_SIZE).join(",");
      rows.push(
        [csvEscape(cId), csvEscape(courseName), String(batch), csvEscape(batchEmails)].join(","),
      );
    }
  }

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="aws-academy-inscripciones.csv"',
    },
  });
}
