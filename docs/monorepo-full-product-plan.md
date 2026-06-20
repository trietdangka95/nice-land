# DatCuaToi — Monorepo Migration & Full Product Plan

## 1. Mục tiêu

Chuyển codebase hiện tại từ một Next.js full-stack demo thành monorepo có:

- Frontend Next.js deploy độc lập.
- Backend Fastify deploy độc lập.
- PostgreSQL + Prisma làm nguồn dữ liệu thật.
- Shared contracts giúp FE và BE dùng chung type, enum và validation.
- Multi-tenancy an toàn theo `siteId`.
- Đầy đủ luồng Guest, Tenant Admin và Super Admin.
- Có kiểm thử, logging, monitoring, backup và quy trình deploy production.

## 2. Các giả định đang dùng

1. Giữ một Git repository, không tách thành hai repository.
2. Dùng `pnpm workspace` để quản lý monorepo.
3. Frontend tiếp tục dùng Next.js App Router, React, TypeScript và Tailwind.
4. Backend dùng Fastify, TypeScript, Zod/JSON Schema và Prisma.
5. Database là PostgreSQL.
6. File storage dùng **AWS S3**. ✅ Đã chốt
7. FE public chạy tại `datcuatoi.vn` và `*.datcuatoi.vn`.
8. API chạy tại `api.datcuatoi.vn`.
9. Auth dùng access token ngắn hạn và refresh token trong cookie `HttpOnly`.
10. Giai đoạn đầu chưa tự động thanh toán; Super Admin quản lý gói và gia hạn thủ công.

Các giả định này phải được xác nhận trước Phase 2.

## 3. Hiện trạng

### Đã có

- Landing page hoàn chỉnh về giao diện.
- Guest tenant homepage, danh sách và chi tiết bất động sản.
- Tenant Admin dashboard, danh sách tin, form tạo tin, cấu hình và subscription UI.
- Super Admin dashboard, site list, plan list, contact request và audit log UI.
- Responsive layout và scroll motion.
- Hostname parser và một số test tenant isolation cơ bản.
- Prisma schema nháp.
- Một vài Next.js Route Handler demo.

### Chưa phải chức năng thật

- Data đang đọc từ `lib/data.ts`.
- Đăng nhập chưa xác thực với server.
- Các nút tạo, sửa, xóa, publish, deactivate, renew chỉ là UI.
- Form tạo tin không lưu database.
- Upload ảnh chưa có storage.
- Dashboard dùng số liệu hard-code.
- Contact form không lưu database.
- Chưa có API CRUD hoàn chỉnh.
- Chưa có refresh token, session revocation hoặc password reset.
- Chưa có migration và seed chạy trên PostgreSQL.
- Chưa có integration/E2E test cho luồng nghiệp vụ.
- Chưa có CI/CD, monitoring, backup hoặc production security.

## 4. Kiến trúc đích

```text
dat-cua-toi/
├── apps/
│   ├── web/                       # Next.js frontend
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   └── tests/
│   └── api/                       # Fastify backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── sites/
│       │   │   ├── posts/
│       │   │   ├── media/
│       │   │   ├── subscriptions/
│       │   │   ├── contacts/
│       │   │   └── audit/
│       │   ├── plugins/
│       │   ├── middleware/
│       │   ├── services/
│       │   └── server.ts
│       └── tests/
├── packages/
│   ├── database/                  # Prisma schema, migrations, client, seed
│   ├── contracts/                 # Zod schemas, DTOs, enums
│   ├── api-client/                # Typed fetch client cho web
│   ├── config/                    # Shared TypeScript/ESLint/Prettier config
│   └── test-utils/                # Factories và test helpers
├── docs/
├── pnpm-workspace.yaml
├── package.json
└── pnpm-lock.yaml
```

### Dependency rules

```text
apps/web ───────► packages/contracts
    │            packages/api-client
    │
    └──────────► HTTP ─────────────► apps/api
                                      │
apps/api ──────► packages/contracts   │
                 packages/database ◄──┘
```

