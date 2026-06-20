# Nice Land Platform - Implementation Checklist

## Phase 0 - Project Setup

### Repository Setup

- [x] Create project repository.
- [x] Choose monorepo structure.
- [x] Setup TypeScript.
- [ ] Setup ESLint (current `lint` scripts run TypeScript checks only).
- [ ] Setup Prettier.
- [x] Setup Tailwind CSS.
- [x] Setup environment variables.
- [x] Add `.env.example`.
- [x] Add README with local setup instructions.

### Recommended Environment Variables

- [x] `DATABASE_URL`
- [x] `JWT_ACCESS_SECRET`
- [x] `NEXT_PUBLIC_APP_URL`
- [x] `NEXT_PUBLIC_ROOT_DOMAIN`
- [x] Storage provider configured as AWS S3.
- [x] `AWS_ACCESS_KEY_ID`
- [x] `AWS_SECRET_ACCESS_KEY`
- [x] `AWS_S3_BUCKET`
- [x] `AWS_S3_PUBLIC_URL`

---

## Phase 1 - Database & Prisma

### Prisma Setup

- [x] Install Prisma.
- [x] Initialize Prisma.
- [x] Connect PostgreSQL database.
- [x] Create initial Prisma schema.
- [x] Add database enums.
- [x] Add database indexes.
- [x] Run first migration.
- [x] Generate Prisma client.
- [x] Create seed script.

### Database Models

- [x] Create `Site` model.
- [x] Create `User` model.
- [x] Create `PropertyCategory` model.
- [x] Create `PropertyPost` model.
- [x] Create `PropertyImage` model.
- [x] Create `SubscriptionPlan` model.
- [x] Create `AuditLog` model.
- [x] Create `ContactRequest` model.
- [x] Add `UserRole` enum.
- [x] Add `PropertyType` enum.
- [x] Add `PostStatus` enum.

### Seed Data

- [x] Seed default super admin account.
- [x] Seed default subscription plans.
- [x] Seed demo tenant site.
- [x] Seed demo admin account.
- [x] Seed demo categories.
- [x] Seed demo property posts.

---

## Phase 2 - Tenant Resolution

### Hostname/Subdomain Detection

- [x] Create utility to parse hostname.
- [x] Detect root domain.
- [x] Detect tenant subdomain.
- [x] Support local development subdomains.
- [ ] Support fallback query param for local dev if needed.

### Backend Tenant Context

- [x] Create tenant resolver/pre-handler.
- [x] Find `Site` by slug or verified hostname.
- [x] Check `Site.isActive`.
- [x] Check `subscriptionStatus`.
- [x] Check `subscriptionEnd`.
- [x] Attach `siteId` to request context.
- [x] Return clear error if site does not exist.
- [x] Return clear error if site is inactive.
- [x] Return clear error if subscription expired.

### Security Validation

- [x] Ensure all tenant public APIs resolve current site.
- [x] Ensure all tenant admin APIs resolve current site.
- [x] Ensure tenant repositories scope queries by `siteId`.
- [x] Add tenant scope helper.
- [x] Add tests for cross-tenant access blocking.

---

## Phase 3 - Authentication & Authorization

### Auth Core

- [x] Create password hashing utility.
- [x] Create JWT signing utility.
- [x] Create JWT verification utility.
- [x] Create login API.
- [x] Create logout flow.
- [x] Create current user API.
- [x] Store role in JWT.
- [x] Store `siteId` in JWT for admin users.

### Role Authorization

- [x] Create `requireAuth` middleware.
- [x] Create `requireRole` middleware.
- [x] Protect Super Admin routes.
- [x] Protect Tenant Admin routes.
- [x] Block ADMIN when token `siteId` does not match resolved `siteId`.
- [x] Allow SUPER_ADMIN to operate all sites through Super Admin APIs.
- [x] Prevent GUEST from admin APIs.

### Login Pages

