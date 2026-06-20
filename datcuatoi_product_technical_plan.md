# DatCuaToi Platform - Product & Technical Plan

## 1. Product Overview

**DatCuaToi Platform** is a multi-tenant real estate listing SaaS platform.

The platform allows the Super Admin to create multiple subdomains. Each subdomain represents a separate real estate website for a client.

Example:

```txt
abc.datcuatoi.vn
nguyenvana.datcuatoi.vn
batdongsanabc.datcuatoi.vn
```

Each client owns one subdomain and can manage their own property posts, images, descriptions, locations, branding, and contact information.

---

## 2. Main User Roles

### 2.1 SUPER_ADMIN

The platform owner.

Responsibilities:

- Create new tenant websites.
- Manage all client websites.
- Activate or deactivate tenant websites.
- Manage subscription plans.
- Reset admin passwords.
- View system-wide statistics.
- Manage payment or renewal status.

### 2.2 ADMIN

The owner of a tenant/subdomain website.

Responsibilities:

- Login to admin dashboard.
- Create property posts.
- Edit property posts.
- Delete property posts.
- Upload property images.
- Update website branding.
- Update contact information.
- View post statistics.
- Manage subscription or renewal request.

### 2.3 GUEST

Public visitor of a tenant website.

Responsibilities:

- View property listings.
- Search/filter posts.
- View property details.
- View images.
- View location/map.
- Contact the owner or agent.

---

## 3. Main Pages

## 3.1 Landing Page

URL:

```txt
datcuatoi.vn
```

Purpose:

Public SaaS landing page to introduce the platform.

Main sections:

- Hero section.
- Platform introduction.
- Feature list.
- How it works.
- Pricing plans.
- Example tenant websites.
- FAQ.
- Contact form.
- CTA: Create your real estate website.

Main CTA examples:

```txt
Create your website
Start your property website
Register your subdomain
```

---

## 3.2 Guest Website

URL example:

```txt
abc.datcuatoi.vn
```

Purpose:

Public website for each tenant.

Features:

- View published property posts.
- Search by keyword.
- Filter by property type.
- Filter by price.
- Filter by area.
- Filter by province/district/ward.
- View property detail.
- View image gallery.
- View Google Map location.
- Contact via phone, email, Zalo, or Facebook.

Guest does not need to login.

---

## 3.3 Admin Page

URL example:

```txt
abc.datcuatoi.vn/admin
```

Purpose:

Dashboard for tenant owner.

Features:

- Login/logout.
- Dashboard overview.
- Manage property posts.
- Create property post.
- Edit property post.
- Delete property post.
- Upload multiple images.
- Sort images.
- Change post status.
- Update website branding.
- Update logo, banner, theme color.
- Update contact information.
- View current subscription.
- Send renewal request.

---

## 3.4 Super Admin Page

URL example:

```txt
datcuatoi.vn/superadmin
```

Purpose:

Dashboard for platform owner.

Features:

- Login/logout.
- View all tenant websites.
- Create new tenant/subdomain.
- Edit tenant information.
- Activate/deactivate tenant.
- Manage subscription plans.
- Assign plan to tenant.
- Reset tenant admin password.
- View all posts across tenants.
- View audit logs.
- View contact requests from landing page.

---

## 4. Technical Architecture

The platform should follow a **multi-tenant architecture**.

Recommended model:

```txt
Shared Database
Data isolated by siteId
```

This is similar to the uploaded OrderQR architecture, which uses a shared PostgreSQL database and isolates tenant data by `storeId`. For this project, the equivalent field should be `siteId`.

Mapping from OrderQR architecture:

```txt
Store      -> Site
Product    -> PropertyPost
Category   -> PropertyCategory
Order      -> Not required in MVP
Invoice    -> SubscriptionInvoice
User       -> User
AuditLog   -> AuditLog
```

---

## 5. Recommended Tech Stack

### Frontend

```txt
Next.js App Router
React
TypeScript
Tailwind CSS
React Hook Form
Zod
TanStack Query
Axios or Fetch wrapper
```

### Backend

Option A:

```txt
Next.js API Routes / Route Handlers
Prisma
PostgreSQL
JWT Auth
```

Option B:

```txt
Fastify
Prisma
PostgreSQL
JWT Auth
Zod Validation
```

### Database

```txt
PostgreSQL
Prisma ORM
```

### File Storage

Recommended options:

```txt
Cloudinary
AWS S3
Cloudflare R2
Supabase Storage
```

### Deployment