- `apps/web` không import Prisma hoặc code nội bộ của API.
- `apps/api` không import component/frontend code.
- `packages/contracts` không phụ thuộc framework.
- Chỉ `packages/database` được tạo Prisma client.

## 5. Luồng tenant khi FE và BE tách domain

### Public request

1. Người dùng mở `minhphat.datcuatoi.vn`.
2. Next.js đọc hostname để render đúng tenant.
3. FE gọi `https://api.datcuatoi.vn/public/...`.
4. FE gửi `X-Tenant-Host: minhphat.datcuatoi.vn`.
5. API kiểm tra host có đúng root domain hoặc custom domain đã xác minh.
6. API resolve `Site` từ host, kiểm tra active/subscription và tạo `TenantContext`.
7. Repository bắt buộc dùng `tenantContext.siteId`.

### Admin request

Ngoài tenant resolution:

1. API xác minh access token.
2. Token ADMIN phải có `siteId`.
3. `token.siteId` phải khớp `TenantContext.siteId`.
4. SUPER_ADMIN được phép chỉ định site qua route param sau authorization.

### Security invariant

Không endpoint nào nhận `siteId` từ body/query rồi tin trực tiếp. `siteId` phải đến từ:

- Hostname đã được API xác minh, hoặc
- Token đã ký, hoặc
- Route Super Admin đã qua authorization.

## 6. Auth đề xuất

- Password hash: Argon2id.
- Access token: 10–15 phút.
- Refresh token: random opaque token, hash lưu database.
- Cookie: `HttpOnly`, `Secure`, `SameSite=Lax` hoặc `None` nếu kiến trúc domain yêu cầu.
- Refresh rotation sau mỗi lần refresh.
- Logout thu hồi refresh session.
- Rate limit login theo IP + username.
- Lock/throttle tạm thời khi đăng nhập sai liên tục.
- Password reset bằng token một lần, có thời hạn.
- Audit log cho login thất bại, reset password và thay đổi quyền.

## 7. API contract chính

### Public

```text
GET    /v1/public/site
GET    /v1/public/categories
GET    /v1/public/posts
GET    /v1/public/posts/:postId
POST   /v1/public/contact-requests
```

### Auth

```text
POST   /v1/auth/login
POST   /v1/auth/refresh
POST   /v1/auth/logout
GET    /v1/auth/me
POST   /v1/auth/forgot-password
POST   /v1/auth/reset-password
```

### Tenant Admin

```text
GET    /v1/admin/dashboard
GET    /v1/admin/posts
POST   /v1/admin/posts
GET    /v1/admin/posts/:postId
PATCH  /v1/admin/posts/:postId
DELETE /v1/admin/posts/:postId
PATCH  /v1/admin/posts/:postId/status

POST   /v1/admin/posts/:postId/images/presign
POST   /v1/admin/posts/:postId/images/complete
DELETE /v1/admin/images/:imageId
PATCH  /v1/admin/images/order

GET    /v1/admin/site
PATCH  /v1/admin/site
GET    /v1/admin/subscription
POST   /v1/admin/renewal-requests
```

### Super Admin

```text
GET    /v1/superadmin/dashboard
GET    /v1/superadmin/sites
POST   /v1/superadmin/sites
GET    /v1/superadmin/sites/:siteId
PATCH  /v1/superadmin/sites/:siteId
PATCH  /v1/superadmin/sites/:siteId/status
POST   /v1/superadmin/sites/:siteId/reset-admin-password

GET    /v1/superadmin/plans
POST   /v1/superadmin/plans
PATCH  /v1/superadmin/plans/:planId
DELETE /v1/superadmin/plans/:planId

GET    /v1/superadmin/contact-requests
PATCH  /v1/superadmin/contact-requests/:requestId
GET    /v1/superadmin/renewal-requests
PATCH  /v1/superadmin/renewal-requests/:requestId
GET    /v1/superadmin/audit-logs
```

