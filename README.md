# Sitio web — AWS Student Builder Group UNI

Sitio del AWS Student Builder Group de la Universidad Nacional de Ingeniería
(UNI). La mayor parte del sitio es pública; la única sección con
autenticación es el registro a AWS Academy, restringido a cuentas de Google
institucionales (`@uni.pe`).

## Stack

- Next.js (App Router) + TypeScript
- Auth.js (NextAuth v5) con proveedor Google
- DynamoDB (tabla única, modo on-demand) vía AWS SDK v3
- nodemailer sobre Gmail SMTP (App Password)
- Tailwind CSS
- Despliegue en AWS Amplify Hosting (SSR)

No se usa RDS, Cognito, API Gateway, SQS, Prisma ni ningún ORM.

## Diseño y marca

El sitio usa los assets oficiales del brand kit de AWS Student Builder Group
(carpeta `01- Creative Assets...` que no forma parte del repo desplegado):

- **Colores** (`tailwind.config.ts`): fondo `bg` (`#161D26`) y acento
  `accent`/`brand-amber` (`#FF9900`), más `brand-blue`, `brand-purple`,
  `brand-magenta`, `brand-mint` extraídos de los SVG del kit.
- **Tipografías** (`src/app/fonts/`, cargadas en `src/app/layout.tsx` con
  `next/font/local`): Amazon Ember Display para texto (`font-sans`) y Amazon
  Ember Mono para títulos, nav y botones (`font-mono`).
- **Iconos** (`src/components/icons/`): 11 pictogramas del kit, extraídos e
  inlineados como paths con `fill="currentColor"` para poder recolorearlos
  por CSS. El export original del kit tenía los nombres de archivo
  desalineados de su forma real (varias formas repetidas/rotadas entre
  íconos); `scripts/extract-icons.py` documenta el mapeo verificado
  manualmente. Si se reemplazan los assets fuente, hay que volver a
  verificar visualmente antes de regenerar.
- **Logo** (`public/brand/program-icon-*.svg`): el "Program Icon" del kit,
  usado tal cual (sin recolorear ni estirar) como logo en el header y el
  hero de inicio.
- **Animaciones**: CSS puro (keyframes en `tailwind.config.ts` +
  `src/components/reveal.tsx` para scroll-reveal con
  `IntersectionObserver`). Respetan `prefers-reduced-motion` (ver
  `globals.css`).

## Estructura relevante

```
src/
  auth.ts                     Configuración de Auth.js + validación de dominio
  config/courses.ts           Catálogo de cursos (editar aquí para agregar/quitar cursos)
  config/events.ts            Próximos eventos (enlazan a Meetup)
  config/notices.ts           Avisos públicos
  lib/enrollment-window.ts    Cálculo de la ventana de inscripción (America/Lima)
  lib/db/                     Acceso a DynamoDB (enrollments, completions, email-log)
  lib/email/                  Envío de correo (interfaz + implementación Gmail + plantillas)
  app/aws-academy/            Sección autenticada de registro
  app/admin/                  Panel de administración
```

## Variables de entorno

Copia `.env.example` a `.env.local` (desarrollo) y define las mismas
variables en Amplify (producción).

| Variable | Descripción |
|---|---|
| `AUTH_SECRET` | Secreto de Auth.js. Genera uno con `npx auth secret`. |
| `AUTH_URL` | URL pública del sitio (sin slash final). |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Credenciales OAuth de Google Cloud Console. |
| `ALLOWED_EMAIL_DOMAIN` | Dominio institucional permitido (`uni.pe`). |
| `AWS_REGION` | Región de DynamoDB. |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Solo necesarias en local; en Amplify se usa el rol de servicio. |
| `DYNAMODB_TABLE_NAME` | Nombre de la tabla única. |
| `ENROLLMENT_OPEN_AT` / `ENROLLMENT_CLOSE_AT` | Ventana de inscripción, ISO con offset `-05:00`. |
| `COHORT_ID` | Identificador de la cohorte activa (se usa en las claves de DynamoDB). |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Cuenta y App Password de Gmail para SMTP. |
| `MAIL_FROM` | Remitente que verán los destinatarios. |
| `MAIL_CONTACT` | Correo de contacto mostrado en el correo de matrícula. |
| `ADMIN_EMAILS` | Lista de correos con acceso a `/admin`, separados por comas. |

## Configurar Google Cloud Console (OAuth)

