"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { MailSidebarItemRow } from "@/components/mail-sidebar-item";
import { getDirection } from "@/components/locale-direction-sync";
import { useApiMutation } from "@/hooks/use-api";
import { useMailSidebarQuery } from "@/hooks/use-mail-sidebar-query";
import { mailSidebarQueryKey, moveMailSidebarItem } from "@/lib/api/mail-sidebar";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";
import { SidebarMoveDirection } from "@/types/mail";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";

export function MailSidebar() {
  const locale = useLocale() as Locale;
  const dir = getDirection(locale);
  const t = useTranslations("mail");
  const queryClient = useQueryClient();

  const { data, isLoading, failed, isFetching, retry } = useMailSidebarQuery();

  const moveItem = useApiMutation({
    mutationFn: ({
      id,
      direction,
    }: {
      id: string;
      direction: SidebarMoveDirection;
    }) => moveMailSidebarItem(id, direction),
    onSuccess: (nextData) => {
      queryClient.setQueryData(mailSidebarQueryKey, nextData);
    },
  });

  const items = data?.items ?? [];

  return (
    <aside
      dir={dir}
      className="flex w-56 shrink-0 flex-col border-inline-end border-sidebar-border bg-sidebar"
    >
      <SidebarGroup className="p-2">
        <SidebarGroupLabel>{t("section")}</SidebarGroupLabel>
        <SidebarGroupContent>
          {isLoading ? (
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <SidebarMenuSkeleton key={i} showIcon />
              ))}
            </div>
          ) : failed ? (
            <div className="space-y-2 px-2 py-3">
              <p className="text-xs text-destructive">{t("loadError")}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 w-full text-xs"
                disabled={isFetching}
                onClick={retry}
              >
                {t("retry")}
              </Button>
            </div>
          ) : (
            <SidebarMenu>
              {items.map((item, index) => (
                <MailSidebarItemRow
                  key={item.id}
                  item={item}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                  isMoving={moveItem.isPending}
                  onMoveUp={() =>
                    moveItem.mutate({
                      id: item.id,
                      direction: SidebarMoveDirection.UP,
                    })
                  }
                  onMoveDown={() =>
                    moveItem.mutate({
                      id: item.id,
                      direction: SidebarMoveDirection.DOWN,
                    })
                  }
                />
              ))}
            </SidebarMenu>
          )}
        </SidebarGroupContent>
      </SidebarGroup>
    </aside>
  );
}
