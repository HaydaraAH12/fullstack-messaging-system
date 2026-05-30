"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { searchMailRecipients } from "@/lib/api/users";
import { isValidEmail } from "@/lib/mail-recipients";
import type { MailRecipientDirectoryEntry } from "@mail-system/shared";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  emails: string[];
  onChange: (emails: string[]) => void;
  disabled?: boolean;
};

export function RecipientField({ label, emails, onChange, disabled }: Props) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MailRecipientDirectoryEntry[]>(
    [],
  );
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = window.setTimeout(() => {
      setLoading(true);
      void searchMailRecipients(term)
        .then((rows) => {
          const selected = new Set(emails);
          setSuggestions(rows.filter((r) => !selected.has(r.email.toLowerCase())));
          setOpen(true);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, emails]);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const addEmail = (email: string) => {
    const normalized = email.trim().toLowerCase();
    if (!isValidEmail(normalized) || emails.includes(normalized)) return;
    onChange([...emails, normalized]);
    setQuery("");
    setOpen(false);
    setSuggestions([]);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "," || event.key === ";") {
      event.preventDefault();
      if (query.trim()) addEmail(query);
    }
    if (event.key === "Backspace" && !query && emails.length) {
      onChange(emails.slice(0, -1));
    }
  };

  return (
    <div ref={wrapRef} className="relative space-y-1">
      <label className="text-xs text-[var(--mail-muted-text)]">{label}</label>
      <div
        className={cn(
          "flex min-h-9 flex-wrap items-center gap-1 rounded-md border border-input bg-background px-2 py-1",
          disabled && "opacity-60",
        )}
      >
        {emails.map((email) => (
          <span
            key={email}
            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
          >
            {email}
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              disabled={disabled}
              onClick={() => onChange(emails.filter((e) => e !== email))}
              aria-label={`Remove ${email}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <Input
          value={query}
          disabled={disabled}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length && setOpen(true)}
          onKeyDown={onInputKeyDown}
          placeholder={emails.length ? "" : "Search name or email"}
          className="h-7 min-w-[140px] flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
          aria-autocomplete="list"
          aria-controls={listId}
        />
      </div>

      {open && (loading || suggestions.length > 0) && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-popover py-1 shadow-md"
        >
          {loading ? (
            <li className="px-3 py-2 text-xs text-muted-foreground">Searching…</li>
          ) : (
            suggestions.map((item) => (
              <li key={item.email} role="option">
                <button
                  type="button"
                  className="flex w-full flex-col items-start px-3 py-2 text-start text-sm hover:bg-muted"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addEmail(item.email)}
                >
                  <span className="font-medium">{item.fullName}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.email}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
