# Implementation Plan: Image Optimization

## Architecture Decisions

- Optimize before S3 upload to reduce storage and bandwidth immediately.
- Keep Next Image as the public delivery optimizer.
- Use progressive enhancement so older browsers retain the current upload behavior.

## Tasks

- [x] Add unit tests for dimensions, naming, and fallback.
- [x] Implement browser resize and WebP conversion.
- [x] Integrate optimized files into the property upload flow.
- [x] Enable responsive Next Image delivery for controlled property media.
- [x] Verify tests, typecheck, build, and checklist.

## Risks

- Browser Canvas may be unavailable or reject malformed images; fall back to the original file.
- Cross-origin display images are not processed; only local files selected by the admin are converted.