## 8. Database cần hoàn thiện

### Model hiện có cần giữ

- Site
- User
- PropertyCategory
- PropertyPost
- PropertyImage
- SubscriptionPlan
- AuditLog
- ContactRequest

### Model/field cần bổ sung

- `RefreshSession`: quản lý refresh token và thiết bị.
- `PasswordResetToken`: reset password một lần.
- `RenewalRequest`: yêu cầu gia hạn.
- `SubscriptionHistory`: lịch sử đổi gói/gia hạn.
- `SiteDomain`: root subdomain và custom domain đã xác minh.
- `Lead`: liên hệ từ từng property/tenant.
- `PropertyView`: thống kê lượt xem đã aggregate hoặc raw event có TTL.
- `User.lastLoginAt`, `User.isActive`.
- `PropertyPost.slug`, `publishedAt`, `createdById`, `updatedById`.
- `PropertyImage.storageKey`, `mimeType`, `size`, `width`, `height`.
- `AuditLog.ipAddress`, `userAgent`, `requestId`.
- Soft delete hoặc archive policy cho dữ liệu quan trọng.

### Ràng buộc bắt buộc

- Composite indexes theo `siteId`.
- Unique slug trong phạm vi site.
- Cascade/restrict rõ ràng cho từng relation.
- Transaction khi tạo site + admin + subscription.
- Decimal cho giá tiền.
- UTC trong database; format timezone tại FE.

## 9. Kế hoạch triển khai theo phase

## Phase 0 — Xác nhận quyết định sản phẩm

### Công việc

- Chọn FE host.
- Chọn API host.
- Chọn PostgreSQL provider.
- Chọn AWS region, bucket và CDN/public URL.
- Chọn email provider.
- Chọn map provider.
- Chốt payment có nằm trong bản launch hay không.
- Chốt custom domain có nằm trong bản launch hay không.

### Acceptance

- Có document quyết định và environment matrix.
- Không còn câu hỏi kiến trúc blocking.

### Verify

- Review `Open Questions` ở cuối tài liệu.

---

## Phase 1 — Chuyển sang monorepo

**Trạng thái: Hoàn thành foundation ngày 19/06/2026.**

- [x] Tạo pnpm workspace.
- [x] Di chuyển frontend vào `apps/web`.
- [x] Khởi tạo Fastify trong `apps/api`.
- [x] Tạo `contracts`, `api-client`, `database`, `config`.
- [x] Tách Next.js Route Handlers khỏi frontend.
- [x] FE và API chạy đồng thời trên cổng riêng.
- [x] Typecheck, tests và build toàn workspace thành công.
- [ ] Docker image chưa build local vì môi trường hiện tại chưa cài Docker.

### Task 1.1: Tạo workspace root

- Thêm `pnpm-workspace.yaml`.
- Root scripts: `dev`, `build`, `test`, `lint`, `typecheck`.
- Chuyển npm lock sang pnpm lock.

Acceptance:

- `pnpm install` chạy từ root.
- Workspace nhận diện được web, api và packages.

Verify:

```bash
pnpm install
pnpm -r list --depth -1
```

### Task 1.2: Di chuyển frontend sang `apps/web`

- Di chuyển `app`, `components`, CSS, public assets và Next config.
- Giữ nguyên URL và giao diện hiện tại.
- Xóa Next Route Handlers khỏi frontend sau khi API đã thay thế.

Acceptance:

- Tất cả page hiện tại render giống trước migration.
- `apps/web` build độc lập.

Verify:

```bash
pnpm --filter web test
pnpm --filter web build
```

### Task 1.3: Khởi tạo `apps/api`

- Fastify server.
- Config validation.
- Health/readiness endpoint.
- Error handler chuẩn.
- Request ID và structured logging.

Acceptance:

- `/health/live` và `/health/ready` trả kết quả đúng.
- API fail fast nếu thiếu environment variable.

### Task 1.4: Tạo shared packages