- [x] Build admin login page.
- [x] Build super admin login page.
- [x] Validate login input with shared Zod contract.
- [x] Add error handling.
- [x] Add redirect after login.
- [x] Add logout button.

### Password Recovery

- [x] Create forgot-password API.
- [x] Create one-time reset token with expiry.
- [x] Send password reset email through the configured Resend provider.
- [x] Build forgot-password page.
- [x] Build reset-password page.
- [x] Revoke existing sessions after password reset.

---

## Phase 4 - Landing Page

### Landing UI

- [x] Build hero section.
- [x] Build feature section.
- [x] Build how-it-works section.
- [x] Build pricing section.
- [x] Build demo websites section.
- [x] Build FAQ section.
- [x] Build contact CTA section.
- [x] Build footer.

### Contact Request

- [x] Create contact request form.
- [x] Validate name.
- [x] Validate phone.
- [x] Validate email.
- [x] Validate message.
- [x] Create `POST /v1/public/contact-requests`.
- [x] Save request to database.
- [x] Show success message.
- [x] Show error message.

---

## Phase 5 - Guest Website

### Site Config

- [x] Create `GET /v1/public/site`.
- [x] Return site name.
- [x] Return logo.
- [x] Return banner.
- [x] Return theme color.
- [x] Return contact information.
- [x] Inject theme color into CSS variables.
- [x] Display tenant branding on guest site.

### Public Theme Foundation

- [x] Add `PublicTheme` enum with four stable theme keys.
- [x] Add `Site.themeKey` with `CLASSIC_ESTATE` as the database default.
- [x] Create and apply Prisma migration.
- [x] Return `themeKey` from the public site contract and API.
- [x] Create a typed theme registry in the web app.
- [x] Add safe fallback for unknown or retired theme keys.
- [x] Keep public data fetching and business behavior outside theme components.
- [x] Load only the selected theme's presentation stylesheet and font stack.

### Public Theme Implementations

- [x] Build `CLASSIC_ESTATE` public homepage, listing, card, detail and footer.
- [x] Build `MODERN_GRID` public homepage, listing, card, detail and footer.
- [x] Build `EDITORIAL` public homepage, listing, card, detail and footer.
- [x] Build `WARM_MINIMAL` public homepage, listing, card, detail and footer.
- [x] Apply tenant logo, banner and theme color within every theme.
- [x] Keep name, logo, banner, color and contact branding isolated when tenants share a theme.
- [x] Preserve search, filters, pagination, sold status and empty states in every theme.
- [x] Preserve property gallery, contact CTA, lead form and tracking in every theme.
- [x] Verify all themes at mobile, tablet and desktop breakpoints.
- [x] Verify public theme selection does not affect Admin, Super Admin or landing layouts.

### Property Listing

- [x] Create `GET /v1/public/posts`.
- [x] Only return posts with public statuses `PUBLISHED`/`SOLD`.
- [x] Filter by current `siteId`.
- [x] Add pagination.
- [x] Add search by keyword.
- [x] Add filter by property type.
- [x] Add filter by category.
- [x] Add filter by price range at API level.
- [x] Add filter by area range at API level.
- [x] Add filter by province at API level.
- [x] Add filter by district at API level.
- [x] Add sort by newest.
- [x] Add sort by price.

### Guest UI

- [x] Build guest homepage.
- [x] Build property listing grid.
- [x] Build property card.
- [x] Display title.
- [x] Display price.
- [x] Display area.
- [x] Display address.
- [x] Display main image.
- [x] Display post status if sold.
- [x] Build empty state.
- [ ] Build loading state.

### Property Detail

- [x] Create `GET /v1/public/posts/:idOrSlug`.
- [x] Validate post belongs to current `siteId`.
- [x] Validate post has a public status.
- [x] Build detail page.
- [x] Display image gallery.
- [x] Display description.
- [x] Display price.
- [x] Display area.
- [x] Display address.
- [x] Display contact CTA.
- [ ] Display Google Map if location exists.
- [x] Add social sharing metadata.

