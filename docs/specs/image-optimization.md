# Spec: Image Optimization

## Objective

Reduce property image transfer size without changing the existing S3 upload flow or public theme behavior.

## Tech Stack

- Next.js 16 Image Optimization for delivery.
- Browser Canvas API for upload resize and WebP conversion.
- Existing presigned S3 PUT flow.

## Commands

- Web tests: `corepack pnpm --filter @nice-land/web test`
- Web typecheck: `corepack pnpm --filter @nice-land/web typecheck`
- Full build: `corepack pnpm build`

## Project Structure

- `apps/web/lib/image-optimization.ts`: client-side image normalization.
- `apps/web/tests/image-optimization.test.ts`: pure optimization contract tests.
- `apps/web/components/property-form.tsx`: upload integration and progress copy.
- `apps/web/next.config.ts`: remote image delivery policy.

## Code Style

```ts
const optimized = await optimizeImageForUpload(file);
await uploadToS3(optimized);
```

- Keep browser-specific logic behind one utility.
- Prefer named constants for dimensions and quality.
- Fall back to the original image when browser conversion is unavailable.

## Testing Strategy

- Unit-test dimension calculation, WebP naming, and fallback behavior.
- Run existing public theme and tenant tests.
- Verify production compilation through the monorepo build.

## Boundaries

- Always: preserve tenant isolation, image order, alt text, and S3 key ownership.
- Ask first: add a paid image CDN or server-side image processing service.
- Never: upload an image larger than the API limit after optimization or expose S3 credentials.

## Success Criteria

- JPEG, PNG, and WebP uploads are resized to at most 1920px on the longest edge.
- Optimized uploads use WebP at 82% quality when browser APIs support it.
- Unsupported conversion safely uploads the validated original file.
- Public and admin images use Next Image responsive delivery where applicable.
- Tests, typecheck, and monorepo build pass.

## Open Questions

- A dedicated thumbnail pipeline can be added later if original-resolution media becomes a product requirement.
