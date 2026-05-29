-- Harden sessions for refresh rotation, reuse detection, and device metadata
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "family_id" TEXT;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "revoked_at" TIMESTAMP(3);
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "last_used_at" TIMESTAMP(3);
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "family_started_at" TIMESTAMP(3);
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3);

UPDATE "sessions" SET
  "family_id" = COALESCE("family_id", "id"),
  "family_started_at" = COALESCE("family_started_at", "created_at"),
  "updated_at" = COALESCE("updated_at", "created_at")
WHERE "family_id" IS NULL OR "family_started_at" IS NULL OR "updated_at" IS NULL;

ALTER TABLE "sessions" ALTER COLUMN "family_id" SET NOT NULL;
ALTER TABLE "sessions" ALTER COLUMN "family_started_at" SET NOT NULL;
ALTER TABLE "sessions" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "sessions" RENAME COLUMN "device_info" TO "user_agent";

CREATE UNIQUE INDEX IF NOT EXISTS "sessions_token_hash_key" ON "sessions"("token_hash");
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions"("user_id");
CREATE INDEX IF NOT EXISTS "sessions_family_id_idx" ON "sessions"("family_id");
