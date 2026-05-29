/** True when avatarUrl points to an image (not initials like "HA"). */
export function isAvatarImageUrl(avatarUrl: string | null | undefined): boolean {
  if (!avatarUrl?.trim()) return false;
  return (
    /^https?:\/\//i.test(avatarUrl) ||
    avatarUrl.startsWith("data:image") ||
    avatarUrl.startsWith("/")
  );
}

export function getInitialsFromFullName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) {
    return parts[0]!.charAt(0).toUpperCase();
  }
  const first = parts[0]!.charAt(0);
  const last = parts[parts.length - 1]!.charAt(0);
  return `${first}${last}`.toUpperCase();
}

export function getAvatarFallbackLabel(
  avatarUrl: string | null | undefined,
  fullName?: string | null,
): string {
  if (avatarUrl && !isAvatarImageUrl(avatarUrl)) {
    return avatarUrl.toUpperCase();
  }
  if (fullName?.trim()) {
    return getInitialsFromFullName(fullName);
  }
  return "?";
}