---

## Phase 6 - Admin Dashboard

### Admin Layout

- [x] Build admin layout.
- [x] Build sidebar.
- [x] Build top bar.
- [x] Add auth guard.
- [x] Add tenant branding from API.
- [x] Add logout action.

### Dashboard Overview

- [ ] Create dashboard API.
- [x] Count total posts.
- [x] Count published posts.
- [x] Count draft posts.
- [ ] Count sold posts.
- [x] Show subscription status.
- [x] Show plan limit.
- [x] Show remaining post slots.

### Manage Posts

- [x] Create `GET /v1/admin/posts`.
- [x] Filter by current admin `siteId`.
- [x] Build manage posts page.
- [x] Add pagination.
- [x] Add search.
- [x] Add status filter.
- [x] Add type filter.
- [x] Add edit button.
- [x] Add archive button.
- [x] Add publish/hide status control in edit form.

### Create Post

- [x] Create `POST /v1/admin/posts`.
- [x] Validate plan post limit.
- [x] Validate title.
- [x] Validate description.
- [x] Validate property type.
- [x] Validate price.
- [x] Validate area.
- [x] Validate address.
- [x] Validate location fields.
- [x] Save post with current `siteId`.
- [x] Add audit log.

### Edit Post

- [x] Create `GET /v1/admin/posts/:id`.
- [x] Create `PATCH /v1/admin/posts/:id`.
- [x] Validate post belongs to current `siteId`.
- [x] Update post information.
- [x] Update post status.
- [x] Add optimistic concurrency by version.
- [x] Add audit log.

### Delete Post

- [x] Create `DELETE /v1/admin/posts/:id` archive endpoint.
- [x] Validate post belongs to current `siteId`.
- [ ] Delete post images if needed.
- [x] Archive/soft-delete post.
- [x] Add audit log.

### Categories

- [x] Create public/admin category APIs.
- [x] Build Tenant Admin category CRUD UI.
- [x] Enforce tenant-scoped category slug.
- [x] Prevent deleting a category used by posts.
- [x] Validate category ownership when creating/updating posts.
- [x] Add category filter to public website.

---

## Phase 7 - Image Upload

### Upload API

- [x] Choose AWS S3 as storage provider.
- [x] Create presigned upload helper.
- [x] Create presign/complete APIs for post images.
- [x] Validate post belongs to current `siteId`.
- [x] Validate file type.
- [x] Validate file size.
- [x] Validate max images per post by plan.
- [x] Upload image directly to S3.
- [x] Save image URL and metadata to database.
- [x] Add audit log.

### Image Management

- [x] Display images in admin edit page.
- [x] Delete image.
- [x] Reorder images.
- [x] Set main image by sort order.
- [x] Create tenant-safe image delete API.
- [x] Create tenant-safe image reorder API.
- [x] Add orphan-image cleanup job.

---

## Phase 8 - Admin Site Settings

### Site Branding

- [x] Create `GET /api/admin/site-config`.
- [x] Create `PUT /api/admin/site-config`.
- [x] Update site name.
- [x] Update logo.
- [x] Update banner.
- [x] Update theme color.
- [x] Update phone.
- [x] Update email.
- [x] Update address.
- [x] Update Zalo phone.
- [x] Update Facebook URL.
- [x] Add audit log.

### Public Theme Selection

- [x] Add four-theme gallery to Tenant Admin Site Settings.
- [x] Show theme name, description and preview thumbnail.
- [x] Preview a theme with the tenant's current branding and listing data.
- [x] Update `themeKey` through the tenant site-config API.
- [x] Require explicit save before publishing a theme change.
- [x] Write an audit log when a tenant changes theme.

### Subscription View

- [x] Create `GET /api/admin/subscription`.
- [x] Show current plan.
- [x] Show plan limit.
- [x] Show subscription status.
- [x] Show subscription end date.
- [x] Create renewal request form.
- [x] Save renewal request if implemented.

