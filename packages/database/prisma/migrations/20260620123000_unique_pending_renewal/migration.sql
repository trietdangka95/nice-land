CREATE UNIQUE INDEX "RenewalRequest_one_pending_per_site"
ON "RenewalRequest" ("siteId")
WHERE "status" IN ('NEW', 'IN_PROGRESS');
