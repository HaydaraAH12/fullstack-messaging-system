import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessageFolder, MessageStatus, RecipientType } from '@prisma/client';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesGateway } from './messages.gateway';
import { MailService } from '../mail/mail.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messagesGateway: MessagesGateway,
    private readonly mailService: MailService,
  ) {}

  async sendMessage(senderId: string, dto: SendMessageDto) {
    if (dto.parentMessageId) {
      const parent = await this.prisma.message.findUnique({
        where: { id: dto.parentMessageId },
      });
      if (!parent) throw new NotFoundException('Parent message not found');
    }

    const recipientIds = dto.recipients.map((r) => r.userId);
    if (recipientIds.includes(senderId)) {
      throw new BadRequestException('Cannot send a message to yourself');
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: recipientIds } },
      select: { id: true, email: true, fullName: true },
    });
    if (users.length !== recipientIds.length) {
      throw new NotFoundException('One or more recipients not found');
    }

    const message = await this.prisma.$transaction(async (tx: any) => {
      const msg = await tx.message.create({
        data: {
          senderId,
          subject: dto.subject,
          body: dto.body,
          status: MessageStatus.SENT,
          isDraft: false,
          sentAt: new Date(),
          parentMessageId: dto.parentMessageId ?? null,
        },
      });

      await tx.messageRecipient.create({
        data: {
          messageId: msg.id,
          recipientId: senderId,
          recipientType: RecipientType.TO,
          folder: MessageFolder.SENT,
          isRead: true,
        },
      });

      await tx.messageRecipient.createMany({
        data: dto.recipients.map((r) => ({
          messageId: msg.id,
          recipientId: r.userId,
          recipientType: r.type ?? RecipientType.TO,
          folder: MessageFolder.INBOX,
        })),
      });

      const notifiableRecipients = dto.recipients.filter(
        (r) => r.type !== RecipientType.BCC,
      );
      await tx.notification.createMany({
        data: notifiableRecipients.map((r) => ({
          userId: r.userId,
          messageId: msg.id,
          type: 'NEW_MESSAGE',
          title: `New message: ${dto.subject}`,
          body: dto.body.substring(0, 120),
        })),
      });

      return msg;
    });

    for (const uid of recipientIds) {
      const row = await this.findInboxListRow(message.id, uid);
      if (row) {
        try {
          this.messagesGateway.emitInboxNew(
            uid,
            row as Record<string, unknown>,
          );
        } catch {
          /* do not fail HTTP send */
        }
      }
    }

    await this.mailService.sendNewMessageEmails({
      messageId: message.id,
      subject: dto.subject,
      body: dto.body,
      senderName: await this.resolveSenderName(senderId),
      recipients: users.map((u) => ({
        userId: u.id,
        email: u.email,
        fullName: u.fullName,
      })),
    });

    return this.findMessageById(message.id, senderId);
  }

  private async resolveSenderName(senderId: string): Promise<string> {
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
      select: { fullName: true, username: true },
    });
    return sender?.fullName ?? sender?.username ?? 'A user';
  }

  async getFolder(userId: string, folder: MessageFolder) {
    const recipients = await this.prisma.messageRecipient.findMany({
      where: {
        recipientId: userId,
        folder,
        deletedAt: null,
      },
      orderBy: { message: { sentAt: 'desc' } },
      include: this.folderListInclude(),
    });

    return recipients.map((r) => this.mapFolderListRow(r));
  }

  async findInboxListRow(messageId: string, userId: string) {
    const r = await this.prisma.messageRecipient.findFirst({
      where: {
        messageId,
        recipientId: userId,
        folder: MessageFolder.INBOX,
        deletedAt: null,
      },
      include: this.folderListInclude(),
    });
    if (!r) return null;
    return this.mapFolderListRow(r);
  }

  private folderListInclude() {
    return {
      message: {
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          attachments: {
            select: { id: true, filename: true, mimeType: true },
          },
          _count: { select: { replies: true } },
        },
      },
    };
  }

  private mapFolderListRow(r: {
    folder: MessageFolder;
    isRead: boolean;
    isStarred: boolean;
    recipientType: RecipientType;
    message: Record<string, unknown>;
  }) {
    return {
      ...r.message,
      folder: r.folder,
      isRead: r.isRead,
      isStarred: r.isStarred,
      recipientType: r.recipientType,
    };
  }

  async findMessageById(messageId: string, userId: string) {
    const recipient = await this.prisma.messageRecipient.findFirst({
      where: {
        messageId,
        recipientId: userId,
        deletedAt: null,
        folder: { not: MessageFolder.TRASH },
      },
    });
    if (!recipient) throw new NotFoundException('Message not found');
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: { id: true, username: true, fullName: true, avatarUrl: true },
        },
        recipients: {
          where: { deletedAt: null },
          include: {
            recipient: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        attachments: true,
        replies: {
          orderBy: { sentAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!message) throw new NotFoundException('Message not found');

    const isParticipant = message.senderId === userId || recipient !== null;
    if (!isParticipant) throw new ForbiddenException('Access denied');

    if (recipient && !recipient.isRead) {
      await this.prisma.messageRecipient.update({
        where: { id: recipient.id },
        data: { isRead: true, readAt: new Date() },
      });
    }

    return message;
  }

  async moveToTrash(messageId: string, userId: string) {
    const recipient = await this.getRecipientOrThrow(messageId, userId);

    return this.prisma.messageRecipient.update({
      where: { id: recipient.id },
      data: { folder: MessageFolder.TRASH, deletedAt: null },
    });
  }

  async archiveMessage(messageId: string, userId: string) {
    const recipient = await this.getRecipientOrThrow(messageId, userId);

    return this.prisma.messageRecipient.update({
      where: { id: recipient.id },
      data: { folder: MessageFolder.ARCHIVE, deletedAt: null },
    });
  }

  async toggleStar(messageId: string, userId: string) {
    const recipient = await this.getRecipientOrThrow(messageId, userId);

    return this.prisma.messageRecipient.update({
      where: { id: recipient.id },
      data: { isStarred: !recipient.isStarred },
    });
  }

  async getThread(messageId: string, userId: string) {
    const root = await this.findMessageById(messageId, userId);
    return root;
  }

  private async getRecipientOrThrow(messageId: string, userId: string) {
    const recipient = await this.prisma.messageRecipient.findFirst({
      where: { messageId, recipientId: userId },
    });
    if (!recipient) throw new ForbiddenException('Access denied');
    return recipient;
  }
}
