"use client";

import { useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Palette,
  Highlighter,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TEXT_COLORS = ["#111827", "#1d4ed8", "#0f766e", "#dc2626", "#9333ea"];
const HIGHLIGHT_COLORS = ["#fde68a", "#bfdbfe", "#bbf7d0", "#fecaca", "#ddd6fe"];
const FONT_FAMILIES = [
  "Inter",
  "Arial",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Courier New",
  "Tahoma",
];

type Props = {
  onCancel?: () => void;
};

export function ComposeMailPanel({ onCancel }: Props) {
  const { user } = useAuth();
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [editorActive, setEditorActive] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: "<p></p>",
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] rounded-md border border-[var(--mail-list-panel-border)] bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
      },
    },
    immediatelyRender: false,
  });

  const fromValue = useMemo(() => user?.email ?? "", [user?.email]);

  const submitDisabled = !to.trim() || !subject.trim();

  return (
    <div className="flex h-full flex-col rounded-lg border border-[var(--mail-detail-panel-border)] bg-[var(--mail-detail-panel-bg)]">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">New mail</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" disabled={submitDisabled}>
            Send
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="space-y-3">
          <Input value={fromValue} readOnly placeholder="Sender" />
          <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="To" />
          <Input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="Cc" />
          <Input value={bcc} onChange={(e) => setBcc(e.target.value)} placeholder="Bcc" />
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
          />

          <div
            className="space-y-2"
            onMouseEnter={() => setEditorActive(true)}
            onMouseLeave={() => setEditorActive(false)}
          >
            <div
              className={cn(
                "flex flex-wrap items-center gap-1 rounded-md border border-[var(--mail-list-panel-border)] bg-[var(--mail-list-panel-bg)] p-1 transition-opacity",
                editorActive ? "opacity-100" : "opacity-55",
              )}
            >
              <label className="me-1 inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs">
                <span className="text-[var(--mail-muted-text)]">Font</span>
                <select
                  className="bg-transparent text-xs outline-none"
                  defaultValue="Inter"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "__default__") {
                      editor?.chain().focus().unsetFontFamily().run();
                      return;
                    }
                    editor?.chain().focus().setFontFamily(value).run();
                  }}
                >
                  <option value="__default__">Default</option>
                  {FONT_FAMILIES.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </label>

              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                aria-label="Bold"
                className={cn(editor?.isActive("bold") && "bg-muted")}
              >
                <Bold className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                aria-label="Italic"
                className={cn(editor?.isActive("italic") && "bg-muted")}
              >
                <Italic className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                aria-label="Underline"
                className={cn(editor?.isActive("underline") && "bg-muted")}
              >
                <UnderlineIcon className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                aria-label="Strike"
                className={cn(editor?.isActive("strike") && "bg-muted")}
              >
                <Strikethrough className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                aria-label="Bullet list"
                className={cn(editor?.isActive("bulletList") && "bg-muted")}
              >
                <List className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                aria-label="Ordered list"
                className={cn(editor?.isActive("orderedList") && "bg-muted")}
              >
                <ListOrdered className="size-3.5" />
              </Button>

              <span className="mx-1 h-5 w-px bg-border" />

              <div className="flex items-center gap-1 px-1">
                <Palette className="size-3.5 text-muted-foreground" />
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="size-4 rounded-full border border-border"
                    style={{ backgroundColor: color }}
                    onClick={() => editor?.chain().focus().setColor(color).run()}
                    aria-label={`Text color ${color}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1 px-1">
                <Highlighter className="size-3.5 text-muted-foreground" />
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="size-4 rounded-sm border border-border"
                    style={{ backgroundColor: color }}
                    onClick={() => editor?.chain().focus().setHighlight({ color }).run()}
                    aria-label={`Highlight color ${color}`}
                  />
                ))}
              </div>
            </div>

            <div onFocusCapture={() => setEditorActive(true)}>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