- `contracts`: enums, Zod schemas, DTOs.
- `database`: Prisma schema/client.
- `api-client`: typed fetch wrapper.
- `config`: shared TypeScript/ESLint.

Acceptance:

- FE và API import package bằng `workspace:*`.
- Không có duplicate domain types.

### Checkpoint Phase 1

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

---

## Phase 2 — Database thật và tenant foundation

**Trạng thái hiện tại: foundation hoàn thành; Prisma Postgres primary database
đã được tạo ở `ap-southeast-1` và baseline migration đã được apply.**

- [x] Hoàn thiện Prisma schema, indexes và relation policy.
- [x] Tạo baseline migration PostgreSQL.
- [x] Tạo seed idempotent cho plans, Super Admin, hai tenant và demo posts.
- [x] Tenant resolver hỗ trợ platform subdomain, localhost và verified custom domain.
- [x] Chặn inactive, suspended và expired tenant.
- [x] Tenant-scoped query helper chống override `siteId`.
- [x] Unit/integration tests cho tenant context.
- [x] Public site config repository/API dùng tenant context.
- [x] Landing và tenant contact request repository/API.
- [x] Public property listing/detail API với search, filter, sort và pagination.
- [x] Public post chỉ trả `PUBLISHED`/`SOLD` trong đúng tenant.
- [x] Apply migration lên Prisma Postgres primary database.
- [ ] Chạy seed an toàn trên Prisma Postgres với mật khẩu production do người
  vận hành cung cấp.

### Task 2.1: Hoàn thiện Prisma schema

- Bổ sung model/field ở phần 8.
- Tạo indexes, constraints và relation policy.
- Tạo migration đầu tiên.

### Task 2.2: Seed dữ liệu

- Super Admin.
- Subscription plans.
- Hai demo tenants.
- Admin account.
- Categories, posts và images.

### Task 2.3: Tenant resolution plugin

- Resolve từ `X-Tenant-Host`.
- Allowlist root domain.
- Hỗ trợ localhost.
- Hỗ trợ custom domain verified.
- Check active và subscription.

### Task 2.4: Tenant-safe repositories

- Repository nhận `TenantContext`, không nhận `siteId` tùy ý.
- Test đọc/sửa/xóa chéo tenant.

### Checkpoint Phase 2

- Migration chạy trên database sạch.
- Seed idempotent hoặc có reset workflow rõ ràng.
- Admin A không thể đọc/update/delete dữ liệu Admin B.

---

## Phase 3 — Authentication & authorization

**Trạng thái hiện tại: core auth hoàn thành ở mức code, chờ Prisma Postgres để
smoke test với user thật.**

- [x] Password hash bằng bcrypt.
- [x] Access token HS256, issuer/audience và TTL 15 phút.
- [x] Opaque refresh token được SHA-256 trước khi lưu database.
- [x] Refresh rotation và revoke khi logout.
- [x] Login phân biệt root Super Admin và tenant Admin.
- [x] ADMIN token bắt buộc khớp tenant resolve từ hostname.
- [x] `/login`, `/refresh`, `/logout`, `/me`.
- [x] HttpOnly refresh cookie.
- [x] FE login form, session access token và auth guard cấu hình bằng environment.
- [x] Logout action.
- [x] Unit/integration tests cho credential, rotation và cross-tenant access.
- [ ] Apply database migration/seed trên Prisma Postgres rồi smoke test user thật.
- [ ] Forgot/reset password phụ thuộc email provider.

### Vertical slice 3.1: Tenant Admin login

- Login API.
- Access/refresh token.
- Login form nối API.
- Auth store và auto refresh.
- Protected admin routes.

### Vertical slice 3.2: Super Admin login

- Role guard.
- Super Admin protected routes.
- Forbidden state.

### Vertical slice 3.3: Logout và session management

- Revoke refresh session.
- Logout toàn bộ thiết bị nếu cần.
- Current user endpoint.

### Vertical slice 3.4: Password reset