---

## Phase 9 - Super Admin Dashboard

### Super Admin Layout

- [x] Build super admin layout.
- [x] Build sidebar.
- [x] Build top bar.
- [x] Add auth guard.
- [x] Add logout action.

### Manage Sites

- [x] Create `GET /api/superadmin/sites`.
- [x] Create sites table.
- [x] Add search by name.
- [x] Add search by slug.
- [x] Add status filter.
- [x] Show subscription status.
- [x] Show number of posts.
- [x] Show created date.

### Create Site

- [x] Create `POST /api/superadmin/sites`.
- [x] Validate site name.
- [x] Validate slug format.
- [x] Ensure slug is unique.
- [x] Create site.
- [x] Create admin user.
- [x] Assign subscription plan.
- [x] Add audit log.
- [x] Show generated subdomain.
- [x] Require selecting an initial public theme.
- [x] Show theme previews in the create-site flow.
- [x] Persist the selected `themeKey` transactionally with the new site.

### Edit Site

- [x] Create `GET /api/superadmin/sites/:id`.
- [x] Create `PUT /api/superadmin/sites/:id`.
- [x] Edit site name.
- [x] Edit slug.
- [x] Edit contact info.
- [x] Edit subscription plan.
- [x] Edit subscription status.
- [x] Edit subscription end date.
- [x] Add audit log.
- [x] Show and allow Super Admin to change the tenant public theme.

### Activate/Deactivate Site

- [x] Create `PATCH /api/superadmin/sites/:id/active`.
- [x] Toggle active state.
- [x] Block inactive sites from guest access.
- [x] Add audit log.

### Reset Admin Password

- [x] Create `POST /api/superadmin/sites/:id/reset-password`.
- [x] Generate new password.
- [x] Hash password.
- [x] Update admin user.
- [x] Add audit log.
- [x] Display new password once.

---

## Phase 10 - Subscription Plans

### Plan Management

- [x] Create `GET /api/superadmin/plans`.
- [x] Create `POST /api/superadmin/plans`.
- [x] Create `PUT /api/superadmin/plans/:id`.
- [x] Create `DELETE /api/superadmin/plans/:id`.
- [x] Validate plan name.
- [x] Validate max posts.
- [x] Validate max images per post.
- [x] Validate price.
- [x] Validate duration days.
- [x] Prevent deleting plan currently used by active sites.

### Plan Enforcement

- [x] Check max posts before creating post.
- [x] Check max images before uploading image.
- [x] Block public access if subscription expired.
- [x] Allow admin access to subscription page even if expired.
- [x] Show clear expired message on guest site.

---

## Phase 11 - Audit Logs

### Logging

- [ ] Create audit log service.
- [x] Log super admin creates site.
- [x] Log super admin updates site.
- [x] Log super admin activates/deactivates site.
- [x] Log super admin resets password.
- [x] Log admin creates post.
- [x] Log admin updates post.
- [x] Log admin archives post.
- [x] Log admin uploads image.
- [x] Log admin updates site config.
- [x] Log admin category mutations.

### Audit Log UI

- [x] Create `GET /api/superadmin/audit-logs`.
- [x] Build audit log table.
- [x] Filter by site.
- [x] Filter by user.
- [x] Filter by action.
- [x] Filter by date.

---

## Phase 12 - SEO & Metadata

### Guest SEO

- [x] Add dynamic metadata for tenant homepage.
- [x] Add dynamic metadata for property detail.
- [x] Add Open Graph image.
- [x] Add canonical URL.
- [x] Add structured data for real estate listing if possible.
- [x] Generate sitemap per tenant.
- [x] Generate robots.txt.

### Performance

- [ ] Optimize images.
- [x] Use lazy loading and responsive image sizes where supported.
- [x] Add public and admin post pagination.
- [x] Avoid loading all posts at once.
- [x] Add database indexes.
- [ ] Add caching where safe.

