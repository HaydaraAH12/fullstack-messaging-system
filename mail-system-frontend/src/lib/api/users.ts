import { apiClient } from "@/lib/api";
import type { MailRecipientDirectoryEntry } from "@mail-system/shared";

export function searchMailRecipients(query: string) {
  const q = query.trim();
  if (q.length < 2) {
    return Promise.resolve([] as MailRecipientDirectoryEntry[]);
  }
  return apiClient.get<MailRecipientDirectoryEntry[]>(
    `/users/directory/search?q=${encodeURIComponent(q)}`,
  );
}