- Forgot password.
- One-time reset token.
- Email.
- Reset tenant admin từ Super Admin.

### Checkpoint Phase 3

- Login/logout/refresh chạy E2E.
- ADMIN không vào Super Admin.
- Token tenant A không gọi API tenant B.
- Cookie hoạt động đúng trên staging FE/API domain.

---

## Phase 4 — Public website nối API thật

### Vertical slice 4.1: Site config

- Public site endpoint.
- Branding động.
- Inactive/expired states.
- Cache invalidation khi admin cập nhật.

### Vertical slice 4.2: Property listing

- Pagination cursor hoặc offset.
- Search.
- Type, price, area, province, district filters.
- Sort newest/price.
- URL search params để share và back/forward đúng.

### Vertical slice 4.3: Property detail

- Published-only access.
- Gallery.
- Map.
- Related properties.
- Contact CTA và lead capture.

### Vertical slice 4.4: Landing contact

- Lưu ContactRequest.
- Spam protection.
- Super Admin nhận và xử lý request.

### Checkpoint Phase 4

- Không còn public data hard-code.
- Draft/hidden post không thể truy cập bằng URL.
- Inactive và expired tenant bị chặn.

---

## Phase 5 — Tenant Admin post management

### Vertical slice 5.1: Dashboard

- Counts thật.
- Plan usage.
- Recent posts.
- View statistics cơ bản.

### Vertical slice 5.2: Create post

- React Hook Form + shared Zod schema.
- Plan limit.
- Draft/publish.
- Audit log.

### Vertical slice 5.3: Edit post

- Load detail.
- Optimistic concurrency bằng `updatedAt` hoặc version.
- Status transitions.
- Audit diff.

### Vertical slice 5.4: Delete/archive post

- Confirm dialog.
- Archive hoặc delete policy.
- Cleanup ảnh theo policy.
- Audit log.

### Vertical slice 5.5: Categories

- CRUD categories.
- Tenant-scoped slug.
- Không xóa category đang được sử dụng hoặc có migration strategy.

### Checkpoint Phase 5

- Tenant Admin CRUD đầy đủ.
- Refresh page không mất dữ liệu.
- Mọi mutation đều có audit log.

---

## Phase 6 — Image upload

### Task 6.1: Presigned upload

- API tạo presigned URL.
- FE upload trực tiếp lên AWS S3.
- API complete upload và lưu metadata.

### Task 6.2: Validation

- MIME allowlist.
- File size.
- Image dimensions.
- Max images theo plan.
- Tenant-scoped object key.

### Task 6.3: Image management

- Reorder drag-and-drop.
- Set cover image.
- Delete.
- Orphan cleanup job.

### Task 6.4: Image optimization

- Thumbnail variants hoặc image CDN.
- WebP/AVIF.
- Lazy loading và responsive sizes.

### Checkpoint Phase 6

- Upload nhiều ảnh ổn định.
- Tenant A không đọc/xóa private object tenant B.
- Không còn orphan file sau failure/retry.

---

## Phase 7 — Tenant settings & subscription

### Vertical slice 7.1: Branding

- Logo, banner, theme color.
- Contact info.
- Social links.
- Preview trước khi lưu.

### Vertical slice 7.2: Subscription usage

- Current plan.
- Limits.
- End date.
- Grace period/expired behavior.

### Vertical slice 7.3: Renewal request

- Admin gửi request.
- Super Admin duyệt/từ chối.
- Ghi subscription history.
- Audit log.

### Checkpoint Phase 7

- Branding cập nhật lên guest site.
- Limit post và image được enforce ở API, không chỉ FE.

---

## Phase 8 — Super Admin operations

### Vertical slice 8.1: Manage sites

- Search/filter/pagination.
- Create site transaction.
- Edit site.
- Activate/deactivate.
- View usage.

### Vertical slice 8.2: Manage plans

- CRUD plans.
- Không xóa plan đang được sử dụng.
- Version/change policy cho tenant hiện tại.