1. Entra a [Google Cloud Console](https://console.cloud.google.com/) y crea
   o selecciona un proyecto.
2. Ve a **APIs & Services → OAuth consent screen**.
   - Si el dominio `uni.pe` está en Google Workspace, elige tipo de usuario
     **Internal**: Google restringirá el login a ese dominio incluso antes
     de llegar a tu app (capa adicional, no sustituye la validación
     server-side que ya hace este proyecto). Si no es Workspace, usa
     **External** y añade el dominio a la pantalla de consentimiento.
3. Ve a **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Tipo de aplicación: **Web application**.
   - **Authorized redirect URIs**, agrega:
     - `http://localhost:3000/api/auth/callback/google` (desarrollo)
     - `https://TU_DOMINIO_DE_PRODUCCION/api/auth/callback/google` (Amplify)
4. Copia el **Client ID** y **Client secret** en `AUTH_GOOGLE_ID` y
   `AUTH_GOOGLE_SECRET`.

La restricción real de dominio ocurre en el callback `signIn` de
[`src/auth.ts`](src/auth.ts): cualquier cuenta que no termine en
`@${ALLOWED_EMAIL_DOMAIN}` es rechazada ahí, en el servidor, sin importar
qué configuración tenga la pantalla de Google.

## Crear la tabla de DynamoDB

```bash
aws dynamodb create-table \
  --table-name sbg-uni-main \
  --attribute-definitions \
      AttributeName=PK,AttributeType=S \
      AttributeName=SK,AttributeType=S \
      AttributeName=gsi1pk,AttributeType=S \
      AttributeName=gsi1sk,AttributeType=S \
  --key-schema \
      AttributeName=PK,KeyType=HASH \
      AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes '[
    {
      "IndexName": "StatusCreatedAtIndex",
      "KeySchema": [
        {"AttributeName":"gsi1pk","KeyType":"HASH"},
        {"AttributeName":"gsi1sk","KeyType":"RANGE"}
      ],
      "Projection": {"ProjectionType":"ALL"}
    }
  ]'
```

El nombre de la tabla debe coincidir con `DYNAMODB_TABLE_NAME`. El índice
`StatusCreatedAtIndex` es el que usa el panel de administración para
filtrar por estado (`gsi1pk`) y ordenar por fecha de creación (`gsi1sk`).

### Activar Point-in-Time Recovery (PITR)

```bash
aws dynamodb update-continuous-backups \
  --table-name sbg-uni-main \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

### Restaurar a un punto en el tiempo

La restauración crea una **tabla nueva** (no sobreescribe la original):

```bash
aws dynamodb restore-table-to-point-in-time \
  --source-table-name sbg-uni-main \
  --target-table-name sbg-uni-main-restaurada \
  --restore-date-time 2026-09-10T12:00:00Z
```

Después de restaurar, recrea el GSI `StatusCreatedAtIndex` en la tabla
restaurada (los GSI no se restauran automáticamente) y, si vas a usarla
como reemplazo, actualiza `DYNAMODB_TABLE_NAME` para apuntar a ella.

## Desplegar en AWS Amplify Hosting

1. Sube el proyecto a un repositorio Git (GitHub, GitLab, CodeCommit o
   Bitbucket).
2. En la consola de **AWS Amplify → Host web app**, conecta el
   repositorio y la rama a desplegar. Amplify detecta automáticamente que
   es una app Next.js con SSR (App Router).
3. Si necesitas especificar el build manualmente, usa un `amplify.yml`
   como este en la raíz del proyecto:

   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

4. En **App settings → Environment variables**, define todas las variables
   listadas arriba con sus valores de producción. Nunca subas `.env.local`
   al repositorio.
5. Da permisos de DynamoDB al rol de cómputo SSR de Amplify (Amplify crea
   un rol de servicio para la app): adjúntale una política que permita
   `dynamodb:GetItem`, `PutItem`, `UpdateItem` y `Query` sobre la tabla y
   sus índices (`arn:aws:dynamodb:REGION:ACCOUNT_ID:table/sbg-uni-main` y
   `.../index/*`).
6. Actualiza `AUTH_URL` con el dominio real de Amplify (o tu dominio
   personalizado) y añade ese mismo dominio como *Authorized redirect URI*
   en Google Cloud Console (paso anterior).
7. Guarda y despliega. Verifica que `/aws-academy` bloquee correos fuera
   de `@uni.pe` y que `/admin` solo sea accesible para los correos en
   `ADMIN_EMAILS`.

## Notas de mantenimiento

- **Catálogo de cursos**: editar únicamente
  [`src/config/courses.ts`](src/config/courses.ts).
- **Eventos y avisos**: editar
  [`src/config/events.ts`](src/config/events.ts) y
  [`src/config/notices.ts`](src/config/notices.ts). Los eventos enlazan a
  Meetup, no lo reemplazan.
- **Cambiar de Gmail SMTP a Amazon SES**: implementar una clase que cumpla
  la interfaz `EmailSender` (`src/lib/email/types.ts`) y reemplazar la
  instancia exportada en [`src/lib/email/sender.ts`](src/lib/email/sender.ts).
  El resto del código (plantillas, idempotencia, envío en lotes) no
  cambia.
- **Nueva cohorte**: actualizar `COHORT_ID`, `ENROLLMENT_OPEN_AT` y
  `ENROLLMENT_CLOSE_AT` en las variables de entorno. Al ser un nuevo valor
  de `COHORT_ID`, las inscripciones de la cohorte anterior quedan intactas
  en la tabla (claves `ENROLLMENT#<cohorte-anterior>`).
