# Spec: Archived Post Image Cleanup

## Policy

Archiving a property post is a soft delete for the post itself, but its image
metadata is removed in the same database transaction. The existing orphan
image job then removes the unreferenced S3 objects after a 24-hour grace
period.

## Why

- The archived post immediately stops consuming the tenant image quota.
- A failed S3 request cannot roll back or corrupt the archive transaction.
- The grace period protects uploads that have reached S3 but are still being
  completed by the API.
- S3 cleanup remains retryable and observable through the existing dry-run
  job.

## Success Criteria

- Archive uses tenant ID and optimistic version checks.
- Image metadata is deleted only when the post archive succeeds.
- Audit details record how many images were detached.
- S3 objects become discoverable by the orphan cleanup job.

