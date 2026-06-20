# DatCuaToi Platform - Implementation Checklist

## Phase 0 - Project Setup

### Repository Setup

- [ ] Create project repository.
- [ ] Choose monorepo or single Next.js app structure.
- [ ] Setup TypeScript.
- [ ] Setup ESLint.
- [ ] Setup Prettier.
- [ ] Setup Tailwind CSS.
- [ ] Setup environment variables.
- [ ] Add `.env.example`.
- [ ] Add README with local setup instructions.

### Recommended Environment Variables

- [ ] `DATABASE_URL`
- [ ] `JWT_SECRET`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NEXT_PUBLIC_ROOT_DOMAIN`
- [ ] `STORAGE_PROVIDER`
- [ ] `STORAGE_ACCESS_KEY`
- [ ] `STORAGE_SECRET_KEY`
- [ ] `STORAGE_BUCKET`
- [ ] `STORAGE_PUBLIC_URL`

---

## Phase 1 - Database & Prisma

### Prisma Setup

- [ ] Install Prisma.
- [ ] Initialize Prisma.
- [ ] Connect PostgreSQL database.
- [ ] Create initial Prisma schema.
- [ ] Add database enums.
- [ ] Add database indexes.
- [ ] Run first migration.
- [ ] Generate Prisma client.
- [ ] Create seed script.

### Database Models

- [ ] Create `Site` model.
- [ ] Create `User` model.
- [x] Create `PropertyCategory` model.
- [ ] Create `PropertyPost` model.
- [ ] Create `PropertyImage` model.
- [ ] Create `SubscriptionPlan` model.
- [ ] Create `AuditLog` model.
- [ ] Create `ContactRequest` model.
- [ ] Add `UserRole` enum.
- [ ] Add `PropertyType` enum.
- [ ] Add `PostStatus` enum.

### Seed Data

- [ ] Seed default super admin account.
- [ ] Seed default subscription plans.
- [ ] Seed demo tenant site.
- [ ] Seed demo admin account.
- [x] Seed demo categories.
- [ ] Seed demo property posts.

---

## Phase 2 - Tenant Resolution

### Hostname/Subdomain Detection

- [ ] Create utility to parse hostname.
- [ ] Detect root domain.
- [ ] Detect tenant subdomain.
- [ ] Support local development subdomains.
- [ ] Support fallback query param for local dev if needed.

### Backend Tenant Context

- [ ] Create `resolveSiteFromRequest` function.
- [ ] Find `Site` by slug.
- [ ] Check `Site.isActive`.
- [ ] Check `subscriptionStatus`.
- [ ] Check `subscriptionEnd`.
- [ ] Attach `siteId` to request context.
- [ ] Return clear error if site does not exist.
- [ ] Return clear error if site is inactive.
- [ ] Return clear error if subscription expired.

### Security Validation

- [ ] Ensure all public APIs resolve current site.
- [ ] Ensure all admin APIs resolve current site.
- [ ] Ensure all tenant database queries include `siteId`.
- [ ] Add helper function for `where: { siteId }`.
- [ ] Add tests for cross-tenant access blocking.

---

## Phase 3 - Authentication & Authorization

### Auth Core

- [ ] Create password hashing utility.
- [ ] Create JWT signing utility.
- [ ] Create JWT verification utility.
- [ ] Create login API.
- [ ] Create logout flow.
- [ ] Create current user API.
- [ ] Store role in JWT.
- [ ] Store `siteId` in JWT for admin users.

### Role Authorization

- [ ] Create `requireAuth` middleware.
- [ ] Create `requireRole` middleware.
- [ ] Create `requireSuperAdmin` middleware.
- [ ] Create `requireTenantAdmin` middleware.
- [ ] Block ADMIN when token `siteId` does not match resolved `siteId`.
- [ ] Allow SUPER_ADMIN to access all sites.
- [ ] Prevent GUEST from admin APIs.

### Login Pages

- [ ] Build admin login page.
- [ ] Build super admin login page.
- [ ] Add form validation with Zod.
- [ ] Add error handling.
- [ ] Add redirect after login.
- [ ] Add logout button.

---

## Phase 4 - Landing Page

### Landing UI

- [ ] Build hero section.
- [ ] Build feature section.
- [ ] Build how-it-works section.
- [ ] Build pricing section.
- [ ] Build demo websites section.
- [ ] Build FAQ section.
- [ ] Build contact CTA section.
- [ ] Build footer.

### Contact Request

- [ ] Create contact request form.
- [ ] Validate name.
- [ ] Validate phone.
- [ ] Validate email.
- [ ] Validate message.
- [ ] Create `POST /api/contact-request`.
- [ ] Save request to database.
- [ ] Show success message.
- [ ] Show error message.

---

## Phase 5 - Guest Website

### Site Config

- [ ] Create `GET /api/site/config`.
- [ ] Return site name.
- [ ] Return logo.
- [ ] Return banner.
- [ ] Return theme color.
- [ ] Return contact information.
- [ ] Inject theme color into CSS variables.
- [ ] Display tenant branding on guest site.

### Property Listing

- [ ] Create `GET /api/posts`.
- [ ] Only return posts with status `PUBLISHED`.
- [ ] Filter by current `siteId`.
- [ ] Add pagination.
- [ ] Add search by keyword.
- [ ] Add filter by property type.
- [ ] Add filter by price range.
- [ ] Add filter by area range.
- [ ] Add filter by province.
- [ ] Add filter by district.
- [ ] Add sort by newest.
- [ ] Add sort by price.

### Guest UI

- [ ] Build guest homepage.
- [ ] Build property listing grid.
- [ ] Build property card.
- [ ] Display title.
- [ ] Display price.
- [ ] Display area.
- [ ] Display address.
- [ ] Display main image.
- [ ] Display post status if sold.
- [ ] Build empty state.
- [ ] Build loading state.

### Property Detail

- [ ] Create `GET /api/posts/:id`.
- [ ] Validate post belongs to current `siteId`.
- [ ] Validate post is `PUBLISHED`.
- [ ] Build detail page.
- [ ] Display image gallery.
- [ ] Display description.
- [ ] Display price.
- [ ] Display area.
- [ ] Display address.
- [ ] Display contact CTA.
- [ ] Display Google Map if location exists.
- [ ] Add social sharing metadata.

---

## Phase 6 - Admin Dashboard

### Admin Layout

- [ ] Build admin layout.
- [ ] Build sidebar.
- [ ] Build top bar.
- [ ] Add auth guard.
- [ ] Add tenant branding.
- [ ] Add logout action.

### Dashboard Overview

- [ ] Create dashboard API.
- [ ] Count total posts.
- [ ] Count published posts.
- [ ] Count draft posts.
- [ ] Count sold posts.
- [ ] Show subscription status.
- [ ] Show plan limit.
- [ ] Show remaining post slots.

### Manage Posts

- [ ] Create `GET /api/admin/posts`.
- [ ] Filter by current admin `siteId`.
- [ ] Build manage posts page.
- [ ] Add search.
- [ ] Add status filter.
- [ ] Add type filter.
- [ ] Add edit button.
- [ ] Add delete button.
- [ ] Add publish/hide action.

### Create Post

- [ ] Create `POST /api/admin/posts`.
- [ ] Validate plan post limit.
- [ ] Validate title.
- [ ] Validate description.
- [ ] Validate property type.
- [ ] Validate price.
- [ ] Validate area.
- [ ] Validate address.
- [ ] Validate location.
- [ ] Save post with current `siteId`.
- [ ] Add audit log.

### Edit Post

- [ ] Create `GET /api/admin/posts/:id`.
- [ ] Create `PUT /api/admin/posts/:id`.
- [ ] Validate post belongs to current `siteId`.
- [ ] Update post information.
- [ ] Update post status.
- [ ] Add audit log.

### Delete Post

- [ ] Create `DELETE /api/admin/posts/:id`.
- [ ] Validate post belongs to current `siteId`.
- [ ] Delete post images if needed.
- [ ] Delete post.
- [ ] Add audit log.

---

## Phase 7 - Image Upload

### Upload API

- [ ] Choose storage provider.
- [ ] Create upload helper.
- [ ] Create `POST /api/admin/posts/:id/images`.
- [ ] Validate post belongs to current `siteId`.
- [ ] Validate file type.
- [ ] Validate file size.
- [ ] Validate max images per post by plan.
- [ ] Upload image to storage.
- [ ] Save image URL to database.
- [ ] Add audit log.

### Image Management

- [ ] Display images in admin edit page.
- [ ] Delete image.
- [ ] Reorder images.
- [ ] Set main image by sort order.
- [ ] Create `DELETE /api/admin/images/:id`.
- [ ] Create `PUT /api/admin/images/sort`.

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

- [ ] Check max posts before creating post.
- [ ] Check max images before uploading image.
- [ ] Block public access if subscription expired.
- [ ] Allow admin access to subscription page even if expired.
- [ ] Show clear expired message on guest site.

---

## Phase 11 - Audit Logs

### Logging

- [ ] Create audit log service.
- [ ] Log super admin creates site.
- [ ] Log super admin updates site.
- [ ] Log super admin activates/deactivates site.
- [ ] Log super admin resets password.
- [ ] Log admin creates post.
- [ ] Log admin updates post.
- [ ] Log admin deletes post.
- [ ] Log admin uploads image.
- [ ] Log admin updates site config.

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
- [ ] Use lazy loading.
- [ ] Add pagination.
- [ ] Avoid loading all posts at once.
- [ ] Add database indexes.
- [ ] Add caching where safe.

---

## Phase 13 - Testing

### Unit Tests

- [ ] Test hostname parser.
- [ ] Test tenant resolver.
- [ ] Test auth utilities.
- [ ] Test plan limit logic.
- [ ] Test post validation.

### Integration Tests

- [ ] Test admin login.
- [ ] Test super admin login.
- [ ] Test create site.
- [ ] Test create post.
- [ ] Test edit post.
- [ ] Test delete post.
- [ ] Test guest listing.
- [ ] Test guest detail.
- [ ] Test image upload.

### Security Tests

- [ ] Admin A cannot access Admin B posts.
- [ ] Admin A cannot update Admin B posts.
- [ ] Admin A cannot delete Admin B posts.
- [ ] Guest cannot access draft posts.
- [ ] Inactive site is blocked.
- [ ] Expired site is blocked.
- [ ] Super admin can access all sites.

---

## Phase 14 - Deployment

### Production Setup

- [ ] Setup production database.
- [ ] Setup production environment variables.
- [ ] Setup root domain.
- [ ] Setup wildcard subdomain DNS.
- [ ] Setup SSL.
- [ ] Setup storage bucket.
- [ ] Run database migration.
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
*.datcuatoi.vn
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
- [ ] Lead/contact tracking.
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

- [ ] Super admin can login.
- [ ] Super admin can create a tenant site.
- [ ] Tenant subdomain is accessible.
- [ ] Tenant admin can login.
- [ ] Tenant admin can create posts.
- [ ] Tenant admin can upload images.
- [ ] Guest can view published posts.
- [ ] Guest can view post details.
- [ ] Admin cannot access another tenant's data.
- [ ] Inactive site is blocked.
- [ ] Expired site is blocked.
- [ ] All tenant queries include `siteId`.
