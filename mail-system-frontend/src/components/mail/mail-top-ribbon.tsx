"use client";

import { useState } from "react";
import {
  MailPlus,
  Reply,
  ReplyAll,
  Forward,
  Eye,
  PanelLeft,
  Columns2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/navigation";

type RibbonTab = "home" | "view" | "messages";

export function MailTopRibbon() {
  const router = useRouter();
  const [tab, setTab] = useState<RibbonTab>("home");

  const openComposer = () => {
    setTab("messages");
    router.push("/inbox?compose=1");
  };

  return (
    <div className="border-b border-[var(--mail-list-panel-border)] bg-[var(--mail-list-panel-bg)]">
      <div className="flex items-center gap-1 px-2 py-1.5">
        {[
          { key: "home", label: "Home" },
          { key: "view", label: "View" },
          { key: "messages", label: "Messages" },
        ].map((item) => (
          <Button
            key={item.key}
            type="button"
            size="sm"
            variant="ghost"
            className={cn("px-3", tab === item.key && "bg-muted text-foreground")}
            onClick={() => setTab(item.key as RibbonTab)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-[var(--mail-list-panel-border)] px-3 py-2">
        {tab === "home" ? (
          <>
            <Button size="sm" onClick={openComposer}>
              <MailPlus className="size-4" />
              New mail
            </Button>
            <div className="mx-1 h-6 w-px bg-border" />
            <Button size="sm" variant="outline" disabled>
              <Reply className="size-4" />
              Reply
            </Button>
            <Button size="sm" variant="outline" disabled>
              <ReplyAll className="size-4" />
              Reply all
            </Button>
            <Button size="sm" variant="outline" disabled>
              <Forward className="size-4" />
              Forward
            </Button>
          </>
        ) : null}

        {tab === "view" ? (
          <>
            <Button size="sm" variant="outline" disabled>
              <Columns2 className="size-4" />
              Reading pane
            </Button>
            <Button size="sm" variant="outline" disabled>
              <PanelLeft className="size-4" />
              Folder pane
            </Button>
            <Button size="sm" variant="outline" disabled>
              <Eye className="size-4" />
              Preview
            </Button>
          </>
        ) : null}

        {tab === "messages" ? (
          <>
            <Button size="sm" variant="outline" disabled>
              <MessageSquare className="size-4" />
              Conversation
            </Button>
            <Button size="sm" variant="outline" disabled>
              <Columns2 className="size-4" />
              Sort
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}

