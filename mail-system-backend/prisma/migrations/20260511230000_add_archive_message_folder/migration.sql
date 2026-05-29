ALTER TYPE "message_folder" ADD VALUE IF NOT EXISTS 'ARCHIVE';

UPDATE "message_recipients"
SET "deleted_at" = NULL
WHERE "folder" = 'TRASH';
