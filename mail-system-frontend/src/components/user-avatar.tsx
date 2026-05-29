"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  getAvatarFallbackLabel,
  isAvatarImageUrl,
} from "@/lib/avatar";
import type { User } from "@/types/auth";

type UserAvatarProps = {
  user: Pick<User, "avatarUrl" | "fullName" | "email">;
  className?: string;
  fallbackClassName?: string;
  showActiveIndicator?: boolean;
};

export function UserAvatar({
  user,
  className,
  fallbackClassName,
  showActiveIndicator = false,
}: UserAvatarProps) {
  const avatarUrl = user.avatarUrl;
  const imageSrc = isAvatarImageUrl(avatarUrl) ? avatarUrl! : undefined;
  const fallback = getAvatarFallbackLabel(
    avatarUrl,
    user.fullName ?? user.email,
  );

  return (
    <span className="relative inline-flex shrink-0">
      <Avatar className={cn("size-9", className)}>
        {imageSrc ? (
          <AvatarImage src={imageSrc} alt={user.fullName ?? user.email} />
        ) : null}
        <AvatarFallback
          className={cn(
            "bg-primary text-sm font-semibold text-primary-foreground",
            fallbackClassName,
          )}
        >
          {fallback}
        </AvatarFallback>
      </Avatar>
      {showActiveIndicator && (
        <span
          className="absolute end-0 bottom-0 size-2.5 rounded-full border-2 border-sidebar bg-emerald-500"
          title="Online"
          aria-hidden
        />
      )}
    </span>
  );
}
