import nodemailer, { Transporter } from "nodemailer";
import { EmailMessage, EmailSender } from "./types";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

export class GmailEmailSender implements EmailSender {
  async send(message: EmailMessage): Promise<void> {
    await getTransporter().sendMail({
      from: process.env.MAIL_FROM,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  }
}
