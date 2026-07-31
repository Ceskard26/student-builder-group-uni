import { auth } from "@/auth";
import { currentCohortId } from "@/lib/db/keys";
import { getEnrollment } from "@/lib/db/enrollments";
import {
  getWindowState,
  getEnrollmentWindow,
  formatLimaDate,
} from "@/lib/enrollment-window";
import { AwsAcademySection } from "@/components/enrollment/aws-academy-section";

export default async function AwsAcademyPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-mono text-2xl font-semibold text-accent">
          AWS Academy
        </h1>
        <p className="mt-4 text-neutral-300">
          Inicia sesión con tu cuenta institucional (@uni.pe) para ver el
          registro a AWS Academy.
        </p>
      </div>
    );
  }

  const cohortId = currentCohortId();
  const enrollment = await getEnrollment(email, cohortId);
  const windowState = getWindowState();
  const { openAt, closeAt } = getEnrollmentWindow();

  return (
    <AwsAcademySection
      enrollment={enrollment}
      windowState={windowState}
      openAtLabel={formatLimaDate(openAt)}
      closeAtLabel={formatLimaDate(closeAt)}
    />
  );
}
