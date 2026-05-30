import { apiClient } from "@/lib/api";
import type {
  MailMessageDetails,
  MailFolderMessage,
  MailMessageFolder,
  SendMessageRequest,
} from "@/types/mail";

export function sendMessage(body: SendMessageRequest) {
  return apiClient.post<MailMessageDetails>("/messages", body);
}

export function getMessagesByFolder(folder: MailMessageFolder) {
  return apiClient.get<MailFolderMessage[]>(
    `/messages?folder=${encodeURIComponent(folder)}`,
  );
}

// Backend marks message as read when fetching it via GET /messages/:id.
export function markMessageAsRead(messageId: string) {
  return apiClient.get<unknown>(`/messages/${messageId}`);
}

export function getMessageDetails(messageId: string) {
  return apiClient.get<MailMessageDetails>(`/messages/${messageId}`);
}

// Backend toggles star: PATCH /messages/:id/star
export function toggleMessageStar(messageId: string) {
  return apiClient.patch<unknown>(`/messages/${messageId}/star`, undefined);
}

export function moveMessageToTrash(messageId: string) {
  return apiClient.delete<unknown>(`/messages/${messageId}`);
}

export function archiveMessage(messageId: string) {
  return apiClient.patch<unknown>(`/messages/${messageId}/archive`, undefined);
}

