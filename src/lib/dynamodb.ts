import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// DYNAMODB_ENDPOINT solo debe existir en desarrollo local, para apuntar a
// DynamoDB Local (docker) en vez de a la tabla real de AWS. En Amplify no
// se define esta variable, así que el cliente usa el endpoint real de AWS.
const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  ...(process.env.DYNAMODB_ENDPOINT
    ? { endpoint: process.env.DYNAMODB_ENDPOINT }
    : {}),
});

export const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME ?? "sbg-uni-main";

/**
 * GSI usada por el panel de administración: partición por `status`,
 * ordenamiento por `createdAt`. Ver README para el comando de creación.
 */
export const STATUS_INDEX_NAME = "StatusCreatedAtIndex";