```txt
Vercel for frontend
Railway/Fly.io/Render for backend if using Fastify
NeonDB/Supabase for PostgreSQL
Cloudflare for DNS/subdomain routing
```

---

## 6. Multi-Tenant Design

## 6.1 Tenant Entity

Use `Site` as the root tenant model.

Each site has a unique slug.

Example:

```txt
slug = abc
domain = abc.datcuatoi.vn
```

## 6.2 Tenant Resolution Flow

When a request comes to the backend:

```txt
abc.datcuatoi.vn
```

The system should:

1. Read the request hostname.
2. Extract the subdomain.
3. Find the matching Site by slug.
4. Check whether the Site is active.
5. Check whether the subscription is valid.
6. Attach `siteId` to request context.
7. All tenant queries must include `siteId`.

Example:

```ts
const site = await prisma.site.findUnique({
  where: { slug: "abc" }
});

request.siteId = site.id;
```

Every tenant query must include:

```ts
where: {
  siteId: request.siteId
}
```

This prevents cross-tenant data leakage.

---

## 7. Security Rules

### Guest

- Can only access active tenant sites.
- Can only view published posts.
- Cannot create/edit/delete data.

### Admin

- Can only access their own site.
- JWT token must include `siteId`.
- Every admin request must compare token `siteId` with resolved request `siteId`.
- If mismatch, block request.

### Super Admin

- Can access all sites.
- Can create, update, activate, deactivate tenants.
- Can access tenant data by `siteId`.

---

## 8. Database Schema Draft

## 8.1 Site

```prisma
model Site {
  id                 String   @id @default(uuid())
  name               String
  slug               String   @unique
  domain             String?
  logo               String?
  banner             String?
  themeColor         String?
  phone              String?
  email              String?
  address            String?
  facebookUrl        String?
  zaloPhone          String?
  isActive           Boolean  @default(true)
  subscriptionPlan   String?
  subscriptionStatus String   @default("ACTIVE")
  subscriptionEnd    DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  users              User[]
  posts              PropertyPost[]
  categories         PropertyCategory[]
  auditLogs          AuditLog[]
}
```

## 8.2 User

```prisma
model User {
  id        String   @id @default(uuid())
  siteId    String?
  username  String
  password  String
  fullName  String?
  phone     String?
  role      UserRole
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  site      Site?    @relation(fields: [siteId], references: [id])

  @@unique([username, siteId])
}
```

## 8.3 UserRole

```prisma
enum UserRole {
  SUPER_ADMIN
  ADMIN
  GUEST
}
```

## 8.4 PropertyCategory

```prisma
model PropertyCategory {
  id        String   @id @default(uuid())
  siteId    String
  name      String
  slug      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  site      Site     @relation(fields: [siteId], references: [id])
  posts     PropertyPost[]

  @@unique([siteId, slug])
}
```

## 8.5 PropertyPost

```prisma
model PropertyPost {
  id          String       @id @default(uuid())
  siteId      String
  categoryId  String?
  title       String
  description String
  type        PropertyType
  price       Decimal?
  area        Float?
  address     String?
  province    String?
  district    String?
  ward        String?
  latitude    Float?
  longitude   Float?
  status      PostStatus   @default(DRAFT)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  site        Site         @relation(fields: [siteId], references: [id])
  category    PropertyCategory? @relation(fields: [categoryId], references: [id])
  images      PropertyImage[]

  @@index([siteId])
  @@index([siteId, status])
}
```

## 8.6 PropertyImage

```prisma
model PropertyImage {
  id        String       @id @default(uuid())
  postId    String
  url       String
  sortOrder Int          @default(0)
  createdAt DateTime     @default(now())

  post      PropertyPost @relation(fields: [postId], references: [id], onDelete: Cascade)
}
```

## 8.7 PropertyType

```prisma
enum PropertyType {
  LAND
  HOUSE
  APARTMENT
  RENTAL
}
```

## 8.8 PostStatus

```prisma
enum PostStatus {
  DRAFT
  PUBLISHED
  HIDDEN
  SOLD
}
```

## 8.9 SubscriptionPlan

```prisma
model SubscriptionPlan {
  id               String   @id @default(uuid())
  name             String
  maxPosts         Int
  maxImagesPerPost Int
  price            Decimal
  durationDays     Int
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

## 8.10 AuditLog

```prisma
model AuditLog {
  id        String   @id @default(uuid())
  siteId    String?
  userId    String?
  action    String
  details   Json?
  createdAt DateTime @default(now())

  site      Site?    @relation(fields: [siteId], references: [id])
}
```

## 8.11 ContactRequest

```prisma
model ContactRequest {
  id        String   @id @default(uuid())
  name      String
  phone     String
  email     String?
  message   String?
  createdAt DateTime @default(now())
}
```

---

## 9. API Plan

## 9.1 Public API

```txt
GET    /api/site/config
GET    /api/posts
GET    /api/posts/:id
GET    /api/categories
POST   /api/contact-request
```

## 9.2 Auth API

```txt
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

