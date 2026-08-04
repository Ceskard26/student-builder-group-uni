import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// DYNAMODB_ENDPOINT solo debe existir en desarrollo local, para apuntar a
// DynamoDB Local (docker) en vez de a la tabla real de AWS. En Amplify no
// se define esta variable, así que el cliente usa el endpoint real de AWS.
//
// SBG_AWS_ACCESS_KEY_ID / SBG_AWS_SECRET_ACCESS_KEY: el runtime SSR de
// Amplify Hosting no expone de forma confiable las credenciales del rol de
// servicio de la app (el SDK falla con "Could not load credentials from
// any providers"). Como respaldo, se usa un usuario IAM dedicado con
// permisos limitados solo a esta tabla. Si en algún momento Amplify
// resuelve esto, estas variables pueden simplemente no definirse y el SDK
// vuelve a usar el rol de servicio automáticamente.
const explicitCredentials =
  process.env.SBG_AWS_ACCESS_KEY_ID && process.env.SBG_AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.SBG_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.SBG_AWS_SECRET_ACCESS_KEY,
      }
    : undefined;

const client = new DynamoDBClient({
  // Amplify no permite variables de entorno custom que empiecen con "AWS_"
  // (prefijo reservado), por eso SBG_AWS_REGION en vez de AWS_REGION_OVERRIDE.
  region: process.env.SBG_AWS_REGION ?? process.env.AWS_REGION ?? "us-east-1",
  ...(explicitCredentials ? { credentials: explicitCredentials } : {}),
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
