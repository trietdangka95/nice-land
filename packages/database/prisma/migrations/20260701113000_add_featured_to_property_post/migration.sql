ALTER TABLE "PropertyPost"
ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "PropertyPost_siteId_featured_idx"
ON "PropertyPost"("siteId", "featured");
