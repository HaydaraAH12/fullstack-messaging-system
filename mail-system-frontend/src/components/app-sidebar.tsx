"use client";

import { LogoutButton } from "@/components/logout-button";
import { MessageSquare, User, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getDirection } from "@/components/locale-direction-sync";
import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const mailPaths = ["/inbox", "/drafts", "/sent", "/trash", "/archive"] as const;

export function AppSidebar() {
  const locale = useLocale() as Locale;
  const dir = getDirection(locale);
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();

  const mainNavItems = [
    {
      href: "/profile" as const,
      label: t("profile"),
      icon: User,
      isActive: pathname.startsWith("/profile"),
    },
    {
      href: "/inbox" as const,
      label: t("messages"),
      icon: MessageSquare,
      isActive: mailPaths.some((p) => pathname.startsWith(p)),
    },
    {
      href: "/users" as const,
      label: t("users"),
      icon: Users,
      isActive: pathname.startsWith("/users"),
    },
  ];

  return (
    <Sidebar
      collapsible="icon"
      side={locale === "ar" ? "right" : "left"}
      dir={dir}
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link
          href="/inbox"
          className="flex items-center gap-2 font-semibold text-sidebar-foreground"
        >
          <MessageSquare className="size-5 shrink-0" />
          <span className="truncate group-data-[collapsible=icon]:hidden">
            {tCommon("appName")}
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("mainMenu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map(({ href, label, icon: Icon, isActive }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    render={<Link href={href} />}
                    isActive={isActive}
                    tooltip={label}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
