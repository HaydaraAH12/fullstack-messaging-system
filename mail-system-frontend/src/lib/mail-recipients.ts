import type { RecipientType, SendMessageRecipientInput } from "@/types/mail";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseEmailList(raw: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of raw.split(/[,;]/)) {
    const email = part.trim().toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    result.push(email);
  }

  return result;
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function buildSendRecipients(input: {
  to: string[];
  cc: string[];
  bcc: string[];
}): SendMessageRecipientInput[] {
  const recipients: SendMessageRecipientInput[] = [];

  const append = (emails: string[], type: RecipientType) => {
    for (const email of emails) {
      recipients.push({ email, type });
    }
  };

  append(input.to, "TO");
  append(input.cc, "CC");
  append(input.bcc, "BCC");

  return recipients;
}