### Vertical slice 8.3: Admin account management

- Reset password.
- Disable account.
- View last login/session.

### Vertical slice 8.4: Contacts and renewals

- Status workflow: NEW, IN_PROGRESS, DONE, REJECTED.
- Notes và assignee nếu cần.

### Vertical slice 8.5: Audit logs

- Filter theo site/user/action/date.
- Detail JSON.
- Export CSV nếu cần.

### Checkpoint Phase 8

- Super Admin có thể vận hành toàn bộ tenant mà không cần thao tác database thủ công.

---

## Phase 9 — SEO, analytics và lead features

### SEO

- Dynamic metadata.
- Canonical URL.
- Open Graph.
- JSON-LD.
- Tenant sitemap.
- robots.txt.
- Property slug thân thiện.

### Analytics

- Property view tracking.
- Deduplicate bot/repeated events.
- Dashboard theo ngày/tháng.
- Top posts.

### Lead

- Contact form theo property.
- Click phone/Zalo tracking.
- Lead inbox cho Tenant Admin.
- Lead status và notes.
- Email notification.

### Checkpoint Phase 9

- Property được index đúng.
- Tenant xem được nguồn lead và tin hiệu quả.

---

## Phase 10 — Production quality

### Testing

- Unit: validation, tenant resolver, auth, plan limits.
- Integration: API + test database.
- Security: cross-tenant matrix.
- E2E: Playwright cho các critical flows.
- Contract tests giữa FE và API.

Critical E2E flows:

1. Super Admin login → create tenant.
2. Tenant Admin login → create post → upload images → publish.
3. Guest search → open detail → submit lead.
4. Super Admin deactivate tenant → public site blocked.
5. Subscription expires → public blocked, admin renewal page accessible.

### Security

- CORS allowlist.
- Helmet/security headers.
- Rate limiting.
- Request body limits.
- SQL injection protected by ORM and validation.
- XSS sanitization cho rich text.
- CSRF strategy cho cookie endpoints.
- Secret rotation.
- Dependency audit.
- Upload malware/content policy nếu cần.

### Reliability

- Structured logs.
- Error tracking.
- Metrics và uptime monitor.
- Database backup + restore drill.
- Migration rollback/forward policy.
- AWS S3 lifecycle.
- Scheduled orphan cleanup.

### Performance

- API pagination.
- Query analysis.
- Database connection pooling.
- Cache public site config.
- CDN cho ảnh.
- Web Vitals budgets:
  - LCP < 2.5s.
  - CLS < 0.1.
  - INP < 200ms.

### Accessibility

- Keyboard navigation.
- Focus management.
- Color contrast.
- Accessible forms/errors.
- Reduced motion.
- Automated axe checks cho critical pages.

---

## Phase 11 — CI/CD và deployment

### CI

Trên mỗi pull request:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Thêm:

- API integration tests với PostgreSQL service.
- E2E smoke test trên preview/staging.
- Migration validation.

### FE deployment

