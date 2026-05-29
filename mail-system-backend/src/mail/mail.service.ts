import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

type MessageEmailRecipient = {
  userId: string;
  email: string;
  fullName: string;
};

type SendMessageEmailInput = {
  messageId: string;
  subject: string;
  body: string;
  senderName: string;
  recipients: MessageEmailRecipient[];
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly fromAddress: string;
  private readonly transporter: Transporter | null;

  constructor(private readonly config: ConfigService) {
    this.fromAddress =
      this.config.get<string>('MAIL_FROM') ?? 'no-reply@mail-system.local';
    this.transporter = this.createTransporter();
  }

  async sendNewMessageEmails(input: SendMessageEmailInput): Promise<void> {
    if (!this.transporter) return;

    for (const recipient of input.recipients) {
      try {
        const info = await this.transporter.sendMail({
          from: this.fromAddress,
          to: recipient.email,
          subject: `New message from ${input.senderName}: ${input.subject}`,
          text: this.buildTextBody(input, recipient),
          html: this.buildHtmlBody(input, recipient),
        });

        this.logger.log(
          `Email sent for message ${input.messageId} to ${recipient.email} (${info.messageId})`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send message email to ${recipient.email}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }

  private createTransporter(): Transporter | null {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const portRaw = this.config.get<string>('SMTP_PORT');
    const secureRaw = this.config.get<string>('SMTP_SECURE');

    if (!host || !user || !pass || !portRaw) {
      this.logger.warn(
        'SMTP config is incomplete. Email sending is disabled until SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS are set.',
      );
      return null;
    }

    const port = Number(portRaw);
    if (!Number.isFinite(port)) {
      this.logger.warn('SMTP_PORT is not a valid number. Email sending is disabled.');
      return null;
    }

    const secure = secureRaw ? secureRaw.toLowerCase() === 'true' : port === 465;

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  private buildTextBody(
    input: SendMessageEmailInput,
    recipient: MessageEmailRecipient,
  ): string {
    return [
      `Hi ${recipient.fullName},`,
      '',
      `You received a new message from ${input.senderName}.`,
      '',
      `Subject: ${input.subject}`,
      '',
      input.body,
      '',
      'Open your inbox to reply.',
    ].join('\n');
  }

  private buildHtmlBody(
    input: SendMessageEmailInput,
    recipient: MessageEmailRecipient,
  ): string {
    const escapedBody = input.body
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>');

    return `
      <p>Hi ${recipient.fullName},</p>
      <p>You received a new message from <strong>${input.senderName}</strong>.</p>
      <p><strong>Subject:</strong> ${input.subject}</p>
      <p>${escapedBody}</p>
      <p>Open your inbox to reply.</p>
    `;
  }
}
