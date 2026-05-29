export function parseExpiresInSeconds(value: string): number {
  const match = /^(\d+)\s*([smhd])$/i.exec(value.trim());
  if (!match) return 15 * 60;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multiplier: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  return amount * (multiplier[unit] ?? 60);
}
