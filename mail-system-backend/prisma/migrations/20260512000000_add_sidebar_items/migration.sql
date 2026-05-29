-- Sidebar catalog (order, icon, name). role_id NULL = visible to all roles.
CREATE TABLE "sidebar_items" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "folder" "message_folder",
    "position" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "role_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sidebar_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sidebar_items_key_key" ON "sidebar_items"("key");

ALTER TABLE "sidebar_items" ADD CONSTRAINT "sidebar_items_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "sidebar_items" ("id", "key", "name", "icon", "folder", "position", "is_active", "role_id", "created_at", "updated_at") VALUES
  ('a1000000-0000-4000-8000-000000000001', 'INBOX', 'Inbox', 'inbox', 'INBOX', 1, true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a1000000-0000-4000-8000-000000000002', 'DRAFT', 'Drafts', 'draft', 'DRAFT', 2, true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a1000000-0000-4000-8000-000000000003', 'SENT', 'Sent Items', 'send', 'SENT', 3, true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a1000000-0000-4000-8000-000000000004', 'TRASH', 'Deleted Items', 'trash', 'TRASH', 4, true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a1000000-0000-4000-8000-000000000005', 'ARCHIVE', 'Archive', 'archive', 'ARCHIVE', 5, true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
