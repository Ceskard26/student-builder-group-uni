import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_NAME, STATUS_INDEX_NAME } from "@/lib/dynamodb";
import { userPk, enrollmentSk } from "@/lib/db/keys";
import {
  Enrollment,
  EnrollmentStatus,
  ENROLLMENT_STATUSES,
} from "@/types/enrollment";

function toItem(e: Enrollment) {
  return {
    PK: userPk(e.email),
    SK: enrollmentSk(e.cohortId),
    type: "ENROLLMENT",
    ...e,
    email: e.email.toLowerCase(),
    // Atributos de la GSI del panel de administración.
    gsi1pk: e.status,
    gsi1sk: e.createdAt,
  };
}

function fromItem(item: Record<string, unknown>): Enrollment {
  const {
    PK: _PK,
    SK: _SK,
    type: _type,
    gsi1pk: _gsi1pk,
    gsi1sk: _gsi1sk,
    ...rest
  } = item;
  return rest as unknown as Enrollment;
}

export async function getEnrollment(
  email: string,
  cohortId: string,
): Promise<Enrollment | null> {
  const res = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: userPk(email), SK: enrollmentSk(cohortId) },
    }),
  );
  return res.Item ? fromItem(res.Item) : null;
}

/**
 * Crea la inscripción. Falla si el correo ya tiene una inscripción para esta
 * cohorte, para garantizar la regla de "una sola inscripción por correo".
 */
export async function createEnrollment(
  input: Omit<Enrollment, "createdAt" | "updatedAt" | "status"> & {
    status?: EnrollmentStatus;
  },
): Promise<Enrollment> {
  const now = new Date().toISOString();
  const enrollment: Enrollment = {
    ...input,
    email: input.email.toLowerCase(),
    status: input.status ?? "submitted",
    createdAt: now,
    updatedAt: now,
  };

  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: toItem(enrollment),
      ConditionExpression: "attribute_not_exists(PK)",
    }),
  );

  return enrollment;
}

/**
 * El estudiante modifica su elección de curso mientras la ventana está
 * abierta. Esto NO dispara un nuevo correo de confirmación (la confirmación
 * solo se envía al crear la inscripción).
 *
 * El estado vuelve a `submitted` porque cualquier cambio de curso o de URL
 * de Credly invalida la revisión anterior del administrador: la inscripción
 * debe volver a la cola de revisión.
 */
export async function updateEnrollmentCourse(
  email: string,
  cohortId: string,
  updates: {
    courseId: string;
    hasPrerequisite: boolean;
    credlyUrl?: string;
  },
): Promise<void> {
  const now = new Date().toISOString();
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: userPk(email), SK: enrollmentSk(cohortId) },
      UpdateExpression:
        "SET courseId = :courseId, hasPrerequisite = :hasPrerequisite, credlyUrl = :credlyUrl, updatedAt = :updatedAt, #status = :status, gsi1pk = :status, gsi1sk = :now",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":courseId": updates.courseId,
        ":hasPrerequisite": updates.hasPrerequisite,
        ":credlyUrl": updates.credlyUrl ?? null,
        ":updatedAt": now,
        ":now": now,
        ":status": "submitted",
      },
    }),
  );
}

export async function setEnrollmentStatus(
  email: string,
  cohortId: string,
  fields: {
    status: EnrollmentStatus;
    reviewNote?: string;
    reviewedBy?: string;
    canvasBatch?: number;
    courseId?: string;
  },
): Promise<Enrollment> {
  const now = new Date().toISOString();
  const names: Record<string, string> = { "#status": "status" };
  const values: Record<string, unknown> = {
    ":status": fields.status,
    ":updatedAt": now,
    ":gsi1pk": fields.status,
    ":gsi1sk": now,
  };
  let expr =
    "SET #status = :status, updatedAt = :updatedAt, gsi1pk = :gsi1pk, gsi1sk = :gsi1sk";

  if (fields.reviewNote !== undefined) {
    expr += ", reviewNote = :reviewNote";
    values[":reviewNote"] = fields.reviewNote;
  }
  if (fields.reviewedBy !== undefined) {
    expr += ", reviewedBy = :reviewedBy, reviewedAt = :reviewedAt";
    values[":reviewedBy"] = fields.reviewedBy;
    values[":reviewedAt"] = now;
  }
  if (fields.canvasBatch !== undefined) {
    expr += ", canvasBatch = :canvasBatch";
    values[":canvasBatch"] = fields.canvasBatch;
  }
  if (fields.courseId !== undefined) {
    expr += ", courseId = :courseId";
    values[":courseId"] = fields.courseId;
  }
  if (fields.status === "needs_correction") {
    // Cuenta cuántas veces se ha rechazado, para usarla como número de
    // revisión en la clave de idempotencia del correo de corrección.
    expr += ", correctionCount = if_not_exists(correctionCount, :zero) + :one";
    values[":zero"] = 0;
    values[":one"] = 1;
  }

  const res = await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: userPk(email), SK: enrollmentSk(cohortId) },
      UpdateExpression: expr,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    }),
  );
  return fromItem(res.Attributes!);
}

async function queryByStatus(
  status: EnrollmentStatus,
  cohortId: string,
): Promise<Enrollment[]> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: STATUS_INDEX_NAME,
      KeyConditionExpression: "gsi1pk = :status",
      ExpressionAttributeValues: { ":status": status },
    }),
  );
  return (res.Items ?? [])
    .map((item) => fromItem(item))
    .filter((e) => e.cohortId === cohortId);
}

/**
 * Lista inscripciones de la cohorte actual, opcionalmente filtradas por
 * estado y/o curso. Usado por el panel de administración.
 */
export async function listEnrollments(params: {
  cohortId: string;
  status?: EnrollmentStatus;
  courseId?: string;
}): Promise<Enrollment[]> {
  const statuses = params.status ? [params.status] : ENROLLMENT_STATUSES;
  const results = await Promise.all(
    statuses.map((s) => queryByStatus(s, params.cohortId)),
  );
  let items = results.flat();
  if (params.courseId) {
    items = items.filter((e) => e.courseId === params.courseId);
  }
  items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return items;
}
