"use client";

import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, usePathname } from "@/i18n/navigation";
import type { AppPath } from "@/lib/auth-routes";
import { getMailSidebarHref, getMailSidebarIcon } from "@/lib/mail-sidebar";
import type { MailSidebarItem } from "@/types/mail";

type MailSidebarItemRowProps = {
  item: MailSidebarItem;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isMoving: boolean;
};

export function MailSidebarItemRow({
  item,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  isMoving,
}: MailSidebarItemRowProps) {
  const t = useTranslations("mail");
  const pathname = usePathname();
  const href = getMailSidebarHref(item);
  const Icon = getMailSidebarIcon(item);
  const isActive = href ? pathname === href : false;

  return (
    <SidebarMenuItem>
      {href ? (
        <SidebarMenuButton
          render={<Link href={href as AppPath} />}
          isActive={isActive}
        >
          <Icon />
          <span className="truncate">{item.name}</span>
        </SidebarMenuButton>
      ) : (
        <SidebarMenuButton disabled>
          <Icon />
          <span className="truncate">{item.name}</span>
        </SidebarMenuButton>
      )}

      {item.count > 0 && (
        <SidebarMenuBadge>{item.count}</SidebarMenuBadge>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuAction showOnHover disabled={isMoving}>
              <MoreHorizontal />
              <span className="sr-only">{t("quickActions")}</span>
            </SidebarMenuAction>
          }
        />
        <DropdownMenuContent align="end" side="bottom">
          <DropdownMenuItem disabled={isFirst || isMoving} onClick={onMoveUp}>
            <ArrowUp />
            {t("moveUp")}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isLast || isMoving} onClick={onMoveDown}>
            <ArrowDown />
            {t("moveDown")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