---

## Phase 13 - Testing

### Public Theme Tests

- [x] Unit test the theme registry and default fallback.
- [x] Contract test `themeKey` in public/admin/superadmin site payloads.
- [ ] Integration test create/update site theme permissions and audit logs.
- [x] Component test shared feature parity across all four themes.
- [ ] Add visual regression screenshots for homepage, listing and detail per theme.
- [x] Add responsive browser checks at 360px, 768px, 1024px and desktop.
- [x] Verify only the selected theme stylesheet/font stack is loaded.
- [x] Verify Admin, Super Admin and landing pages are unchanged.

### Unit Tests

- [x] Test hostname parser.
- [x] Test tenant resolver.
- [x] Test auth utilities.
- [x] Test plan limit logic.
- [ ] Test post validation.

### Integration Tests

- [x] Test admin login.
- [x] Test super admin login.
- [x] Test create site.
- [x] Test create post.
- [x] Test edit post.
- [x] Test archive post.
- [x] Test guest listing.
- [x] Test guest detail.
- [x] Test image upload contract and tenant access.
- [x] Test category CRUD and cross-tenant protection.

### Security Tests

- [x] Admin A cannot access Admin B posts.
- [x] Admin A cannot update Admin B posts.
- [x] Admin A cannot delete Admin B posts.
- [x] Guest cannot access draft posts.
- [x] Inactive site is blocked.
- [x] Expired site is blocked.
- [x] Super admin can operate all sites through protected APIs.

---

## Phase 14 - Deployment

### Production Setup

- [x] Setup Prisma Postgres primary database.
- [ ] Setup production environment variables.
- [ ] Setup root domain.
- [ ] Setup wildcard subdomain DNS.
- [ ] Setup SSL.
- [ ] Setup storage bucket.
- [x] Run database migration on Prisma Postgres primary database.
- [ ] Seed super admin.
- [ ] Deploy frontend/backend.
- [ ] Verify tenant subdomain routing.
- [ ] Verify image upload.
- [ ] Verify login.
- [ ] Verify public listing.

### DNS

- [ ] Configure root domain.
- [ ] Configure wildcard DNS:

```txt
*.nice-land.vn
```

- [ ] Point wildcard to deployment platform.
- [ ] Test tenant subdomain.

---

## Phase 15 - Future Enhancements

### Custom Domain

- [ ] Allow client to connect custom domain.
- [ ] Add domain verification.
- [ ] Add DNS instruction UI.
- [ ] Add SSL handling.

### Payment

- [ ] Add payment gateway.
- [ ] Add invoice.
- [ ] Add auto renewal.
- [ ] Add payment history.

### Advanced Real Estate Features

- [ ] Save favorite posts.
- [x] Lead/contact tracking.
- [ ] CRM for agents.
- [ ] Appointment booking.
- [ ] Advanced map search.
- [ ] Nearby amenities.
- [ ] Property comparison.
- [ ] Import/export posts.

### Mobile App

- [ ] Admin mobile app.
- [ ] Push notification for leads.
- [ ] Guest mobile app if needed.

---

## MVP Completion Criteria

The MVP is complete when:

- [x] Super admin can login.
- [x] Super admin can create a tenant site.
- [x] Tenant subdomain routing works in local development.
- [x] Tenant admin can login.
- [x] Tenant admin can create posts.
- [x] Tenant admin image-upload flow is implemented (production S3 smoke pending).
- [x] Guest can view published posts.
- [x] Guest can view post details.
- [x] Admin cannot access another tenant's data.
- [x] Inactive site is blocked.
- [x] Expired site is blocked.
- [x] Tenant repositories scope data access by resolved `siteId`.
- [ ] Super Admin can choose a public theme when creating a tenant site.
- [ ] Tenant Admin can preview and switch among four supported public themes.
- [ ] All public themes provide identical features and tenant-safe data behavior.
