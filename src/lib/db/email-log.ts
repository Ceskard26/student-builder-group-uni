import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_NAME } from "@/lib/dynamodb";
import { userPk, emailSk } from "@/lib/db/keys";
import { EmailType } from "@/types/enrollment";

/**
 * Registro de correos enviados. La clave (email, cohortId, type, revision)
 * es la garantía de idempotencia: si ya existe un envío exitoso con esa
 * clave, no se debe volver a enviar.
 */

export async function wasEmailSent(
  email: string,
  cohortId: string,
  type: EmailType,
  revision: number,
): Promise<boolean> {
  const res = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: userPk(email), SK: emailSk(cohortId, type, revision) },
    }),
  );
  return res.Item?.result === "sent";
}

export async function recordEmailResult(
  email: string,
  cohortId: string,
  type: EmailType,
  revision: number,
  result: "sent" | "failed",
): Promise<void> {
  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: userPk(email),
        SK: emailSk(cohortId, type, revision),
        type: "EMAIL_LOG",
        email: email.toLowerCase(),
        cohortId,
        emailType: type,
        revision,
        sentAt: new Date().toISOString(),
        result,
      },
    }),
  );
}