- Root directory: `apps/web`.
- Environment:
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_ROOT_DOMAIN`
  - `NEXT_PUBLIC_APP_URL`
- Wildcard domain: `*.datcuatoi.vn`.

### API deployment

- Fastify deploy trên AWS Lightsail bằng Node.js/Docker.
- Production database: Prisma Postgres primary database.
- Environment:
  - `DATABASE_URL`
  - `JWT_ACCESS_SECRET`
  - `COOKIE_SECRET`
  - `CORS_ORIGINS`
  - `ROOT_DOMAIN`
  - Storage credentials
  - Email credentials
- Health check: `/health/ready`.

### Release order

1. Apply backward-compatible migration.
2. Deploy API.
3. Run smoke tests.
4. Deploy FE.
5. Verify root domain + tenant subdomain.
6. Monitor errors/latency.

## 10. Tính năng “full” nên chia thành ba mốc

### Mốc A — Production MVP

Bắt buộc để có khách hàng thật:

- Monorepo.
- PostgreSQL/Prisma thật.
- Auth + RBAC.
- Tenant isolation.
- Guest listing/detail.
- Admin post CRUD.
- Upload ảnh.
- Branding.
- Super Admin site/plan management.
- Subscription enforcement thủ công.
- Audit logs.
- Tests, backup, monitoring, deploy.

### Mốc B — Complete SaaS

- Renewal workflow.
- Lead inbox.
- Analytics.
- Email notifications.
- Custom domain.
- Import/export posts.
- Better SEO.
- Staff/agent accounts trong mỗi tenant.
- Activity/session management.

### Mốc C — Advanced product

- Payment gateway và invoice.
- Auto renewal.
- CRM pipeline.
- Appointment booking.
- Favorites.
- Property comparison.
- Advanced map search.
- Nearby amenities.
- Messaging integrations.
- Mobile/PWA.

Không nên đưa toàn bộ Mốc C vào launch đầu tiên; nó làm chậm việc kiểm chứng sản phẩm và tăng mạnh phạm vi security/operations.

## 11. Ước lượng thô

Với một developer full-time, đã có UI hiện tại:

- Phase 1–3: 2–3 tuần.
- Phase 4–6: 3–4 tuần.
- Phase 7–8: 2–3 tuần.
- Phase 9–11: 2–4 tuần.

Production MVP hợp lý: khoảng 9–14 tuần, tùy auth, upload, deployment và mức test.

Complete SaaS thường cần thêm 4–8 tuần.

Đây là ước lượng kỹ thuật, chưa gồm thời gian thay đổi yêu cầu, chuẩn bị nội dung, tích hợp payment phức tạp hoặc quy trình duyệt custom domain.

## 12. Definition of Done cho web hoàn chỉnh

- Không còn data nghiệp vụ hard-code.
- FE và API build/deploy độc lập.
- Tất cả form chính nối API và lưu database.
- Auth refresh/logout/reset password hoạt động.
- RBAC và tenant isolation có test tự động.
- Admin CRUD post + ảnh + branding hoàn chỉnh.
- Super Admin vận hành site/plan/subscription/account hoàn chỉnh.
- Guest chỉ thấy published posts của tenant hợp lệ.
- Inactive/expired tenant bị chặn đúng policy.
- Audit log bao phủ mutation quan trọng.
- Public pages đạt SEO và performance budget.
- Critical E2E tests pass.
- Backup, restore, monitoring và alert đã được kiểm tra.
- Staging và production có environment tách biệt.
- Có runbook xử lý deploy, migration và incident.

## 13. Open Questions cần chốt

1. FE deploy ở **Vercel**. ✅ Đã chốt
2. API Fastify deploy trên **AWS Lightsail**. ✅ Đã chốt
3. PostgreSQL dùng **Prisma Postgres primary database**. ✅ Đã chốt
4. Storage dùng **AWS S3**. ✅ Đã chốt
5. Payment có nằm trong bản launch đầu tiên không?
6. Custom domain có nằm trong bản launch đầu tiên không?
7. Một tenant chỉ có một ADMIN hay có nhiều nhân viên/agent?
8. Tin đăng cần workflow duyệt nội bộ hay admin publish trực tiếp?
9. Xóa post là hard delete hay archive/soft delete?
10. Có cần map trả phí và tìm kiếm theo bán kính ngay ở launch không?
11. Lead cần gửi email, Zalo, Telegram hay chỉ lưu dashboard?
12. Có cần import dữ liệu từ Excel ngay ở launch không?

## 13.1 Deployment decisions đã chốt

### Frontend — Vercel

- Deploy `apps/web`.
- Root domain: `datcuatoi.vn`.
- Wildcard domain: `*.datcuatoi.vn`.
- Preview deployment cho pull request.
- Environment production:
  - `NEXT_PUBLIC_API_URL=https://api.datcuatoi.vn`
  - `NEXT_PUBLIC_APP_URL=https://datcuatoi.vn`
  - `NEXT_PUBLIC_ROOT_DOMAIN=datcuatoi.vn`

