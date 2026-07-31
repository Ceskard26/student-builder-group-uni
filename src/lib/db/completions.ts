import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_NAME } from "@/lib/dynamodb";
import { userPk, completedSk } from "@/lib/db/keys";
import { CompletedCourse } from "@/types/enrollment";

/**
 * Historial de cursos completados por correo, pensado para cohortes
 * futuras (por ejemplo, para verificar prerequisitos sin depender solo de
 * la autodeclaración + URL de Credly del formulario actual).
 */

export async function addCompletedCourse(
  entry: Omit<CompletedCourse, "completedAt"> & { completedAt?: string },
): Promise<void> {
  const completedAt = entry.completedAt ?? new Date().toISOString();
  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: userPk(entry.email),
        SK: completedSk(entry.courseId),
        type: "COMPLETED",
        email: entry.email.toLowerCase(),
        courseId: entry.courseId,
        completedAt,
        source: entry.source,
      },
    }),
  );
}

export async function listCompletedCourses(
  email: string,
): Promise<CompletedCourse[]> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk": userPk(email),
        ":prefix": "COMPLETED#",
      },
    }),
  );
  return (res.Items ?? []).map((item) => ({
    email: item.email,
    courseId: item.courseId,
    completedAt: item.completedAt,
    source: item.source,
  }));
}
