/** Mirrors `MessageFolder` in prisma/schema.prisma */
export const MessageFolder = {
  INBOX: "INBOX",
  SENT: "SENT",
  DRAFT: "DRAFT",
  TRASH: "TRASH",
  ARCHIVE: "ARCHIVE",
  STARRED: "STARRED",
} as const;

export type MessageFolder =
  (typeof MessageFolder)[keyof typeof MessageFolder];

/** Mirrors `RecipientType` in prisma/schema.prisma */
export const RecipientType = {
  TO: "TO",
  CC: "CC",
  BCC: "BCC",
} as const;

export type RecipientType =
  (typeof RecipientType)[keyof typeof RecipientType];

/** Mirrors `MessageStatus` in prisma/schema.prisma */
export const MessageStatus = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  SCHEDULED: "SCHEDULED",
  FAILED: "FAILED",
} as const;

export type MessageStatus =
  (typeof MessageStatus)[keyof typeof MessageStatus];

/** API contract for PATCH /messages/sidebar/:id/position */
export enum SidebarMoveDirection {
  UP = "up",
  DOWN = "down",
}
