-- CreateTable (missing from initial migration)
CREATE TABLE IF NOT EXISTS "SystemSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "bankId" TEXT,
    "bankAccount" TEXT,
    "bankAccountName" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- AddColumn
ALTER TABLE "SystemSetting"
ADD COLUMN IF NOT EXISTS "supportZaloPhone" TEXT;
