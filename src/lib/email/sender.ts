import { EmailSender } from "./types";
import { GmailEmailSender } from "./gmail-sender";

/**
 * Único punto donde se elige la implementación de envío de correo.
 * Cambiar a Amazon SES más adelante es reemplazar esta línea por una
 * implementación `SesEmailSender` que cumpla la misma interfaz.
 */
export const emailSender: EmailSender = new GmailEmailSender();
