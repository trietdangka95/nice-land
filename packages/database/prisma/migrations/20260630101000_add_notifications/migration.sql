-- CreateEnum
CREATE TYPE "NotificationScope" AS ENUM ('TENANT_ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LEAD_CREATED', 'CONTACT_REQUEST_CREATED', 'RENEWAL_REQUEST_CREATED', 'RENEWAL_REQUEST_UPDATED');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "siteId" TEXT,
    "scope" "NotificationScope" NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "payload" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_scope_isRead_createdAt_idx" ON "Notification"("scope", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_siteId_scope_isRead_createdAt_idx" ON "Notification"("siteId", "scope", "isRead", "createdAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
