import type { ParsedDeviceMeta } from '../types/client-meta.type';

/** Lightweight UA parsing for session listings (no external dependency). */
export function parseUserAgent(userAgent?: string): ParsedDeviceMeta {
  if (!userAgent) return {};
  const ua = userAgent;
  let browser: string | undefined;
  let os: string | undefined;

  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua)) browser = 'Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Safari\//i.test(ua)) browser = 'Safari';

  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iOS/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return { browser, os, rawUserAgent: ua };
}
