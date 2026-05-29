import { apiClient } from "@/lib/api";
import type {
  MailSidebarResponse,
  SidebarMoveDirection,
} from "@/types/mail";

export const mailSidebarQueryKey = ["mail", "sidebar"] as const;

export function fetchMailSidebar() {
  return apiClient.get<MailSidebarResponse>("/messages/sidebar");
}

export function moveMailSidebarItem(
  id: string,
  direction: SidebarMoveDirection,
) {
  return apiClient.patch<MailSidebarResponse>(
    `/messages/sidebar/${id}/position`,
    { direction },
  );
}
