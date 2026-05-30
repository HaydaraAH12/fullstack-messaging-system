import type { MessageFolder, RecipientType } from "./enums";

export type MailMessageFolder = MessageFolder;

export type MailRecipientType = RecipientType;

export interface MailMessageAttachment {
  id: string;
  filename: string;
  mimeType: string;
}

export interface MailMessageSenderDto {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface MailMessageRecipientDto {
  id: string;
  recipientType: MailRecipientType;
  recipient: MailMessageSenderDto;
}

export interface MailMessageReplyDto {
  id: string;
  subject: string;
  body: string;
  sentAt: string | null;
  createdAt: string;
  sender: MailMessageSenderDto;
}

export interface MailFolderMessage {
  id: string;
  senderId: string;
  parentMessageId: string | null;
  subject: string;
  body: string;
  status: string;
  isDraft: boolean;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;

  sender: MailMessageSenderDto;
  attachments: MailMessageAttachment[];
  _count: { replies: number };

  folder: MailMessageFolder;
  isRead: boolean;
  isStarred: boolean;
  recipientType: MailRecipientType;

  /**
   * Not present in current backend schema.
   * Kept optional so UI can render a "pin" icon without breaking types later.
   */
  isPinned?: boolean;
}

export interface MailMessageDetails extends MailFolderMessage {
  recipients: MailMessageRecipientDto[];
  replies: MailMessageReplyDto[];
}

export interface MailSidebarItem {
  id: string;
  key: string;
  name: string;
  icon: string;
  folder: string | null;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  count: number;
  unreadCount?: number;
}

export interface MailSidebarResponse {
  items: MailSidebarItem[];
}

export interface SendMessageRecipientInput {
  email: string;
  type?: RecipientType;
}

/** Matches backend `SendMessageDto` (POST /messages). */
export interface SendMessageRequest {
  subject: string;
  body: string;
  recipients: SendMessageRecipientInput[];
  parentMessageId?: string;
}
