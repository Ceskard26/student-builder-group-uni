export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Interfaz de envío de correo. Toda la lógica de negocio (idempotencia,
 * plantillas, envío en lotes) depende solo de esta interfaz, nunca de
 * nodemailer directamente. Para migrar de Gmail SMTP a Amazon SES más
 * adelante basta con escribir una nueva implementación de `EmailSender` y
 * cambiar la instancia exportada en `sender.ts`.
 */
export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}
