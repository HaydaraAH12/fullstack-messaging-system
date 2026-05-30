import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
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
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private readonly fromAddress: string;
  private readonly inboxUrl: string | null;
  private readonly transporter: Transporter | null;

  constructor(private readonly config: ConfigService) {
    this.fromAddress =
      this.config.get<string>('MAIL_FROM') ??
      this.config.get<string>('SMTP_USER') ??
      'no-reply@mail-system.local';
    this.inboxUrl = this.buildInboxUrl();
    this.transporter = this.createTransporter();
  }

  async onModuleInit(): Promise<void> {
    if (!this.transporter) return;

    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified — outbound email is enabled');
    } catch (error) {
      this.logger.error(
        'SMTP verify failed. Check Gmail App Password and .env values.',
        error instanceof Error ? error.stack : String(error),
      );
    }
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

    this.logger.log(
      `SMTP enabled (${host}:${port}, secure=${secure}, user=${user})`,
    );

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      // Gmail / most providers on port 587 expect STARTTLS
      ...(port === 587 && !secure ? { requireTLS: true } : {}),
    });
  }

  private buildInboxUrl(): string | null {
    const frontend = this.config.get<string>('FRONTEND_URL')?.replace(/\/$/, '');
    if (!frontend) return null;
    return `${frontend}/inbox`;
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
      this.inboxUrl
        ? `Open your inbox: ${this.inboxUrl}`
        : 'Open your inbox in the app to reply.',
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
      <p>${
        this.inboxUrl
          ? `<a href="${this.inboxUrl}">Open your inbox</a> to reply.`
          : 'Open your inbox in the app to reply.'
      }</p>
    `;
  }
}
