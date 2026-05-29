import type { LucideIcon } from "lucide-react";
import {
  Archive,
  FilePenLine,
  Inbox,
  Mail,
  Send,
  Trash2,
} from "lucide-react";
import type { MailSidebarItem } from "@/types/mail";

const FOLDER_ROUTES: Record<string, string> = {
  INBOX: "/inbox",
  DRAFT: "/drafts",
  SENT: "/sent",
  TRASH: "/trash",
  ARCHIVE: "/archive",
};

const KEY_ROUTES: Record<string, string> = FOLDER_ROUTES;

const ICONS_BY_KEY: Record<string, LucideIcon> = {
  INBOX: Inbox,
  DRAFT: FilePenLine,
  SENT: Send,
  TRASH: Trash2,
  ARCHIVE: Archive,
};

export function getMailSidebarHref(item: MailSidebarItem): string | null {
  if (item.folder && FOLDER_ROUTES[item.folder]) {
    return FOLDER_ROUTES[item.folder];
  }
  if (KEY_ROUTES[item.key]) {
    return KEY_ROUTES[item.key];
  }
  return null;
}

export function getMailSidebarIcon(item: MailSidebarItem): LucideIcon {
  return ICONS_BY_KEY[item.key] ?? ICONS_BY_KEY[item.folder ?? ""] ?? Mail;
}
