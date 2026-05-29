export type {
  MailFolderMessage,
  MailMessageAttachment,
  MailMessageDetails,
  MailMessageFolder,
  MailMessageRecipientDto,
  MailMessageReplyDto,
  MailMessageSenderDto,
  MailRecipientType,
  MailSidebarItem,
  MailSidebarResponse,
  SendMessageRecipientInput,
  SendMessageRequest,
} from "@mail-system/shared";

export {
  MessageFolder,
  RecipientType,
  SidebarMoveDirection,
} from "@mail-system/shared";

/** @deprecated Use `SendMessageRequest` */
export type { SendMessageRequest as SendMailRequest } from "@mail-system/shared";
