-- AlterTable
ALTER TABLE "Log"
ALTER COLUMN "headers" TYPE JSONB USING headers::jsonb,
ALTER COLUMN "body" TYPE JSONB USING body::jsonb,
ALTER COLUMN "response" TYPE JSONB USING response::jsonb;
