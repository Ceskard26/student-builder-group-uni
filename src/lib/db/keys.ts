/**
 * Formato de claves de la tabla única de DynamoDB. Centralizado aquí para
 * que todos los repos (enrollments, completions, emailLog) usen exactamente
 * el mismo formato de PK/SK.
 */

export function userPk(email: string) {
  return `USER#${email.toLowerCase()}`;
}

export function enrollmentSk(cohortId: string) {
  return `ENROLLMENT#${cohortId}`;
}

export function completedSk(courseId: string) {
  return `COMPLETED#${courseId}`;
}

export function emailSk(cohortId: string, type: string, revision: number) {
  return `EMAIL#${cohortId}#${type}#${revision}`;
}

export function currentCohortId() {
  const cohort = process.env.COHORT_ID;
  if (!cohort) {
    throw new Error("Falta la variable de entorno COHORT_ID");
  }
  return cohort;
}
