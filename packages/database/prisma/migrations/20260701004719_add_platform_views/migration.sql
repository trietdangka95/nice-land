CREATE TABLE "platform_views" (
    "id" TEXT NOT NULL,
    "visitor_hash" VARCHAR(64) NOT NULL,
    "user_agent" TEXT NOT NULL,
    "referrer" TEXT,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_views_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "platform_views_viewed_at_idx" ON "platform_views"("viewed_at");
CREATE INDEX "platform_views_visitor_hash_viewed_at_idx" ON "platform_views"("visitor_hash", "viewed_at");