### Backend — AWS Lightsail

- Deploy `apps/api` dưới dạng Docker container chạy Node.js.
- Lightsail là hạ tầng hiện tại, không phải dependency kiến trúc.
- Primary database: Prisma Postgres, region `ap-southeast-1`.
- Business code không được gọi metadata API của provider hoặc phụ thuộc filesystem cố định.
- Config, database, storage, email và domain đều được inject qua environment variables.
- File upload không lưu lâu dài trên disk của instance; dùng AWS S3.
- Health check, graceful shutdown và stateless API là yêu cầu bắt buộc để chuyển host không đổi code.
- Public domain: `api.datcuatoi.vn`.
- Reverse proxy bằng Caddy hoặc Nginx; HTTPS bằng Let's Encrypt.
- Fastify listen trên `0.0.0.0` và port do environment/runtime cung cấp.
- Health checks:
  - `/health/live`
  - `/health/ready`
- Log JSON gửi ra stdout và được rotate/ship tới monitoring.
- Database và storage credentials chỉ nằm trong environment/secrets trên server.
- Staging và production có environment tách biệt.

### CI/CD dự kiến

```text
GitHub push/merge
      │
      ├── Vercel tự build và deploy apps/web
      └── GitHub Actions
              ├── test/build apps/api
              ├── build và push Docker image
              └── deploy image lên AWS Lightsail
```

### Các quyết định deployment còn thiếu

- Custom domain `api.datcuatoi.vn` và DNS.
- Container registry: GitHub Container Registry hay AWS ECR.
- AWS S3 bucket đặt cùng `ap-southeast-1` hoặc region gần người dùng.

## 13.2 AWS S3 upload decision

### Luồng upload

```text
Admin Web
   │ 1. POST presign metadata
   ▼
Fastify API
   │ 2. Validate tenant, post, plan, MIME, size
   │ 3. Return presigned PUT URL + objectKey
   ▼
Admin Web ───── 4. PUT file trực tiếp ─────► AWS S3
   │
   │ 5. POST complete(objectKey, metadata)
   ▼
Fastify API
   │ 6. HEAD object trên S3
   │ 7. Lưu PropertyImage và AuditLog
   ▼
Post edit UI
```

### Object key

```text
sites/{siteId}/posts/{postId}/{imageId}/original.{ext}
```

Không nhận object key tùy ý từ client. API tự tạo key chứa `siteId` đã resolve.

### Bucket policy

- Block Public Access bật mặc định.
- Upload/download private qua presigned URL, hoặc public delivery qua CloudFront.
- Không dùng ACL per-object; dùng bucket ownership enforced.
- CORS chỉ cho Vercel production/preview domains cần thiết.
- Presigned upload hết hạn sau 5–10 phút.
- Giới hạn MIME: JPEG, PNG, WebP, AVIF.
- Giới hạn kích thước ban đầu: 10 MB/ảnh.
- Lifecycle dọn object tạm/orphan.
- IAM user/role chỉ có quyền cần thiết trên bucket/prefix.

### Environment

```env
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=datcuatoi-media
AWS_S3_PUBLIC_URL=https://cdn.datcuatoi.vn
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

Trên Lightsail, credentials để trong secrets/environment, không commit. Khi
chuyển sang ECS/EC2 có thể thay access key bằng IAM role mà không đổi storage
service interface.
- Monitoring: Sentry + uptime monitor hay AWS CloudWatch.

## 14. Bước triển khai tiếp theo

Sau khi duyệt plan:

1. Trả lời 12 Open Questions.
2. Chốt Mốc A là phạm vi implementation đầu tiên.
3. Bắt đầu Phase 1: chuyển code hiện tại sang `apps/web`.
4. Khởi tạo `apps/api`, `packages/contracts` và `packages/database`.
5. Giữ giao diện hiện tại hoạt động trong suốt migration.
