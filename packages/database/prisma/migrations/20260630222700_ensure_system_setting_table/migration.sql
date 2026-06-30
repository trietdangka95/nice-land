-- Ensure the SystemSetting table exists.
-- The table was missing from the initial migration and the ALTER TABLE
-- migration (20260630153000) may have been recorded without creating it.
CREATE TABLE IF NOT EXISTS "SystemSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "bankId" TEXT,
    "bankAccount" TEXT,
    "bankAccountName" TEXT,
    "supportZaloPhone" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- Ensure the supportZaloPhone column exists (in case only the base table was created)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'SystemSetting' AND column_name = 'supportZaloPhone'
    ) THEN
        ALTER TABLE "SystemSetting" ADD COLUMN "supportZaloPhone" TEXT;
    END IF;
END $$;
