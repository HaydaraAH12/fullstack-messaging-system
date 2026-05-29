"use client";

import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@/i18n/navigation";

export function HeaderUser() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const displayName = user.fullName ?? user.username ?? user.email;

  return (
    <Link
      href="/profile"
      className="rounded-full outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      title={displayName}
      aria-label={displayName}
    >
      <UserAvatar user={user} showActiveIndicator className="size-8" />
    </Link>
  );
}