## 9.3 Admin API

```txt
GET    /api/admin/dashboard
GET    /api/admin/posts
POST   /api/admin/posts
GET    /api/admin/posts/:id
PUT    /api/admin/posts/:id
DELETE /api/admin/posts/:id

POST   /api/admin/posts/:id/images
DELETE /api/admin/images/:id
PUT    /api/admin/images/sort

GET    /api/admin/site-config
PUT    /api/admin/site-config

GET    /api/admin/subscription
POST   /api/admin/renewal-request
```

## 9.4 Super Admin API

```txt
GET    /api/superadmin/sites
POST   /api/superadmin/sites
GET    /api/superadmin/sites/:id
PUT    /api/superadmin/sites/:id
DELETE /api/superadmin/sites/:id

PATCH  /api/superadmin/sites/:id/active
POST   /api/superadmin/sites/:id/reset-password

GET    /api/superadmin/plans
POST   /api/superadmin/plans
PUT    /api/superadmin/plans/:id
DELETE /api/superadmin/plans/:id

GET    /api/superadmin/contact-requests
GET    /api/superadmin/audit-logs
```

---

## 10. Frontend Route Plan

```txt
/
Landing page

/[slug]
Guest website homepage

/[slug]/posts
Guest property listing page

/[slug]/posts/[id]
Guest property detail page

/[slug]/admin
Admin dashboard

/[slug]/admin/login
Admin login

/[slug]/admin/posts
Admin manage posts

/[slug]/admin/posts/create
Admin create post

/[slug]/admin/posts/[id]/edit
Admin edit post

/[slug]/admin/settings
Admin site settings

/[slug]/admin/subscription
Admin subscription page

/superadmin
Super admin dashboard

/superadmin/login
Super admin login

/superadmin/sites
Manage tenant websites

/superadmin/sites/create
Create tenant website

/superadmin/sites/[id]
Tenant detail

/superadmin/plans
Manage subscription plans
```

---

## 11. MVP Scope

The MVP should focus on:

- Landing page.
- Super admin login.
- Super admin creates tenant site.
- Tenant admin login.
- Tenant admin creates property posts.
- Tenant admin uploads images.
- Guest sees published posts by tenant.
- Tenant isolation by `siteId`.
- Active/inactive site check.
- Basic subscription check.

Do not include payment automation, custom domain, advanced analytics, or real-time features in MVP unless needed.

---

## 12. AI Agent Implementation Prompt

```txt
Build a multi-tenant real estate listing platform.

The system has 4 main areas:
1. Public landing page for the SaaS platform.
2. Guest website for each tenant/subdomain.
3. Admin dashboard for tenant owners.
4. Super admin dashboard for platform owner.

Use a shared database multi-tenant architecture isolated by siteId.

Each tenant is represented by a Site model. Each Site has a unique slug used as subdomain. Every PropertyPost must belong to one Site via siteId.

Implement tenant resolution from hostname/subdomain. For every request, resolve the current Site and attach siteId to the request context. All database queries for tenant data must include siteId to prevent cross-tenant data leakage.

Roles:
- SUPER_ADMIN: can create and manage all sites.
- ADMIN: can manage only their own site.
- GUEST: can view public posts only.

Core MVP features:
- Super admin can create a site with slug, name, admin account, subscription plan.
- Guest can view published property posts on a tenant website.
- Admin can login and create, edit, delete property posts.
- Admin can upload images for each post.
- Admin can edit site branding: logo, theme color, phone, email, address.
- System must block inactive or expired sites from public access.

Use Next.js, TypeScript, Prisma, PostgreSQL, Tailwind, React Hook Form, Zod, and JWT authentication.
```

---

## 13. Important Engineering Rules

1. Never query tenant data without `siteId`.
2. Never trust `siteId` from frontend only.
3. Always resolve tenant from hostname/subdomain on backend.
4. Admin JWT must contain `siteId`.
5. Admin can only access data matching their token `siteId`.
6. Super Admin is the only role allowed to manage all sites.
7. Public guest can only see `PUBLISHED` posts.
8. Inactive or expired sites must be blocked.
9. Use indexes on `siteId`.
10. Use audit logs for important admin and super admin actions.
